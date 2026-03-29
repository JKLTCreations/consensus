import { VerificationResult, VerificationReport, ExtractedClaim } from './types';
import { RankedClaim } from './claim-extractor';

export async function verifyClaimsWithSearch(
  rankedClaims: RankedClaim[],
  apiKey: string
): Promise<VerificationReport> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const claimsToVerify = rankedClaims.map(rc => ({
    text: rc.claim.raw_text,
    agent_id: rc.claim.agent_id,
    claim_type: rc.claim.claim_type,
    argument_index: rc.claim.argument_index,
  }));

  const claimList = claimsToVerify
    .map((c, i) => `${i + 1}. [${c.agent_id}] (${c.claim_type}): ${c.text}`)
    .join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305' as const, name: 'web_search', max_uses: 10 }],
      messages: [
        {
          role: 'user',
          content: `You are a fact-checker. Verify the following claims from a policy analysis using web search. For each claim, search for the most recent authoritative data.

CLAIMS TO VERIFY:
${claimList}

After searching, provide your final response as ONLY valid JSON (no markdown fences):
{
  "results": [
    {
      "claim_index": 0,
      "claim_text": "the original claim text",
      "status": "verified|contradicted|outdated|unverifiable",
      "correct_value": "the actual current value if different, or null",
      "source_name": "name of authoritative source",
      "source_url": "URL of source",
      "confidence_note": "brief note on confidence level and recency of data"
    }
  ]
}

Rules:
- "verified": claim is substantially correct per current data
- "contradicted": claim is factually wrong (provide correct_value)
- "outdated": claim was once true but data has changed (provide correct_value)
- "unverifiable": cannot find authoritative source to confirm or deny
- Prefer government sources (CBO, BLS, Census, Fed) over think tanks
- Note the date of the data you found
- Return results for ALL claims listed above`
        }
      ],
    });

    // Extract the final text response from the message
    let responseText = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    const parsed = parseJSON(responseText);
    if (!parsed || !Array.isArray(parsed.results)) {
      return createFallbackReport(claimsToVerify);
    }

    const verifiedClaims: VerificationResult[] = parsed.results.map((r: Record<string, unknown>, idx: number) => {
      const claim = claimsToVerify[typeof r.claim_index === 'number' ? r.claim_index : idx];
      return {
        claim_text: (r.claim_text as string) || (claim ? claim.text : ''),
        agent_id: claim ? claim.agent_id : '',
        argument_index: claim ? claim.argument_index : 0,
        status: validateStatus(r.status as string),
        correct_value: (r.correct_value as string) || undefined,
        source_url: (r.source_url as string) || undefined,
        source_name: (r.source_name as string) || undefined,
        confidence_note: (r.confidence_note as string) || 'No confidence note provided',
      };
    });

    const verified = verifiedClaims.filter(v => v.status === 'verified').length;
    const contradicted = verifiedClaims.filter(v => v.status === 'contradicted').length;
    const outdated = verifiedClaims.filter(v => v.status === 'outdated').length;

    return {
      verified_claims: verifiedClaims,
      verification_summary: `${verified} verified, ${contradicted} contradicted, ${outdated} outdated out of ${verifiedClaims.length} claims checked`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return createFallbackReport(claimsToVerify);
  }
}

function validateStatus(status: string): VerificationResult['status'] {
  const valid = ['verified', 'unverifiable', 'contradicted', 'outdated'] as const;
  if (valid.includes(status as typeof valid[number])) {
    return status as VerificationResult['status'];
  }
  return 'unverifiable';
}

function createFallbackReport(claims: { text: string; agent_id: string; argument_index: number }[]): VerificationReport {
  return {
    verified_claims: claims.map(c => ({
      claim_text: c.text,
      agent_id: c.agent_id,
      argument_index: c.argument_index,
      status: 'unverifiable' as const,
      confidence_note: 'Verification service unavailable — marked as unverifiable',
    })),
    verification_summary: `Verification unavailable — ${claims.length} claims marked as unverifiable`,
    timestamp: new Date().toISOString(),
  };
}

function parseJSON(text: string): Record<string, unknown> | null {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
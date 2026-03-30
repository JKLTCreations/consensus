import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analysisAgents, getAgent } from '@/lib/agents';
import {
  Round0Assumptions,
  Round1Analysis,
  Round2Analysis,
  VerificationReport,
  EnhancedDiscrepancyReport,
  AssumptionConflict,
} from '@/lib/types';
import {
  buildRound0Prompt,
  buildRound1Prompt,
  buildDiscrepancyPrompt,
  buildRound2Prompt,
  buildConsensusPrompt,
} from '@/lib/prompts';
import { extractClaims, rankClaimsForVerification } from '@/lib/claim-extractor';
import { findProgrammaticDiscrepancies } from '@/lib/claim-comparator';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// ━━━ PER-AGENT API CLIENTS ━━━

function getClientForAgent(agentId: string): Anthropic {
  const keyMap: Record<string, string | undefined> = {
    fiscal: process.env.ANTHROPIC_API_KEY_FISCAL,
    progressive: process.env.ANTHROPIC_API_KEY_PROGRESSIVE,
    macro: process.env.ANTHROPIC_API_KEY_MACRO,
    welfare: process.env.ANTHROPIC_API_KEY_WELFARE,
    legal: process.env.ANTHROPIC_API_KEY_LEGAL,
    moderator: process.env.ANTHROPIC_API_KEY_MODERATOR,
  };

  const apiKey = keyMap[agentId];
  if (!apiKey) {
    throw new Error(`Missing API key for agent: ${agentId}. Set ANTHROPIC_API_KEY_${agentId.toUpperCase()} in .env.local`);
  }

  return new Anthropic({ apiKey });
}

// ━━━ API CALL WITH RETRY ━━━

async function callAgent(
  agentId: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = MAX_TOKENS,
  retryCount = 0,
): Promise<Record<string, unknown>> {
  const client = getClientForAgent(agentId);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    return parseJSON(text);
  } catch (err: unknown) {
    if (err instanceof Anthropic.RateLimitError && retryCount < 3) {
      const backoff = [60000, 75000, 90000][retryCount];
      await sleep(backoff);
      return callAgent(agentId, systemPrompt, userPrompt, maxTokens, retryCount + 1);
    }
    throw err;
  }
}

function parseJSON(text: string): Record<string, unknown> {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ━━━ ASSUMPTION CONFLICT DETECTION ━━━

function detectAssumptionConflicts(
  round0: Record<string, Round0Assumptions>
): AssumptionConflict[] {
  const conflicts: AssumptionConflict[] = [];
  const dimensions = [
    'scope_assumptions',
    'timeline_assumptions',
    'economic_context_assumptions',
    'population_assumptions',
    'key_unstated_assumptions',
  ] as const;

  const agentIds = Object.keys(round0);

  for (const dim of dimensions) {
    for (let i = 0; i < agentIds.length; i++) {
      for (let j = i + 1; j < agentIds.length; j++) {
        const aId = agentIds[i];
        const bId = agentIds[j];
        const aAssumptions = round0[aId]?.[dim] || [];
        const bAssumptions = round0[bId]?.[dim] || [];

        for (const aText of aAssumptions) {
          for (const bText of bAssumptions) {
            if (assumptionsConflict(aText, bText)) {
              conflicts.push({
                dimension: dim.replace(/_/g, ' '),
                agents_and_assumptions: [
                  { agent: aId, assumption: aText },
                  { agent: bId, assumption: bText },
                ],
                conflict_description: `Conflicting assumptions: ${aId} assumes "${aText.slice(0, 80)}..." vs ${bId} assumes "${bText.slice(0, 80)}..."`,
              });
            }
          }
        }
      }
    }
  }

  return conflicts.slice(0, 5); // Cap at 5 most relevant
}

function assumptionsConflict(a: string, b: string): boolean {
  const opposites = [
    ['immediate', 'phased'], ['increase', 'decrease'], ['short-term', 'long-term'],
    ['expand', 'reduce'], ['growth', 'contraction'], ['surplus', 'deficit'],
    ['unified', 'separated'], ['all', 'targeted'], ['universal', 'means-tested'],
  ];

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  for (const [word1, word2] of opposites) {
    if ((aLower.includes(word1) && bLower.includes(word2)) ||
        (aLower.includes(word2) && bLower.includes(word1))) {
      return true;
    }
  }

  // Check for numerical divergence on same topic
  const aNumbers = a.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const bNumbers = b.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const sharedWords = new Set(
    aLower.split(/\s+/).filter(w => w.length > 4 && bLower.includes(w))
  );

  if (sharedWords.size >= 2 && aNumbers.length > 0 && bNumbers.length > 0) {
    for (const an of aNumbers) {
      for (const bn of bNumbers) {
        if (an > 0 && bn > 0) {
          const divergence = Math.abs(an - bn) / Math.max(an, bn);
          if (divergence > 0.3) return true;
        }
      }
    }
  }

  return false;
}

// ━━━ ROUTE HANDLER ━━━

export async function POST(req: NextRequest) {
  let proposal: string;
  try {
    const body = await req.json();
    proposal = body.proposal;
    if (!proposal || typeof proposal !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing proposal text' }), { status: 400 });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const agentIds = analysisAgents.map(a => a.id);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(event) + '\n'));
      };

      try {
        // ━━━ ROUND 0: ASSUMPTION FRAMING (parallel, each agent own key) ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 0 });
        }

        const round0Results = await Promise.all(
          agentIds.map(async (id) => {
            const agent = getAgent(id)!;
            const data = await callAgent(
              id,
              agent.systemPrompt,
              buildRound0Prompt(proposal),
            );
            return { id, data };
          })
        );

        const round0: Record<string, Round0Assumptions> = {};
        for (const { id, data } of round0Results) {
          round0[id] = data as unknown as Round0Assumptions;
          send({ type: 'agent_complete', agent: id, round: 0, data });
        }
        send({ type: 'round_complete', round: 0 });

        // Detect assumption conflicts programmatically
        const conflicts = detectAssumptionConflicts(round0);
        send({ type: 'assumption_conflicts', data: conflicts });

        // ━━━ ROUND 1: INDEPENDENT ANALYSIS (parallel) ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 1 });
        }

        const round1Results = await Promise.all(
          agentIds.map(async (id) => {
            const agent = getAgent(id)!;
            const data = await callAgent(
              id,
              agent.systemPrompt,
              buildRound1Prompt(proposal, round0[id], conflicts),
            );
            return { id, data };
          })
        );

        const round1: Record<string, Round1Analysis> = {};
        for (const { id, data } of round1Results) {
          round1[id] = data as unknown as Round1Analysis;
          send({ type: 'agent_complete', agent: id, round: 1, data });
        }
        send({ type: 'round_complete', round: 1 });

        // ━━━ CLAIM EXTRACTION & PROGRAMMATIC DISCREPANCY DETECTION ━━━
        const claims = extractClaims(round1);
        const programmaticDiscrepancies = findProgrammaticDiscrepancies(claims);
        send({ type: 'programmatic_discrepancies', data: programmaticDiscrepancies });

        // ━━━ ROUND 1.5: MODERATOR DISCREPANCY DETECTION ━━━
        send({ type: 'agent_start', agent: 'moderator', round: 1.5 });

        const verification: VerificationReport | null = null; // Skip verification to save API calls

        const moderator = getAgent('moderator')!;
        const discrepancyData = await callAgent(
          'moderator',
          moderator.systemPrompt,
          buildDiscrepancyPrompt(round1, conflicts, verification, programmaticDiscrepancies),
        );

        const discrepancies: EnhancedDiscrepancyReport = {
          discrepancies: [
            ...((discrepancyData.validated_programmatic as unknown[]) || []),
            ...((discrepancyData.additional_discrepancies as unknown[]) || []),
          ] as EnhancedDiscrepancyReport['discrepancies'],
          verified_resolutions: (discrepancyData.verified_resolutions || []) as EnhancedDiscrepancyReport['verified_resolutions'],
          consensus_areas: (discrepancyData.consensus_areas || []) as string[],
          programmatic_detection_count: programmaticDiscrepancies.length,
          llm_detection_count: ((discrepancyData.additional_discrepancies as unknown[]) || []).length,
          false_positive_count: (discrepancyData.false_positive_count as number) || 0,
        };

        send({ type: 'agent_complete', agent: 'moderator', round: 1.5, data: discrepancies });
        send({ type: 'discrepancies_detected', data: discrepancies });

        // ━━━ ROUND 2: CONFLICT RESOLUTION (parallel) ━━━
        for (const id of agentIds) {
          send({ type: 'agent_start', agent: id, round: 2 });
        }

        const round2Results = await Promise.all(
          agentIds.map(async (id) => {
            const agent = getAgent(id)!;
            const data = await callAgent(
              id,
              agent.systemPrompt,
              buildRound2Prompt(id, proposal, round0[id], round1[id], round1, verification, conflicts, discrepancies),
            );
            return { id, data };
          })
        );

        const round2: Record<string, Round2Analysis> = {};
        for (const { id, data } of round2Results) {
          round2[id] = data as unknown as Round2Analysis;
          send({ type: 'agent_complete', agent: id, round: 2, data });
        }
        send({ type: 'round_complete', round: 2 });

        // ━━━ ROUND 3: CONSENSUS SYNTHESIS (moderator) ━━━
        send({ type: 'agent_start', agent: 'moderator', round: 3 });

        const consensusData = await callAgent(
          'moderator',
          moderator.systemPrompt,
          buildConsensusPrompt(proposal, round0, conflicts, round1, verification, discrepancies, round2),
          8192, // More tokens for the full synthesis
        );

        send({ type: 'agent_complete', agent: 'moderator', round: 3, data: consensusData });
        send({ type: 'consensus', data: consensusData });

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}

import { ExtractedClaim, Round1Analysis } from './types';

const TAG_REGEX = /\[(STAT|SOURCE|CAUSAL):\s*([^\]]+)\]/gi;
const DOLLAR_REGEX = /\$[\d,.]+\s*(?:trillion|billion|million|T|B|M)?/gi;
const PERCENT_REGEX = /\d+(?:\.\d+)?%/g;
const YEAR_NUMBER_REGEX = /(?:in |by |since |from )\d{4}[^.]*\d+/gi;

export function extractClaims(analyses: Record<string, Round1Analysis>): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];

  for (const [agentId, analysis] of Object.entries(analyses)) {
    // Extract from position text
    extractTaggedClaims(analysis.position, agentId, -1, claims);

    // Extract from each argument's evidence field
    analysis.arguments.forEach((arg, index) => {
      const taggedCount = extractTaggedClaims(arg.evidence, agentId, index, claims);

      // Fallback: extract untagged numerical claims if no tags found
      if (taggedCount === 0) {
        extractUntaggedClaims(arg.evidence, agentId, index, claims);
      }

      // Also check the point field for claims
      extractTaggedClaims(arg.point, agentId, index, claims);
    });

    // Extract from risks
    analysis.risks.forEach((risk, index) => {
      extractTaggedClaims(risk, agentId, index + 100, claims);
    });
  }

  return claims;
}

function extractTaggedClaims(
  text: string,
  agentId: string,
  argumentIndex: number,
  claims: ExtractedClaim[]
): number {
  let count = 0;
  let match;
  const regex = new RegExp(TAG_REGEX.source, TAG_REGEX.flags);

  while ((match = regex.exec(text)) !== null) {
    const claimType = match[1].toLowerCase() as 'stat' | 'source' | 'causal';
    claims.push({
      agent_id: agentId,
      claim_type: claimType,
      raw_text: match[2].trim(),
      context: text,
      argument_index: argumentIndex,
    });
    count++;
  }

  return count;
}

function extractUntaggedClaims(
  text: string,
  agentId: string,
  argumentIndex: number,
  claims: ExtractedClaim[]
): void {
  // Extract dollar amounts
  let match;
  const dollarRegex = new RegExp(DOLLAR_REGEX.source, DOLLAR_REGEX.flags);
  while ((match = dollarRegex.exec(text)) !== null) {
    const sentence = extractSentence(text, match.index);
    claims.push({
      agent_id: agentId,
      claim_type: 'stat',
      raw_text: sentence,
      context: text,
      argument_index: argumentIndex,
    });
  }

  // Extract percentages in context
  const percentRegex = new RegExp(PERCENT_REGEX.source, PERCENT_REGEX.flags);
  while ((match = percentRegex.exec(text)) !== null) {
    const sentence = extractSentence(text, match.index);
    // Avoid duplicates from dollar extraction
    if (!claims.some(c => c.raw_text === sentence && c.agent_id === agentId)) {
      claims.push({
        agent_id: agentId,
        claim_type: 'stat',
        raw_text: sentence,
        context: text,
        argument_index: argumentIndex,
      });
    }
  }
}

function extractSentence(text: string, position: number): string {
  // Find sentence boundaries around the position
  let start = position;
  let end = position;

  while (start > 0 && text[start - 1] !== '.' && text[start - 1] !== '\n') start--;
  while (end < text.length && text[end] !== '.' && text[end] !== '\n') end++;

  return text.slice(start, end + 1).trim();
}

export interface RankedClaim {
  claim: ExtractedClaim;
  score: number;
  reasons: string[];
}

const HIGH_IMPACT_KEYWORDS = ['gdp', 'unemployment', 'inflation', 'debt', 'gini', 'poverty', 'deficit', 'revenue', 'spending', 'growth'];

export function rankClaimsForVerification(claims: ExtractedClaim[]): RankedClaim[] {
  const scored: RankedClaim[] = claims.map(claim => {
    let score = 0;
    const reasons: string[] = [];
    const lowerText = claim.raw_text.toLowerCase();

    // Cross-agent citations (same stat, different agents)
    const crossAgentMatches = claims.filter(
      c => c.agent_id !== claim.agent_id && textSimilarity(c.raw_text, claim.raw_text) > 0.5
    );
    if (crossAgentMatches.length > 0) {
      score += 10 * crossAgentMatches.length;
      reasons.push(`cross-agent citation (${crossAgentMatches.length} matches)`);
    }

    // Large dollar amounts
    const dollarMatch = lowerText.match(/\$([\d,.]+)\s*(trillion|billion|t|b)/i);
    if (dollarMatch) {
      const amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
      const unit = dollarMatch[2].toLowerCase();
      if (unit === 'trillion' || unit === 't' || amount > 1000) {
        score += 8;
        reasons.push('trillion-dollar claim');
      } else if (unit === 'billion' || unit === 'b') {
        score += 5;
        reasons.push('billion-dollar claim');
      }
    }

    // Claim type bonus
    if (claim.claim_type === 'stat') {
      score += 3;
      reasons.push('statistical claim');
    } else if (claim.claim_type === 'causal') {
      score += 2;
      reasons.push('causal claim');
    }

    // High-impact keywords
    for (const keyword of HIGH_IMPACT_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        score += 4;
        reasons.push(`high-impact: ${keyword}`);
        break;
      }
    }

    return { claim, score, reasons };
  });

  // Sort by score descending, return top 8
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }
  return intersection / Math.max(wordsA.size, wordsB.size);
}
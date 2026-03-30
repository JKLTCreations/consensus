import { ExtractedClaim, ProgrammaticDiscrepancy } from './types';

const POSITIVE_DIRECTION = ['increase', 'grow', 'rise', 'boost', 'expand', 'gain', 'improve', 'higher', 'more', 'up', 'benefit', 'create', 'add', 'stimulate'];
const NEGATIVE_DIRECTION = ['decrease', 'shrink', 'fall', 'reduce', 'contract', 'loss', 'worsen', 'lower', 'less', 'down', 'harm', 'destroy', 'eliminate', 'suppress'];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  gdp: ['gdp', 'gross domestic product', 'economic growth', 'economic output'],
  unemployment: ['unemployment', 'jobless', 'employment rate', 'job loss', 'job creation'],
  inflation: ['inflation', 'cpi', 'pce', 'price level', 'price increase', 'consumer prices'],
  tax: ['tax', 'taxation', 'tax rate', 'tax revenue', 'tax burden'],
  debt: ['debt', 'deficit', 'national debt', 'federal debt', 'debt-to-gdp'],
  wages: ['wage', 'salary', 'income', 'pay', 'earnings', 'compensation', 'minimum wage'],
  spending: ['spending', 'expenditure', 'budget', 'fiscal', 'appropriation'],
  healthcare: ['healthcare', 'health care', 'insurance', 'premium', 'medicaid', 'medicare', 'uninsured'],
  housing: ['housing', 'rent', 'mortgage', 'home price', 'shelter'],
  trade: ['trade', 'tariff', 'import', 'export', 'trade deficit', 'trade balance'],
};

export function findProgrammaticDiscrepancies(claims: ExtractedClaim[]): ProgrammaticDiscrepancy[] {
  const discrepancies: ProgrammaticDiscrepancy[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i];
      const b = claims[j];

      // Only compare claims from different agents
      if (a.agent_id === b.agent_id) continue;

      const pairKey = [a.agent_id, b.agent_id].sort().join('|');
      const topicSim = getTopicSimilarity(a.raw_text, b.raw_text);

      if (topicSim < 0.3) continue; // Not about the same topic

      // Check for numerical conflicts
      const numConflict = checkNumericalConflict(a, b);
      if (numConflict) {
        const dedupKey = `${pairKey}|num|${numConflict}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          discrepancies.push({
            type: 'numerical_conflict',
            claim_a: { agent_id: a.agent_id, text: a.raw_text, argument_index: a.argument_index },
            claim_b: { agent_id: b.agent_id, text: b.raw_text, argument_index: b.argument_index },
            conflict_description: numConflict,
            detected_by: 'programmatic',
          });
        }
      }

      // Check for source conflicts (same source, different interpretation)
      if (a.claim_type === 'source' && b.claim_type === 'source') {
        const sourceSim = getJaccardSimilarity(a.raw_text, b.raw_text);
        if (sourceSim > 0.6) {
          const dedupKey = `${pairKey}|src|${a.raw_text.slice(0, 30)}`;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            discrepancies.push({
              type: 'source_conflict',
              claim_a: { agent_id: a.agent_id, text: a.raw_text, argument_index: a.argument_index },
              claim_b: { agent_id: b.agent_id, text: b.raw_text, argument_index: b.argument_index },
              conflict_description: `Same source cited by ${a.agent_id} and ${b.agent_id} — may interpret differently`,
              detected_by: 'programmatic',
            });
          }
        }
      }

      // Check for causal conflicts (same topic, opposing directions)
      if (a.claim_type === 'causal' || b.claim_type === 'causal') {
        const causalConflict = checkCausalConflict(a, b);
        if (causalConflict) {
          const dedupKey = `${pairKey}|causal|${causalConflict.slice(0, 40)}`;
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey);
            discrepancies.push({
              type: 'causal_conflict',
              claim_a: { agent_id: a.agent_id, text: a.raw_text, argument_index: a.argument_index },
              claim_b: { agent_id: b.agent_id, text: b.raw_text, argument_index: b.argument_index },
              conflict_description: causalConflict,
              detected_by: 'programmatic',
            });
          }
        }
      }
    }
  }

  return discrepancies;
}

function extractNumbers(text: string): { value: number; unit: string; context: string }[] {
  const results: { value: number; unit: string; context: string }[] = [];

  // Dollar amounts
  const dollarRegex = /\$([\d,.]+)\s*(trillion|billion|million|T|B|M)?/gi;
  let match;
  while ((match = dollarRegex.exec(text)) !== null) {
    let value = parseFloat(match[1].replace(/,/g, ''));
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'trillion' || unit === 't') value *= 1e12;
    else if (unit === 'billion' || unit === 'b') value *= 1e9;
    else if (unit === 'million' || unit === 'm') value *= 1e6;
    results.push({ value, unit: 'dollars', context: match[0] });
  }

  // Percentages
  const pctRegex = /([\d,.]+)%/g;
  while ((match = pctRegex.exec(text)) !== null) {
    results.push({
      value: parseFloat(match[1].replace(/,/g, '')),
      unit: 'percent',
      context: text.slice(Math.max(0, match.index - 20), match.index + match[0].length + 20).trim(),
    });
  }

  // Multipliers
  const multRegex = /([\d,.]+)x/gi;
  while ((match = multRegex.exec(text)) !== null) {
    results.push({
      value: parseFloat(match[1].replace(/,/g, '')),
      unit: 'multiplier',
      context: match[0],
    });
  }

  return results;
}

function checkNumericalConflict(a: ExtractedClaim, b: ExtractedClaim): string | null {
  const numsA = extractNumbers(a.raw_text);
  const numsB = extractNumbers(b.raw_text);

  for (const na of numsA) {
    for (const nb of numsB) {
      if (na.unit !== nb.unit) continue;
      if (na.value === 0 || nb.value === 0) continue;

      const divergence = Math.abs(na.value - nb.value) / Math.max(na.value, nb.value);
      if (divergence > 0.1) {
        return `${a.agent_id} cites ${na.context} but ${b.agent_id} cites ${nb.context} (${(divergence * 100).toFixed(0)}% divergence)`;
      }
    }
  }

  return null;
}

function getTopicSimilarity(textA: string, textB: string): number {
  const topicsA = getTopics(textA);
  const topicsB = getTopics(textB);

  if (topicsA.size === 0 || topicsB.size === 0) return 0;

  let intersection = 0;
  for (const t of topicsA) {
    if (topicsB.has(t)) intersection++;
  }

  return intersection / Math.min(topicsA.size, topicsB.size);
}

function getTopics(text: string): Set<string> {
  const lower = text.toLowerCase();
  const topics = new Set<string>();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      topics.add(topic);
    }
  }
  return topics;
}

function getDirection(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  let posCount = 0;
  let negCount = 0;

  for (const word of POSITIVE_DIRECTION) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of NEGATIVE_DIRECTION) {
    if (lower.includes(word)) negCount++;
  }

  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

function checkCausalConflict(a: ExtractedClaim, b: ExtractedClaim): string | null {
  const dirA = getDirection(a.raw_text);
  const dirB = getDirection(b.raw_text);

  if (dirA === 'neutral' || dirB === 'neutral') return null;
  if (dirA === dirB) return null;

  const sharedTopics = getTopics(a.raw_text);
  const bTopics = getTopics(b.raw_text);
  const shared: string[] = [];
  for (const t of sharedTopics) {
    if (bTopics.has(t)) shared.push(t);
  }

  if (shared.length === 0) return null;

  return `On ${shared.join('/')}: ${a.agent_id} predicts ${dirA} effect but ${b.agent_id} predicts ${dirB} effect`;
}

function getJaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 && wordsB.size === 0) return 0;
  let intersection = 0;
  const union = new Set([...wordsA, ...wordsB]);
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }
  return intersection / union.size;
}
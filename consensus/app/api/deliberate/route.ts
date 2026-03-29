import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { agents, analysisAgents, getAgent } from '@/lib/agents';
import {
  buildRound0Prompt,
  buildRound1Prompt,
  buildDiscrepancyPrompt,
  buildRound2Prompt,
  buildConsensusPrompt,
} from '@/lib/prompts';
import { extractClaims, rankClaimsForVerification } from '@/lib/claim-extractor';
import { findProgrammaticDiscrepancies } from '@/lib/claim-comparator';
import { verifyClaimsWithSearch } from '@/lib/verification';
import {
  Round0Assumptions,
  AssumptionConflict,
  Round1Analysis,
  VerificationReport,
  EnhancedDiscrepancyReport,
  ProgrammaticDiscrepancy,
  Round2Analysis,
  Discrepancy,
} from '@/lib/types';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2048;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'sk-ant-xxxxx') {
    return new Response(JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(event) + '\n'));
      };

      try {
        // ━━━ ROUND 0: ASSUMPTION FRAMING ━━━
        const round0: Record<string, Round0Assumptions> = {};

        for (const agent of analysisAgents) {
          send({ type: 'agent_start', agent: agent.id, round: 0 });

          const assumptions = await callAgent(client, agent.systemPrompt, buildRound0Prompt(proposal));
          round0[agent.id] = assumptions as Round0Assumptions;

          send({ type: 'agent_complete', agent: agent.id, round: 0, data: assumptions });
        }

        // Programmatic assumption conflict detection
        const assumptionConflicts = detectAssumptionConflicts(round0);
        send({ type: 'round_complete', round: 0 });
        send({ type: 'assumption_conflicts', data: assumptionConflicts });

        // ━━━ ROUND 1: INDEPENDENT ANALYSIS ━━━
        const round1: Record<string, Round1Analysis> = {};

        for (const agent of analysisAgents) {
          send({ type: 'agent_start', agent: agent.id, round: 1 });

          const analysis = await callAgent(
            client,
            agent.systemPrompt,
            buildRound1Prompt(proposal, round0[agent.id], assumptionConflicts)
          );

          // Validate completeness, retry once if needed
          let validated = analysis as Round1Analysis;
          if (!validated.arguments || validated.arguments.length < 3 || !validated.risks || validated.risks.length < 2) {
            const retried = await callAgent(
              client,
              agent.systemPrompt,
              buildRound1Prompt(proposal, round0[agent.id], assumptionConflicts) +
                '\n\nYour previous response was incomplete. Ensure ALL fields are filled with 4-5 arguments, 3-4 risks, and 2-3 conditions. No empty arrays.'
            );
            validated = retried as Round1Analysis;
          }

          round1[agent.id] = validated;
          send({ type: 'agent_complete', agent: agent.id, round: 1, data: validated });
        }

        send({ type: 'round_complete', round: 1 });

        // ━━━ ROUND 1.25: EVIDENCE VERIFICATION ━━━
        const allClaims = extractClaims(round1);
        const rankedClaims = rankClaimsForVerification(allClaims);

        let verification: VerificationReport | null = null;
        if (rankedClaims.length > 0) {
          verification = await verifyClaimsWithSearch(rankedClaims, apiKey);
          send({ type: 'verification_complete', data: verification });
        }

        // ━━━ ROUND 1.5: DISCREPANCY DETECTION ━━━
        // Stage A: Programmatic pre-pass
        const programmaticDiscrepancies = findProgrammaticDiscrepancies(allClaims);
        send({ type: 'programmatic_discrepancies', data: programmaticDiscrepancies });

        // Stage B: LLM enrichment
        const moderator = getAgent('moderator')!;
        send({ type: 'agent_start', agent: 'moderator', round: 1.5 });

        const discrepancyRaw = await callAgent(
          client,
          moderator.systemPrompt,
          buildDiscrepancyPrompt(round1, assumptionConflicts, verification, programmaticDiscrepancies)
        );

        const discrepancyResult = discrepancyRaw as {
          validated_programmatic?: Discrepancy[];
          additional_discrepancies?: Discrepancy[];
          verified_resolutions?: { issue: string; resolved_by: string; correct_position: string; agent_who_was_wrong: string }[];
          consensus_areas?: string[];
          false_positive_count?: number;
        };

        const enhancedReport: EnhancedDiscrepancyReport = {
          discrepancies: [
            ...(discrepancyResult.validated_programmatic || []),
            ...(discrepancyResult.additional_discrepancies || []),
          ],
          verified_resolutions: discrepancyResult.verified_resolutions || [],
          consensus_areas: discrepancyResult.consensus_areas || [],
          programmatic_detection_count: programmaticDiscrepancies.length,
          llm_detection_count: (discrepancyResult.additional_discrepancies || []).length,
          false_positive_count: discrepancyResult.false_positive_count || 0,
        };

        send({ type: 'agent_complete', agent: 'moderator', round: 1.5, data: enhancedReport });
        send({ type: 'discrepancies_detected', data: enhancedReport });

        // ━━━ ROUND 2: TARGETED CONFLICT RESOLUTION ━━━
        const round2: Record<string, Round2Analysis> = {};

        for (const agent of analysisAgents) {
          send({ type: 'agent_start', agent: agent.id, round: 2 });

          const response = await callAgent(
            client,
            agent.systemPrompt,
            buildRound2Prompt(
              agent.id,
              proposal,
              round0[agent.id],
              round1[agent.id],
              round1,
              verification,
              assumptionConflicts,
              enhancedReport
            )
          );

          round2[agent.id] = response as Round2Analysis;
          send({ type: 'agent_complete', agent: agent.id, round: 2, data: response });
        }

        send({ type: 'round_complete', round: 2 });

        // ━━━ ROUND 3: RATIONAL CONSENSUS SYNTHESIS ━━━
        send({ type: 'agent_start', agent: 'moderator', round: 3 });

        const consensus = await callAgent(
          client,
          moderator.systemPrompt,
          buildConsensusPrompt(proposal, round0, assumptionConflicts, round1, verification, enhancedReport, round2)
        );

        send({ type: 'agent_complete', agent: 'moderator', round: 3, data: consensus });
        send({ type: 'consensus', data: consensus });

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';

        if (message.includes('401') || message.includes('403')) {
          send({ type: 'error', message: 'Invalid API key. Check ANTHROPIC_API_KEY in .env.local.' });
        } else if (message.includes('429')) {
          send({ type: 'error', message: 'Rate limited. Wait 60 seconds and try again.' });
        } else {
          send({ type: 'error', message });
        }
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

async function callAgent(
  client: Anthropic,
  systemPrompt: string,
  userPrompt: string,
  retryCount = 0
): Promise<Record<string, unknown>> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }

    return parseJSON(text);
  } catch (error) {
    if (retryCount < 1) {
      return callAgent(client, systemPrompt, userPrompt, retryCount + 1);
    }
    throw error;
  }
}

function parseJSON(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Return raw text as position fallback
        return { position: cleaned, arguments: [], risks: [], conditions: [] };
      }
    }
    return { position: cleaned, arguments: [], risks: [], conditions: [] };
  }
}

// ━━━ ASSUMPTION CONFLICT DETECTION ━━━
const CONTRADICTION_PAIRS: [string, string][] = [
  ['all', 'excluding'], ['immediate', 'phased'], ['universal', 'targeted'],
  ['mandatory', 'voluntary'], ['federal', 'state'], ['short-term', 'long-term'],
  ['permanent', 'temporary'], ['full', 'partial'], ['increase', 'decrease'],
  ['growth', 'recession'], ['inflation', 'deflation'], ['surplus', 'deficit'],
];

function detectAssumptionConflicts(round0: Record<string, Round0Assumptions>): AssumptionConflict[] {
  const conflicts: AssumptionConflict[] = [];
  const agentIds = Object.keys(round0);
  const categories: (keyof Round0Assumptions)[] = [
    'scope_assumptions', 'timeline_assumptions', 'economic_context_assumptions',
    'population_assumptions', 'key_unstated_assumptions'
  ];

  for (const category of categories) {
    // Gather all assumptions for this category across agents
    const agentAssumptions: { agent: string; assumption: string }[] = [];
    for (const agentId of agentIds) {
      const assumptions = round0[agentId]?.[category] || [];
      for (const assumption of assumptions) {
        agentAssumptions.push({ agent: agentId, assumption });
      }
    }

    // Pairwise comparison
    for (let i = 0; i < agentAssumptions.length; i++) {
      for (let j = i + 1; j < agentAssumptions.length; j++) {
        if (agentAssumptions[i].agent === agentAssumptions[j].agent) continue;

        const conflict = findContradiction(agentAssumptions[i].assumption, agentAssumptions[j].assumption);
        if (conflict) {
          // Check if we already have a conflict for these same agents in this dimension
          const exists = conflicts.some(c =>
            c.dimension === category &&
            c.agents_and_assumptions.some(a => a.agent === agentAssumptions[i].agent) &&
            c.agents_and_assumptions.some(a => a.agent === agentAssumptions[j].agent)
          );
          if (!exists) {
            conflicts.push({
              dimension: category.replace('_', ' '),
              agents_and_assumptions: [agentAssumptions[i], agentAssumptions[j]],
              conflict_description: conflict,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

function findContradiction(a: string, b: string): string | null {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();

  // Check keyword contradiction pairs
  for (const [word1, word2] of CONTRADICTION_PAIRS) {
    if ((lowerA.includes(word1) && lowerB.includes(word2)) ||
        (lowerA.includes(word2) && lowerB.includes(word1))) {
      return `Conflicting assumptions: "${a}" vs "${b}" (${word1}/${word2} disagreement)`;
    }
  }

  // Check number divergence on same topic
  const numbersA = extractAssumptionNumbers(a);
  const numbersB = extractAssumptionNumbers(b);
  for (const na of numbersA) {
    for (const nb of numbersB) {
      if (na.value !== nb.value && Math.abs(na.value - nb.value) / Math.max(na.value, nb.value) > 0.2) {
        return `Different numerical assumptions: "${a}" vs "${b}"`;
      }
    }
  }

  return null;
}

function extractAssumptionNumbers(text: string): { value: number }[] {
  const results: { value: number }[] = [];
  const matches = text.match(/\d+(?:\.\d+)?/g);
  if (matches) {
    for (const m of matches) {
      const val = parseFloat(m);
      if (val > 0 && val < 1e15) results.push({ value: val });
    }
  }
  return results;
}
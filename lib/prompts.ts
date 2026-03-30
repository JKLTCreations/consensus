import { Round0Assumptions, AssumptionConflict, Round1Analysis, Round2Analysis, VerificationReport, EnhancedDiscrepancyReport } from './types';

export function buildRound0Prompt(proposal: string): string {
  return `You are about to analyze the following policy proposal. Before analyzing, declare your assumptions.

POLICY PROPOSAL:
${proposal}

Respond with ONLY valid JSON (no markdown fences) in this exact format:
{
  "scope_assumptions": ["assumption 1", "assumption 2"],
  "timeline_assumptions": ["assumption 1"],
  "economic_context_assumptions": ["assumption 1"],
  "population_assumptions": ["assumption 1"],
  "key_unstated_assumptions": ["assumption 1"]
}

Rules:
- scope_assumptions: 2-3 assumptions about what the policy covers and doesn't cover
- timeline_assumptions: 1-2 assumptions about implementation timeline and duration
- economic_context_assumptions: 1-2 assumptions about current/projected economic conditions
- population_assumptions: 1-2 assumptions about who is affected and how
- key_unstated_assumptions: 1-2 assumptions the proposal doesn't state but you believe are critical
- Be specific with numbers, dates, and named populations
- Each assumption should be a single clear sentence`;
}

export function buildRound1Prompt(
  proposal: string,
  ownAssumptions: Round0Assumptions,
  conflicts: AssumptionConflict[]
): string {
  const conflictText = conflicts.length > 0
    ? `\n\nASSUMPTION CONFLICTS DETECTED:\n${conflicts.map(c =>
        `- ${c.dimension}: ${c.conflict_description}\n  Agents involved: ${c.agents_and_assumptions.map(a => `${a.agent}: "${a.assumption}"`).join(' vs ')}`
      ).join('\n')}`
    : '';

  return `Analyze this policy proposal. You declared these assumptions in Round 0:
${JSON.stringify(ownAssumptions, null, 2)}
${conflictText}

POLICY PROPOSAL:
${proposal}

Respond with ONLY valid JSON (no markdown fences) in this exact format:
{
  "position": "SUPPORT/OPPOSE/CONDITIONALLY SUPPORT — [your clear stance with 1-2 sentence summary]",
  "arguments": [
    {"point": "argument title", "evidence": "detailed evidence with [STAT:], [SOURCE:], and [CAUSAL:] tags"},
    {"point": "argument title", "evidence": "detailed evidence with tags"},
    {"point": "argument title", "evidence": "detailed evidence with tags"},
    {"point": "argument title", "evidence": "detailed evidence with tags"}
  ],
  "risks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "conditions": ["condition for support 1", "condition 2"]
}

Rules:
- Start position with SUPPORT, OPPOSE, or CONDITIONALLY SUPPORT
- 4-5 arguments, each with specific numbers, dates, dollar amounts, named studies
- Every evidence field MUST contain [STAT:], [SOURCE:], or [CAUSAL:] tags
- 3-4 specific risks with concrete scenarios
- 2-3 conditions that would change your position
- If assumption conflicts affect your analysis, acknowledge them
- No empty arrays. No hedging. No "more research needed."`;
}

export function buildVerificationPrompt(claims: { text: string; agent_id: string; claim_type: string }[]): string {
  const claimList = claims.map((c, i) => `${i + 1}. [${c.agent_id}] (${c.claim_type}): ${c.text}`).join('\n');

  return `You are a fact-checker. Verify the following claims from a policy analysis using web search. For each claim, search for the most recent authoritative data.

CLAIMS TO VERIFY:
${claimList}

After searching, respond with ONLY valid JSON (no markdown fences):
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
- Always prefer government sources (CBO, BLS, Census, Fed) over think tanks
- Note the date of the data you found`;
}

export function buildDiscrepancyPrompt(
  analyses: Record<string, Round1Analysis>,
  conflicts: AssumptionConflict[],
  verification: VerificationReport | null,
  programmaticDiscrepancies: { type: string; claim_a: { agent_id: string; text: string }; claim_b: { agent_id: string; text: string }; conflict_description: string }[]
): string {
  const analysisText = Object.entries(analyses)
    .map(([id, a]) => `[${id}]: Position: ${a.position}\nArguments: ${a.arguments.map(arg => `${arg.point}: ${arg.evidence}`).join('\n')}\nRisks: ${a.risks.join('; ')}\nConditions: ${a.conditions.join('; ')}`)
    .join('\n\n');

  const verificationText = verification
    ? `\nVERIFICATION RESULTS:\n${verification.verified_claims.map(v => `- "${v.claim_text}" → ${v.status}${v.correct_value ? ` (correct: ${v.correct_value})` : ''}`).join('\n')}`
    : '';

  const programmaticText = programmaticDiscrepancies.length > 0
    ? `\nPROGRAMMATIC DISCREPANCY PRE-PASS (code-detected conflicts):\n${programmaticDiscrepancies.map((d, i) => `${i + 1}. [${d.type}] ${d.claim_a.agent_id} vs ${d.claim_b.agent_id}: ${d.conflict_description}`).join('\n')}`
    : '';

  const conflictText = conflicts.length > 0
    ? `\nASSUMPTION CONFLICTS:\n${conflicts.map(c => `- ${c.dimension}: ${c.conflict_description}`).join('\n')}`
    : '';

  return `You are the Moderator. Analyze discrepancies across all agent analyses.

AGENT ANALYSES:
${analysisText}
${conflictText}
${verificationText}
${programmaticText}

Respond with ONLY valid JSON (no markdown fences):
{
  "validated_programmatic": [
    {
      "issue": "description of the conflict",
      "agent_a": "agent_id",
      "claim_a": "agent A's claim",
      "agent_b": "agent_id",
      "claim_b": "agent B's claim",
      "severity": "high|medium|low",
      "resolution_hint": "how this might be resolved",
      "detected_by": "programmatic",
      "stems_from_assumption_conflict": true/false
    }
  ],
  "additional_discrepancies": [
    {
      "issue": "description",
      "agent_a": "agent_id",
      "claim_a": "claim text",
      "agent_b": "agent_id",
      "claim_b": "claim text",
      "severity": "high|medium|low",
      "resolution_hint": "hint",
      "detected_by": "llm",
      "stems_from_assumption_conflict": true/false
    }
  ],
  "verified_resolutions": [
    {
      "issue": "what was disputed",
      "resolved_by": "verification",
      "correct_position": "the verified correct position",
      "agent_who_was_wrong": "agent_id"
    }
  ],
  "consensus_areas": ["area where 3+ agents agree"],
  "false_positive_count": 0
}

Rules:
- Validate each programmatic detection: remove false positives where numbers refer to different metrics
- Find additional semantic/logical conflicts the code missed
- Identify discrepancies already resolved by verification results
- Note which discrepancies stem from assumption conflicts (framing differences vs factual disputes)
- Be specific about severity: HIGH = core disagreement affecting recommendation, MEDIUM = significant but not central, LOW = minor or definitional`;
}

export function buildRound2Prompt(
  agentId: string,
  proposal: string,
  ownAssumptions: Round0Assumptions,
  ownAnalysis: Round1Analysis,
  allAnalyses: Record<string, Round1Analysis>,
  verification: VerificationReport | null,
  conflicts: AssumptionConflict[],
  discrepancies: EnhancedDiscrepancyReport
): string {
  const otherAnalyses = Object.entries(allAnalyses)
    .filter(([id]) => id !== agentId)
    .map(([id, a]) => `[${id}]: ${a.position}\nKey arguments: ${a.arguments.map(arg => arg.point).join(', ')}`)
    .join('\n');

  const myVerifications = verification
    ? verification.verified_claims.filter(v => v.agent_id === agentId)
    : [];
  const verificationText = myVerifications.length > 0
    ? `\nVERIFICATION RESULTS FOR YOUR CLAIMS:\n${myVerifications.map(v => `- "${v.claim_text}" → ${v.status}${v.correct_value ? ` (correct: ${v.correct_value})` : ''} [${v.source_name || 'unknown source'}]`).join('\n')}`
    : '';

  const myDiscrepancies = discrepancies.discrepancies.filter(
    d => d.agent_a === agentId || d.agent_b === agentId
  );
  const discrepancyText = myDiscrepancies.length > 0
    ? `\nDISCREPANCIES INVOLVING YOU:\n${myDiscrepancies.map(d => `- [${d.severity}] ${d.issue}: You said "${d.agent_a === agentId ? d.claim_a : d.claim_b}" vs ${d.agent_a === agentId ? d.agent_b : d.agent_a} said "${d.agent_a === agentId ? d.claim_b : d.claim_a}". Hint: ${d.resolution_hint}${d.stems_from_assumption_conflict ? ' [FRAMING CONFLICT]' : ''}`).join('\n')}`
    : '';

  const myConflicts = conflicts.filter(c =>
    c.agents_and_assumptions.some(a => a.agent === agentId)
  );
  const conflictText = myConflicts.length > 0
    ? `\nASSUMPTION CONFLICTS INVOLVING YOU:\n${myConflicts.map(c => `- ${c.dimension}: ${c.conflict_description}`).join('\n')}`
    : '';

  return `You are responding to Round 1 analyses from other agents. Review and respond to conflicts.

POLICY PROPOSAL: ${proposal}

YOUR ROUND 0 ASSUMPTIONS:
${JSON.stringify(ownAssumptions, null, 2)}

YOUR ROUND 1 ANALYSIS:
Position: ${ownAnalysis.position}
Arguments: ${ownAnalysis.arguments.map(a => `${a.point}: ${a.evidence}`).join('\n')}

OTHER AGENTS' ANALYSES:
${otherAnalyses}
${verificationText}
${discrepancyText}
${conflictText}

Respond with ONLY valid JSON (no markdown fences):
{
  "verification_responses": [
    {"claim": "your claim that was verified/contradicted", "verification_status": "verified|contradicted|outdated", "my_response": "your response to the verification result"}
  ],
  "discrepancy_responses": [
    {"issue": "the discrepancy", "my_response": "defend|concede|partially_concede", "stems_from_assumption_conflict": true/false, "reasoning": "why", "updated_claim": "your revised claim if any"}
  ],
  "agreements": [
    {"agent": "agent_id", "point": "what you agree with", "reason": "why you agree"}
  ],
  "rebuttals": [
    {"agent": "agent_id", "point": "what you dispute", "counter_argument": "your counter with evidence"}
  ],
  "revised_position": "your updated position after considering all evidence",
  "compromises": ["specific compromise proposal 1", "compromise 2"],
  "confidence": 7
}

Rules:
- Address EVERY discrepancy involving you: defend with STRONGER evidence, concede, or partially concede
- If a claim was ✗ CONTRADICTED: accept the correction or explain why verification is inapplicable
- You MUST concede at least 1 point — refusing all concessions = intellectual dishonesty
- If disagreement stems from assumption conflict, flag it as a framing difference
- Reference other agents by name
- 2-3 agreements, 1-3 rebuttals, 2-3 compromises
- Confidence is 1-10 scale based on evidence strength
- No empty arrays`;
}

export function buildConsensusPrompt(
  proposal: string,
  round0: Record<string, Round0Assumptions>,
  conflicts: AssumptionConflict[],
  round1: Record<string, Round1Analysis>,
  verification: VerificationReport | null,
  discrepancies: EnhancedDiscrepancyReport,
  round2: Record<string, Round2Analysis>
): string {
  const round0Text = Object.entries(round0)
    .map(([id, a]) => `[${id}]: ${JSON.stringify(a)}`)
    .join('\n');

  const round1Text = Object.entries(round1)
    .map(([id, a]) => `[${id}]: ${a.position}\nArguments: ${a.arguments.map(arg => `${arg.point}: ${arg.evidence}`).join('\n')}\nRisks: ${a.risks.join('; ')}\nConditions: ${a.conditions.join('; ')}`)
    .join('\n\n');

  const verificationText = verification
    ? `Verified: ${verification.verified_claims.filter(v => v.status === 'verified').length}, Contradicted: ${verification.verified_claims.filter(v => v.status === 'contradicted').length}, Outdated: ${verification.verified_claims.filter(v => v.status === 'outdated').length}\nDetails:\n${verification.verified_claims.map(v => `- "${v.claim_text}" [${v.agent_id}] → ${v.status}${v.correct_value ? ` (correct: ${v.correct_value})` : ''}`).join('\n')}`
    : 'No verification performed.';

  const discrepancyText = `Discrepancies: ${discrepancies.discrepancies.length} (${discrepancies.programmatic_detection_count} by code, ${discrepancies.llm_detection_count} by review)\nPre-resolved by verification: ${discrepancies.verified_resolutions.length}\nConsensus areas: ${discrepancies.consensus_areas.join('; ')}`;

  const round2Text = Object.entries(round2)
    .map(([id, a]) => `[${id}]: Revised position: ${a.revised_position}\nConcessions: ${a.discrepancy_responses.filter(d => d.my_response !== 'defend').map(d => d.issue).join(', ') || 'none'}\nAgreements: ${a.agreements.map(ag => `with ${ag.agent} on ${ag.point}`).join(', ')}\nCompromises: ${a.compromises.join('; ')}\nConfidence: ${a.confidence}/10`)
    .join('\n\n');

  return `You are the Moderator. Synthesize ALL deliberation data into a final consensus report.

POLICY PROPOSAL: ${proposal}

ROUND 0 ASSUMPTIONS:
${round0Text}

ASSUMPTION CONFLICTS:
${conflicts.map(c => `- ${c.dimension}: ${c.conflict_description}`).join('\n')}

ROUND 1 ANALYSES:
${round1Text}

VERIFICATION RESULTS:
${verificationText}

DISCREPANCY REPORT:
${discrepancyText}

ROUND 2 RESPONSES:
${round2Text}

Use this EVIDENCE HIERARCHY to resolve remaining conflicts:
1. VERIFIED CLAIMS (confirmed by web search) — highest weight
2. CBO/GAO/BLS/BEA official data
3. Peer-reviewed research / meta-analyses
4. Federal Reserve analysis
5. Historical precedent (directly comparable US policies)
6. OECD/IMF international comparisons
7. Think tank analysis (average left and right estimates)
8. Theoretical models without empirical validation — lowest weight
Claims ✗ CONTRADICTED rank below tier 8 unless compellingly rebutted in Round 2.

RATIONALITY SCORING per agent:
- Evidence quality (what tier are their sources?)
- Internal consistency (do their arguments contradict each other?)
- Concession integrity (did they concede when evidence demanded it?)
- Assumption transparency (did they acknowledge their framing?)
- Verification responsiveness (did they address contradicted claims?)

Respond with ONLY valid JSON (no markdown fences):
{
  "spectrum": {
    "left_label": "Oppose [policy-specific label]",
    "right_label": "Implement [policy-specific label]",
    "policy_question": "Should [specific policy question]?",
    "agent_positions": [
      {"agent_id": "fiscal", "position": 0, "stance_label": "short label", "one_line_summary": "one sentence"},
      {"agent_id": "progressive", "position": 0, "stance_label": "short label", "one_line_summary": "one sentence"},
      {"agent_id": "macro", "position": 0, "stance_label": "short label", "one_line_summary": "one sentence"},
      {"agent_id": "welfare", "position": 0, "stance_label": "short label", "one_line_summary": "one sentence"},
      {"agent_id": "legal", "position": 0, "stance_label": "short label", "one_line_summary": "one sentence"}
    ],
    "consensus_direction": "One-liner summarizing where the majority leans"
  },
  "assumption_impact": [
    {"assumption_dimension": "dimension", "impact": "how this affected the debate", "recommended_framing": "suggested framing"}
  ],
  "verification_impact": {
    "claims_verified": 0,
    "claims_contradicted": 0,
    "claims_outdated": 0,
    "impact_summary": "how verification changed the debate",
    "agents_most_accurate": ["agent_id"],
    "agents_least_accurate": ["agent_id"]
  },
  "resolved_discrepancies": [
    {"issue": "what was disputed", "resolution": "how it was resolved", "winning_position": "the evidence-backed position", "resolution_source": "programmatic|llm_detected|verification|round2_concession", "dissenting_agents": ["agent_id"]}
  ],
  "areas_of_agreement": ["area 1", "area 2", "area 3"],
  "areas_of_compromise": [
    {"position": "specific compromise", "reasoning": "why this works", "supporting_agents": ["agent_id"]}
  ],
  "irreconcilable_disagreements": [
    {"issue": "the disagreement", "side_a": "position A with agents", "side_b": "position B with agents", "why_unresolvable": "usually VALUES not FACTS"}
  ],
  "rational_recommendation": "The single most evidence-backed policy position with specific parameters (dollar amounts, timelines, conditions)",
  "decision_points": ["decision 1", "decision 2", "decision 3"],
  "agent_rationality_scores": {
    "fiscal": {"score": 0, "reasoning": "explanation"},
    "progressive": {"score": 0, "reasoning": "explanation"},
    "macro": {"score": 0, "reasoning": "explanation"},
    "welfare": {"score": 0, "reasoning": "explanation"},
    "legal": {"score": 0, "reasoning": "explanation"}
  },
  "consensus_score": 0
}

Rules:
- spectrum.agent_positions: position 0=strongly oppose, 50=neutral, 100=strongly support. Use the agent's REVISED Round 2 position.
- spectrum labels must be specific to the policy (not generic "oppose"/"support")
- spectrum.stance_label: 2-4 words (e.g. "Conditional Support", "Strong Opposition")
- spectrum.one_line_summary: Max 15 words summarizing the agent's final stance
- 2-4 assumption_impact entries
- 3-5 areas_of_agreement
- 2-4 areas_of_compromise with specific parameters
- 1-3 irreconcilable_disagreements — label as VALUES vs FACTS disputes
- rational_recommendation must be specific (dollar amounts, timelines, conditions)
- 3-5 decision_points as questions for human policymakers
- Rationality scores 1-100 per agent, weighted by evidence hierarchy
- consensus_score 0-100 (0 = total deadlock, 100 = unanimous agreement)
- Be scrupulously fair — map the decision space, don't make the decision`;
}
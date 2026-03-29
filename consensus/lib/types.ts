// Round 0
export interface Round0Assumptions {
  scope_assumptions: string[];
  timeline_assumptions: string[];
  economic_context_assumptions: string[];
  population_assumptions: string[];
  key_unstated_assumptions: string[];
}

export interface AssumptionConflict {
  dimension: string;
  agents_and_assumptions: { agent: string; assumption: string }[];
  conflict_description: string;
}

// Agents & Round 1
export interface Agent {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  systemPrompt: string;
}

export interface Round1Analysis {
  position: string;
  arguments: { point: string; evidence: string }[];
  risks: string[];
  conditions: string[];
}

// Claim Extraction & Verification
export interface ExtractedClaim {
  agent_id: string;
  claim_type: 'stat' | 'source' | 'causal';
  raw_text: string;
  context: string;
  argument_index: number;
}

export interface VerificationResult {
  claim_text: string;
  agent_id: string;
  argument_index: number;
  status: 'verified' | 'unverifiable' | 'contradicted' | 'outdated';
  correct_value?: string;
  source_url?: string;
  source_name?: string;
  confidence_note: string;
}

export interface VerificationReport {
  verified_claims: VerificationResult[];
  verification_summary: string;
  timestamp: string;
}

// Discrepancies
export interface ProgrammaticDiscrepancy {
  type: 'numerical_conflict' | 'source_conflict' | 'causal_conflict';
  claim_a: { agent_id: string; text: string; argument_index: number };
  claim_b: { agent_id: string; text: string; argument_index: number };
  conflict_description: string;
  detected_by: 'programmatic';
}

export interface Discrepancy {
  issue: string;
  agent_a: string;
  claim_a: string;
  agent_b: string;
  claim_b: string;
  severity: "high" | "medium" | "low";
  resolution_hint: string;
  detected_by: 'programmatic' | 'llm' | 'verification';
  stems_from_assumption_conflict: boolean;
}

export interface VerifiedResolution {
  issue: string;
  resolved_by: string;
  correct_position: string;
  agent_who_was_wrong: string;
}

export interface EnhancedDiscrepancyReport {
  discrepancies: Discrepancy[];
  verified_resolutions: VerifiedResolution[];
  consensus_areas: string[];
  programmatic_detection_count: number;
  llm_detection_count: number;
  false_positive_count: number;
}

export interface DiscrepancyResponse {
  issue: string;
  my_response: "defend" | "concede" | "partially_concede";
  stems_from_assumption_conflict: boolean;
  reasoning: string;
  updated_claim: string;
}

// Round 2
export interface VerificationResponse {
  claim: string;
  verification_status: string;
  my_response: string;
}

export interface Round2Analysis {
  verification_responses: VerificationResponse[];
  discrepancy_responses: DiscrepancyResponse[];
  agreements: { agent: string; point: string; reason: string }[];
  rebuttals: { agent: string; point: string; counter_argument: string }[];
  revised_position: string;
  compromises: string[];
  confidence: number;
}

// Consensus
export interface AssumptionImpact {
  assumption_dimension: string;
  impact: string;
  recommended_framing: string;
}

export interface VerificationImpact {
  claims_verified: number;
  claims_contradicted: number;
  claims_outdated: number;
  impact_summary: string;
  agents_most_accurate: string[];
  agents_least_accurate: string[];
}

export interface ResolvedDiscrepancy {
  issue: string;
  resolution: string;
  winning_position: string;
  resolution_source: 'programmatic' | 'llm_detected' | 'verification' | 'round2_concession';
  dissenting_agents: string[];
}

export interface ConsensusReport {
  assumption_impact: AssumptionImpact[];
  verification_impact: VerificationImpact;
  resolved_discrepancies: ResolvedDiscrepancy[];
  areas_of_agreement: string[];
  areas_of_compromise: { position: string; reasoning: string; supporting_agents: string[] }[];
  irreconcilable_disagreements: { issue: string; side_a: string; side_b: string; why_unresolvable: string }[];
  rational_recommendation: string;
  decision_points: string[];
  agent_rationality_scores: Record<string, { score: number; reasoning: string }>;
  consensus_score: number;
}

// State
export interface DeliberationState {
  phase: "input" | "deliberating" | "complete" | "error";
  proposal: string;
  round0: Record<string, Round0Assumptions>;
  assumptionConflicts: AssumptionConflict[];
  round1: Record<string, Round1Analysis>;
  verification: VerificationReport | null;
  discrepancies: EnhancedDiscrepancyReport | null;
  round2: Record<string, Round2Analysis>;
  consensus: ConsensusReport | null;
  activeAgent: string | null;
  activeRound: number;
  error: string | null;
}

export type DeliberationEvent =
  | { type: "agent_start"; agent: string; round: number }
  | { type: "agent_complete"; agent: string; round: number; data: unknown }
  | { type: "round_complete"; round: number }
  | { type: "assumption_conflicts"; data: AssumptionConflict[] }
  | { type: "verification_complete"; data: VerificationReport }
  | { type: "programmatic_discrepancies"; data: ProgrammaticDiscrepancy[] }
  | { type: "discrepancies_detected"; data: EnhancedDiscrepancyReport }
  | { type: "consensus"; data: ConsensusReport }
  | { type: "error"; message: string };
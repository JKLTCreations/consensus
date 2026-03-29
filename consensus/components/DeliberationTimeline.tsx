'use client';

import { DeliberationState } from '@/lib/types';
import { analysisAgents } from '@/lib/agents';
import AssumptionFramingPanel from './AssumptionFramingPanel';
import AgentAnalysisPanel from './AgentAnalysisPanel';
import VerificationPanel from './VerificationPanel';
import DiscrepancyPanel from './DiscrepancyPanel';

interface DeliberationTimelineProps {
  state: DeliberationState;
}

export default function DeliberationTimeline({ state }: DeliberationTimelineProps) {
  const hasRound0 = Object.keys(state.round0).length > 0;
  const hasRound1 = Object.keys(state.round1).length > 0;
  const hasVerification = state.verification !== null;
  const hasDiscrepancies = state.discrepancies !== null;
  const hasRound2 = Object.keys(state.round2).length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Round 0 */}
      {hasRound0 && (
        <section>
          <AssumptionFramingPanel
            assumptions={state.round0}
            conflicts={state.assumptionConflicts}
          />
        </section>
      )}

      {/* Round 1 */}
      {hasRound1 && (
        <section>
          <h3 className="font-mono-label text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
            ROUND 1 — INDEPENDENT ANALYSIS
          </h3>
          <div className="flex flex-col gap-2">
            {analysisAgents.map(agent => {
              const analysis = state.round1[agent.id];
              if (!analysis) return null;
              const agentVerifications = state.verification?.verified_claims.filter(v => v.agent_id === agent.id);
              return (
                <AgentAnalysisPanel
                  key={agent.id}
                  agentId={agent.id}
                  round={1}
                  analysis={analysis}
                  verifications={agentVerifications}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Verification */}
      {hasVerification && (
        <section>
          <VerificationPanel report={state.verification!} />
        </section>
      )}

      {/* Discrepancies */}
      {hasDiscrepancies && (
        <section>
          <DiscrepancyPanel report={state.discrepancies!} />
        </section>
      )}

      {/* Round 2 */}
      {hasRound2 && (
        <section>
          <h3 className="font-mono-label text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
            ROUND 2 — CONFLICT RESOLUTION
          </h3>
          <div className="flex flex-col gap-2">
            {analysisAgents.map(agent => {
              const analysis = state.round1[agent.id];
              const round2Data = state.round2[agent.id];
              if (!analysis || !round2Data) return null;
              return (
                <AgentAnalysisPanel
                  key={agent.id}
                  agentId={agent.id}
                  round={2}
                  analysis={analysis}
                  round2={round2Data}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { DeliberationState } from '@/lib/types';
import { analysisAgents } from '@/lib/agents';
import AssumptionFramingPanel from './AssumptionFramingPanel';
import AgentAnalysisPanel from './AgentAnalysisPanel';
import VerificationPanel from './VerificationPanel';
import DiscrepancyPanel from './DiscrepancyPanel';

interface DeliberationTimelineProps {
  state: DeliberationState;
}

function RoundSection({ title, summary, defaultOpen = false, children }: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          ▶
        </span>
        <span className="font-mono-label" style={{ fontSize: 10, flexShrink: 0, color: 'rgba(255,255,255,0.4)' }}>
          {title}
        </span>
        {!open && summary && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
            — {summary}
          </span>
        )}
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </button>
      {open && (
        <div style={{ paddingTop: 8 }}>
          {children}
        </div>
      )}
    </section>
  );
}

export default function DeliberationTimeline({ state }: DeliberationTimelineProps) {
  const hasRound0 = Object.keys(state.round0).length > 0;
  const hasRound1 = Object.keys(state.round1).length > 0;
  const hasVerification = state.verification !== null;
  const hasDiscrepancies = state.discrepancies !== null;
  const hasRound2 = Object.keys(state.round2).length > 0;

  const round1AgentCount = Object.keys(state.round1).length;
  const round2AgentCount = Object.keys(state.round2).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Round 0 */}
      {hasRound0 && (
        <RoundSection
          title="ROUND 0 — ASSUMPTION FRAMING"
          summary={`${Object.keys(state.round0).length} agents, ${state.assumptionConflicts.length} conflicts`}
        >
          <div className="chamber-card" style={{ padding: '20px 24px', borderRadius: 8 }}>
            <AssumptionFramingPanel
              assumptions={state.round0}
              conflicts={state.assumptionConflicts}
            />
          </div>
        </RoundSection>
      )}

      {/* Round 1 */}
      {hasRound1 && (
        <RoundSection
          title="ROUND 1 — INDEPENDENT ANALYSIS"
          summary={`${round1AgentCount} agent${round1AgentCount !== 1 ? 's' : ''} reported`}
          defaultOpen
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        </RoundSection>
      )}

      {/* Verification */}
      {hasVerification && (
        <RoundSection
          title="EVIDENCE VERIFICATION"
          summary={`${state.verification!.verified_claims.length} claims checked`}
        >
          <div className="chamber-card" style={{ padding: '20px 24px', borderRadius: 8 }}>
            <VerificationPanel report={state.verification!} />
          </div>
        </RoundSection>
      )}

      {/* Discrepancies */}
      {hasDiscrepancies && (
        <RoundSection
          title="DISCREPANCY DETECTION"
          summary={`${state.discrepancies!.discrepancies.length} found`}
        >
          <div className="chamber-card" style={{ padding: '20px 24px', borderRadius: 8 }}>
            <DiscrepancyPanel report={state.discrepancies!} />
          </div>
        </RoundSection>
      )}

      {/* Round 2 */}
      {hasRound2 && (
        <RoundSection
          title="ROUND 2 — CONFLICT RESOLUTION"
          summary={`${round2AgentCount} agent${round2AgentCount !== 1 ? 's' : ''} revised`}
          defaultOpen
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        </RoundSection>
      )}
    </div>
  );
}

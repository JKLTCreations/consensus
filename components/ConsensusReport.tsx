'use client';

import { ConsensusReport as ConsensusReportType } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import CollapsibleSection from './CollapsibleSection';
import ResolvedDiscrepancyCard from './ResolvedDiscrepancyCard';

interface ConsensusReportProps {
  report: ConsensusReportType;
}

export default function ConsensusReport({ report }: ConsensusReportProps) {
  const verified = report.verification_impact.claims_verified;
  const contradicted = report.verification_impact.claims_contradicted;
  const outdated = report.verification_impact.claims_outdated;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Perspective disclaimer */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
        This analysis represents five analytical perspectives. It does not capture the lived experiences of all affected communities.
      </p>

      {/* Verification Impact */}
      <CollapsibleSection
        title="VERIFICATION IMPACT"
        summary={`${verified} verified, ${contradicted} contradicted, ${outdated} outdated`}
      >
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
          {report.verification_impact.impact_summary}
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          {report.verification_impact.agents_most_accurate.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              Most accurate: {report.verification_impact.agents_most_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
            </span>
          )}
          {report.verification_impact.agents_least_accurate.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              Least accurate: {report.verification_impact.agents_least_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
            </span>
          )}
        </div>
      </CollapsibleSection>

      {/* Assumption Impact */}
      {report.assumption_impact.length > 0 && (
        <CollapsibleSection
          title={`ASSUMPTION IMPACT (${report.assumption_impact.length})`}
          summary={`${report.assumption_impact.length} dimension${report.assumption_impact.length !== 1 ? 's' : ''} affected`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.assumption_impact.map((ai, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < report.assumption_impact.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <p className="font-mono-label" style={{ fontSize: 8, marginBottom: 4, color: 'rgba(255,255,255,0.3)' }}>
                  {ai.assumption_dimension}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>
                  {ai.impact}
                </p>
                <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>
                  Recommended: {ai.recommended_framing}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Resolved Discrepancies */}
      {report.resolved_discrepancies.length > 0 && (
        <CollapsibleSection
          title={`RESOLVED DISCREPANCIES (${report.resolved_discrepancies.length})`}
          summary={`${report.resolved_discrepancies.length} resolved`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 10 }}>
            {report.resolved_discrepancies.map((rd, i) => (
              <ResolvedDiscrepancyCard key={i} discrepancy={rd} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Agreement & Compromise */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="chamber-card" style={{ padding: '18px 20px', borderRadius: 8 }}>
          <CollapsibleSection
            title={`AGREEMENT (${report.areas_of_agreement.length})`}
            summary={`${report.areas_of_agreement.length} area${report.areas_of_agreement.length !== 1 ? 's' : ''}`}
            defaultOpen
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.areas_of_agreement.map((area, i) => (
                <p key={i} style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>
                  {area}
                </p>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        <div className="chamber-card" style={{ padding: '18px 20px', borderRadius: 8 }}>
          <CollapsibleSection
            title={`COMPROMISE (${report.areas_of_compromise.length})`}
            summary={`${report.areas_of_compromise.length} area${report.areas_of_compromise.length !== 1 ? 's' : ''}`}
            defaultOpen
          >
            {report.areas_of_compromise.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {report.areas_of_compromise.map((comp, i) => (
                  <div key={i} style={{ paddingBottom: 10, borderBottom: i < report.areas_of_compromise.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <p style={{ fontSize: 12, marginBottom: 4, color: 'rgba(255,255,255,0.55)' }}>
                      {comp.position}
                    </p>
                    <p style={{ fontSize: 11, marginBottom: 6, lineHeight: 1.5, color: 'rgba(255,255,255,0.35)' }}>
                      {comp.reasoning}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {comp.supporting_agents.map(id => {
                        const agent = getAgent(id);
                        return (
                          <span
                            key={id}
                            className="font-mono-label"
                            style={{
                              fontSize: 8,
                              padding: '2px 6px',
                              borderRadius: 4,
                              color: 'rgba(255,255,255,0.4)',
                              background: 'rgba(255,255,255,0.04)',
                            }}
                          >
                            {agent?.shortName || id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No compromise areas identified.</p>
            )}
          </CollapsibleSection>
        </div>
      </div>

      {/* Irreconcilable Disagreements */}
      {report.irreconcilable_disagreements.length > 0 && (
        <CollapsibleSection
          title={`IRRECONCILABLE DISAGREEMENTS (${report.irreconcilable_disagreements.length})`}
          summary={`${report.irreconcilable_disagreements.length} unresolved`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.irreconcilable_disagreements.map((dis, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 18px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p style={{ fontSize: 12, marginBottom: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {dis.issue}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div style={{ padding: '10px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label" style={{ fontSize: 8, marginBottom: 4, color: 'rgba(255,255,255,0.3)' }}>POSITION A</p>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>{dis.side_a}</p>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label" style={{ fontSize: 8, marginBottom: 4, color: 'rgba(255,255,255,0.3)' }}>POSITION B</p>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)' }}>{dis.side_b}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>
                  {dis.why_unresolvable}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Rationality Scores */}
      <CollapsibleSection
        title="RATIONALITY SCORES"
        summary={`${Object.keys(report.agent_rationality_scores).length} agents scored`}
      >
        <RationalityScoresInline scores={report.agent_rationality_scores} />
      </CollapsibleSection>

      {/* Decision Points — always visible */}
      <div className="chamber-card" style={{ padding: '20px 24px', borderRadius: 8 }}>
        <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 4, color: 'rgba(255,255,255,0.4)' }}>
          DECISION POINTS
        </p>
        <p style={{ fontSize: 11, marginBottom: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>
          These choices remain after structured deliberation. The system mapped the terrain — humans navigate it.
        </p>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
          {report.decision_points.map((dp, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span className="font-mono-label" style={{ fontSize: 11, flexShrink: 0, width: 20, textAlign: 'right', color: 'rgba(255,255,255,0.3)' }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
                {dp}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function RationalityScoresInline({ scores }: { scores: Record<string, { score: number; reasoning: string }> }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(([agentId, { score, reasoning }]) => {
        const agent = getAgent(agentId);
        if (!agent) return null;
        return (
          <div key={agentId}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span style={{ fontSize: 11, flexShrink: 0 }}>{agent.icon}</span>
              <span className="font-mono-label" style={{ fontSize: 9, width: 80, color: 'rgba(255,255,255,0.5)' }}>
                {agent.shortName}
              </span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ width: `${score}%`, height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.2)', transition: 'width 0.5s ease' }} />
              </div>
              <span className="font-mono-label" style={{ fontSize: 11, width: 24, textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>
                {score}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', paddingLeft: 101 }}>
              {reasoning}
            </p>
          </div>
        );
      })}
    </div>
  );
}

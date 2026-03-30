'use client';

import { ConsensusReport as ConsensusReportType } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import ConsensusMeter from './ConsensusMeter';
import RationalRecommendation from './RationalRecommendation';
import RationalityScores from './RationalityScores';
import ResolvedDiscrepancyCard from './ResolvedDiscrepancyCard';

interface ConsensusReportProps {
  report: ConsensusReportType;
}

export default function ConsensusReport({ report }: ConsensusReportProps) {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Perspective disclaimer */}
      <div
        className="chamber-card"
        style={{ padding: '14px 20px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}
      >
        This analysis represents five analytical perspectives. It does not capture the lived experiences of all affected communities.
      </div>

      {/* Top section: Meter + Recommendation side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Consensus Meter */}
        <div className="chamber-card animate-scale-in" style={{ padding: '24px', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ConsensusMeter score={report.consensus_score} />
        </div>

        {/* Evidence-based recommendation */}
        <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <RationalRecommendation recommendation={report.rational_recommendation} />
        </div>
      </div>

      {/* Verification + Assumption Impact side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Verification Impact */}
        <div className="chamber-card" style={{ padding: '22px 24px', borderRadius: 8 }}>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--verification-verified)' }}>
            VERIFICATION IMPACT
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-verified)' }}>
              {report.verification_impact.claims_verified} verified
            </span>
            <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-contradicted)' }}>
              {report.verification_impact.claims_contradicted} contradicted
            </span>
            <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-outdated)' }}>
              {report.verification_impact.claims_outdated} outdated
            </span>
          </div>
          <p style={{ fontSize: 12, marginBottom: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>
            {report.verification_impact.impact_summary}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.verification_impact.agents_most_accurate.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--consensus-agree)' }}>
                Most accurate: {report.verification_impact.agents_most_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
              </span>
            )}
            {report.verification_impact.agents_least_accurate.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--consensus-disagree)' }}>
                Least accurate: {report.verification_impact.agents_least_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Assumption Impact */}
        <div className="chamber-card" style={{ padding: '22px 24px', borderRadius: 8 }}>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-compromise)' }}>
            ASSUMPTION IMPACT
          </p>
          {report.assumption_impact.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.assumption_impact.map((ai, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < report.assumption_impact.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 6, color: 'var(--consensus-compromise)' }}>
                    {ai.assumption_dimension}
                  </p>
                  <p style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.5, color: 'rgba(255,255,255,0.5)' }}>
                    {ai.impact}
                  </p>
                  <p style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>
                    Recommended: {ai.recommended_framing}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No significant assumption conflicts detected.</p>
          )}
        </div>
      </div>

      {/* Resolved Discrepancies */}
      {report.resolved_discrepancies.length > 0 && (
        <div>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-agree)' }}>
            RESOLVED DISCREPANCIES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
            {report.resolved_discrepancies.map((rd, i) => (
              <ResolvedDiscrepancyCard key={i} discrepancy={rd} />
            ))}
          </div>
        </div>
      )}

      {/* Agreement + Compromise side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Areas of Agreement */}
        <div className="chamber-card" style={{ padding: '22px 24px', borderRadius: 8 }}>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-agree)' }}>
            AGREEMENT
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.areas_of_agreement.map((area, i) => (
              <p key={i} style={{ fontSize: 12, paddingLeft: 14, lineHeight: 1.5, color: 'rgba(78, 205, 196, 0.7)' }}>
                &#10003; {area}
              </p>
            ))}
          </div>
        </div>

        {/* Areas of Compromise */}
        <div className="chamber-card" style={{ padding: '22px 24px', borderRadius: 8 }}>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-compromise)' }}>
            COMPROMISE
          </p>
          {report.areas_of_compromise.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {report.areas_of_compromise.map((comp, i) => (
                <div key={i} style={{ paddingBottom: 14, borderBottom: i < report.areas_of_compromise.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    {comp.position}
                  </p>
                  <p style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
                    {comp.reasoning}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {comp.supporting_agents.map(id => {
                      const agent = getAgent(id);
                      return (
                        <span
                          key={id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: `${agent?.color || '#fff'}10`,
                            fontSize: 9,
                          }}
                          title={agent?.name || id}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: agent?.color || 'rgba(255,255,255,0.2)' }} />
                          <span className="font-mono-label" style={{ color: agent?.color || 'rgba(255,255,255,0.4)', fontSize: 8 }}>
                            {agent?.shortName || id}
                          </span>
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
        </div>
      </div>

      {/* Irreconcilable Disagreements */}
      {report.irreconcilable_disagreements.length > 0 && (
        <div>
          <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-disagree)' }}>
            IRRECONCILABLE DISAGREEMENTS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {report.irreconcilable_disagreements.map((dis, i) => (
              <div
                key={i}
                className="chamber-card"
                style={{
                  padding: '22px 24px',
                  borderRadius: 8,
                  background: 'rgba(231, 76, 60, 0.03)',
                  borderColor: 'rgba(231, 76, 60, 0.1)',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                  {dis.issue}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div style={{ padding: '12px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label" style={{ fontSize: 8, marginBottom: 6, color: 'rgba(255,255,255,0.3)' }}>POSITION A</p>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>{dis.side_a}</p>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label" style={{ fontSize: 8, marginBottom: 6, color: 'rgba(255,255,255,0.3)' }}>POSITION B</p>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>{dis.side_b}</p>
                  </div>
                </div>
                <p style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(231, 76, 60, 0.5)' }}>
                  {dis.why_unresolvable}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rationality Scores */}
      <RationalityScores scores={report.agent_rationality_scores} />

      {/* Decision Points */}
      <div className="chamber-card" style={{ padding: '24px 28px', borderRadius: 8, borderColor: 'rgba(196, 163, 90, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', fontSize: 14 }}>★</span>
          <p className="font-mono-label" style={{ fontSize: 10, color: 'var(--accent)' }}>
            DECISION POINTS
          </p>
        </div>
        <p style={{ fontSize: 10, marginBottom: 20, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>
          These choices remain after structured deliberation. The system mapped the terrain — humans navigate it.
        </p>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 14, listStyle: 'none', margin: 0, padding: 0 }}>
          {report.decision_points.map((dp, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span className="font-mono-tight" style={{ fontSize: 12, flexShrink: 0, width: 20, textAlign: 'right', color: 'var(--accent)' }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {dp}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

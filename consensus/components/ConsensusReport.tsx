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
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Perspective disclaimer */}
      <div
        className="px-4 py-3 rounded text-xs chamber-card"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        This analysis represents five analytical perspectives. It does not capture the lived experiences of all affected communities.
      </div>

      {/* Top section: Meter + Recommendation side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Consensus Meter */}
        <div className="chamber-card animate-scale-in" style={{ padding: '20px', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ConsensusMeter score={report.consensus_score} />
        </div>

        {/* Evidence-based recommendation */}
        <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <RationalRecommendation recommendation={report.rational_recommendation} />
        </div>
      </div>

      {/* Verification + Assumption Impact side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Verification Impact */}
        <div className="chamber-card" style={{ padding: '16px 20px', borderRadius: 6 }}>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--verification-verified)' }}>
            VERIFICATION IMPACT
          </p>
          <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
            <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-verified)' }}>
              {report.verification_impact.claims_verified} verified
            </span>
            <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-contradicted)' }}>
              {report.verification_impact.claims_contradicted} contradicted
            </span>
            <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-outdated)' }}>
              {report.verification_impact.claims_outdated} outdated
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {report.verification_impact.impact_summary}
          </p>
          <div className="flex flex-col gap-1">
            {report.verification_impact.agents_most_accurate.length > 0 && (
              <span className="text-[10px]" style={{ color: 'var(--consensus-agree)' }}>
                Most accurate: {report.verification_impact.agents_most_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
              </span>
            )}
            {report.verification_impact.agents_least_accurate.length > 0 && (
              <span className="text-[10px]" style={{ color: 'var(--consensus-disagree)' }}>
                Least accurate: {report.verification_impact.agents_least_accurate.map(id => getAgent(id)?.shortName || id).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Assumption Impact */}
        <div className="chamber-card" style={{ padding: '16px 20px', borderRadius: 6 }}>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
            ASSUMPTION IMPACT
          </p>
          {report.assumption_impact.length > 0 ? (
            <div className="flex flex-col gap-2">
              {report.assumption_impact.map((ai, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < report.assumption_impact.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <p className="font-mono-label text-[9px] mb-1" style={{ color: 'var(--consensus-compromise)' }}>
                    {ai.assumption_dimension}
                  </p>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {ai.impact}
                  </p>
                  <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Recommended: {ai.recommended_framing}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No significant assumption conflicts detected.</p>
          )}
        </div>
      </div>

      {/* Resolved Discrepancies */}
      {report.resolved_discrepancies.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-agree)' }}>
            RESOLVED DISCREPANCIES
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.resolved_discrepancies.map((rd, i) => (
              <ResolvedDiscrepancyCard key={i} discrepancy={rd} />
            ))}
          </div>
        </div>
      )}

      {/* Agreement + Compromise side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Areas of Agreement */}
        <div className="chamber-card" style={{ padding: '16px 20px', borderRadius: 6 }}>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-agree)' }}>
            AGREEMENT
          </p>
          <div className="flex flex-col gap-1.5">
            {report.areas_of_agreement.map((area, i) => (
              <p key={i} className="text-xs pl-3" style={{ color: 'rgba(78, 205, 196, 0.7)' }}>
                &#10003; {area}
              </p>
            ))}
          </div>
        </div>

        {/* Areas of Compromise */}
        <div className="chamber-card" style={{ padding: '16px 20px', borderRadius: 6 }}>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
            COMPROMISE
          </p>
          {report.areas_of_compromise.length > 0 ? (
            <div className="flex flex-col gap-3">
              {report.areas_of_compromise.map((comp, i) => (
                <div key={i} style={{ paddingBottom: 8, borderBottom: i < report.areas_of_compromise.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {comp.position}
                  </p>
                  <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {comp.reasoning}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {comp.supporting_agents.map(id => {
                      const agent = getAgent(id);
                      return (
                        <span
                          key={id}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                          style={{ background: `${agent?.color || '#fff'}10`, fontSize: 9 }}
                          title={agent?.name || id}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent?.color || 'rgba(255,255,255,0.2)' }} />
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
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No compromise areas identified.</p>
          )}
        </div>
      </div>

      {/* Irreconcilable Disagreements */}
      {report.irreconcilable_disagreements.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-disagree)' }}>
            IRRECONCILABLE DISAGREEMENTS
          </p>
          <div className="flex flex-col gap-3">
            {report.irreconcilable_disagreements.map((dis, i) => (
              <div
                key={i}
                className="chamber-card rounded"
                style={{
                  padding: '16px 20px',
                  background: 'rgba(231, 76, 60, 0.03)',
                  borderColor: 'rgba(231, 76, 60, 0.1)',
                }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {dis.issue}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label text-[8px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>POSITION A</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{dis.side_a}</p>
                  </div>
                  <div className="px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-mono-label text-[8px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>POSITION B</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{dis.side_b}</p>
                  </div>
                </div>
                <p className="text-[10px] italic" style={{ color: 'rgba(231, 76, 60, 0.5)' }}>
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
      <div className="chamber-card" style={{ padding: '20px 24px', borderRadius: 6, borderColor: 'rgba(196, 163, 90, 0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: 'var(--accent)', fontSize: 14 }}>★</span>
          <p className="font-mono-label text-[10px]" style={{ color: 'var(--accent)' }}>
            DECISION POINTS
          </p>
        </div>
        <p className="text-[10px] mb-4 italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
          These choices remain after structured deliberation. The system mapped the terrain — humans navigate it.
        </p>
        <ol className="flex flex-col gap-2.5">
          {report.decision_points.map((dp, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-mono-tight text-xs shrink-0 w-5 text-right" style={{ color: 'var(--accent)' }}>
                {i + 1}.
              </span>
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {dp}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

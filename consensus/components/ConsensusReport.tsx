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
        className="px-4 py-3 rounded-sm text-xs"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        This analysis represents five analytical perspectives. It does not capture the lived experiences of all affected communities.
      </div>

      {/* Consensus Meter */}
      <ConsensusMeter score={report.consensus_score} />

      {/* Evidence-based recommendation */}
      <RationalRecommendation recommendation={report.rational_recommendation} />

      {/* Verification Impact */}
      <div>
        <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--verification-verified)' }}>
          📊 VERIFICATION IMPACT
        </p>
        <div
          className="px-4 py-3 rounded-sm"
          style={{ background: 'rgba(78, 205, 196, 0.03)', border: '1px solid rgba(78, 205, 196, 0.08)' }}
        >
          <div className="flex items-center gap-4 mb-2">
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
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {report.verification_impact.impact_summary}
          </p>
          <div className="flex items-center gap-4 mt-2">
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
      </div>

      {/* Assumption Impact */}
      {report.assumption_impact.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
            🔀 ASSUMPTION IMPACT
          </p>
          <div className="flex flex-col gap-2">
            {report.assumption_impact.map((ai, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-sm"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <p className="font-mono-label text-[9px] mb-1" style={{ color: 'var(--consensus-compromise)' }}>
                  {ai.assumption_dimension}
                </p>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {ai.impact}
                </p>
                <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Recommended: {ai.recommended_framing}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Discrepancies */}
      {report.resolved_discrepancies.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-agree)' }}>
            RESOLVED DISCREPANCIES
          </p>
          <div className="flex flex-col gap-2">
            {report.resolved_discrepancies.map((rd, i) => (
              <ResolvedDiscrepancyCard key={i} discrepancy={rd} />
            ))}
          </div>
        </div>
      )}

      {/* Areas of Agreement */}
      <div>
        <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-agree)' }}>
          ✓ AGREEMENT
        </p>
        <div className="flex flex-col gap-1">
          {report.areas_of_agreement.map((area, i) => (
            <p key={i} className="text-xs pl-3" style={{ color: 'rgba(78, 205, 196, 0.7)' }}>
              ✓ {area}
            </p>
          ))}
        </div>
      </div>

      {/* Areas of Compromise */}
      {report.areas_of_compromise.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
            ⟷ COMPROMISE
          </p>
          <div className="flex flex-col gap-3">
            {report.areas_of_compromise.map((comp, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-sm"
                style={{
                  background: 'rgba(247, 183, 49, 0.03)',
                  border: '1px solid rgba(247, 183, 49, 0.08)',
                }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {comp.position}
                </p>
                <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {comp.reasoning}
                </p>
                <div className="flex items-center gap-1.5">
                  {comp.supporting_agents.map(id => {
                    const agent = getAgent(id);
                    return (
                      <span
                        key={id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: agent?.color || 'rgba(255,255,255,0.2)' }}
                        title={agent?.name || id}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Irreconcilable Disagreements */}
      {report.irreconcilable_disagreements.length > 0 && (
        <div>
          <p className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-disagree)' }}>
            ✗ DISAGREEMENTS
          </p>
          <div className="flex flex-col gap-3">
            {report.irreconcilable_disagreements.map((dis, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-sm"
                style={{
                  background: 'rgba(231, 76, 60, 0.03)',
                  border: '1px solid rgba(231, 76, 60, 0.08)',
                }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {dis.issue}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div className="px-2 py-1.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{dis.side_a}</p>
                  </div>
                  <div className="px-2 py-1.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{dis.side_b}</p>
                  </div>
                </div>
                <p className="text-[10px] italic" style={{ color: 'rgba(231, 76, 60, 0.6)' }}>
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
      <div
        className="px-5 py-4 rounded-sm"
        style={{
          background: 'rgba(196, 163, 90, 0.04)',
          border: '1px solid rgba(196, 163, 90, 0.15)',
        }}
      >
        <p className="font-mono-label text-[10px] mb-1" style={{ color: 'var(--accent)' }}>
          ★ DECISION POINTS
        </p>
        <p className="text-[10px] mb-3 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
          These choices remain after structured deliberation. The system mapped the terrain — humans navigate it.
        </p>
        <ol className="flex flex-col gap-2">
          {report.decision_points.map((dp, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono-tight text-xs shrink-0" style={{ color: 'var(--accent)' }}>
                {i + 1}.
              </span>
              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                {dp}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
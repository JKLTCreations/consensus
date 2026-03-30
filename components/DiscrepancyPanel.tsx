'use client';

import { EnhancedDiscrepancyReport } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import CollapsibleSection from './CollapsibleSection';

interface DiscrepancyPanelProps {
  report: EnhancedDiscrepancyReport;
}

export default function DiscrepancyPanel({ report }: DiscrepancyPanelProps) {
  const totalActive = report.discrepancies.length;
  const preResolved = report.verified_resolutions.length;
  const highSeverity = report.discrepancies.filter(d => d.severity === 'high').length;

  return (
    <div>
      {/* Summary always visible */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        {totalActive} active discrepanc{totalActive !== 1 ? 'ies' : 'y'} detected
        {highSeverity > 0 && ` (${highSeverity} high severity)`}
        {preResolved > 0 && `, ${preResolved} pre-resolved by verification`}.
        {report.consensus_areas.length > 0 && ` ${report.consensus_areas.length} area${report.consensus_areas.length !== 1 ? 's' : ''} of early consensus.`}
      </p>

      {/* Pre-resolved */}
      {preResolved > 0 && (
        <CollapsibleSection
          title={`PRE-RESOLVED (${preResolved})`}
          summary="Resolved by evidence verification"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.verified_resolutions.map((res, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
                  {res.issue}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  Resolved: {res.correct_position}
                  {res.agent_who_was_wrong && ` (${res.agent_who_was_wrong} corrected)`}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Active discrepancies */}
      {totalActive > 0 && (
        <div style={{ marginTop: preResolved > 0 ? 12 : 0 }}>
          <CollapsibleSection
            title={`ACTIVE DISCREPANCIES (${totalActive})`}
            summary={highSeverity > 0 ? `${highSeverity} high severity` : `${totalActive} to resolve`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {report.discrepancies.map((disc, i) => {
                const agentA = getAgent(disc.agent_a);
                const agentB = getAgent(disc.agent_b);

                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.02)' }}>
                      <span className="font-mono-label" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                        {disc.severity.toUpperCase()}
                      </span>
                      <span className="font-mono-label" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}>
                        {disc.detected_by === 'programmatic' ? 'AUTO' : disc.detected_by === 'llm' ? 'EXPERT' : 'PRE-RESOLVED'}
                      </span>
                      {disc.stems_from_assumption_conflict && (
                        <span className="font-mono-label" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}>
                          FRAMING
                        </span>
                      )}
                    </div>

                    {/* Issue */}
                    <div style={{ padding: '10px 14px 6px' }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{disc.issue}</p>
                    </div>

                    {/* Agent positions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, padding: '6px 14px 12px' }}>
                      <div style={{ padding: '8px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                          {agentA?.shortName || disc.agent_a}
                        </span>
                        <p style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
                          {disc.claim_a}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>VS</span>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                          {agentB?.shortName || disc.agent_b}
                        </span>
                        <p style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
                          {disc.claim_b}
                        </p>
                      </div>
                    </div>

                    {/* Resolution hint */}
                    {disc.resolution_hint && (
                      <div style={{ padding: '0 14px 10px' }}>
                        <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>
                          {disc.resolution_hint}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Early consensus */}
      {report.consensus_areas.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <CollapsibleSection
            title={`EARLY CONSENSUS (${report.consensus_areas.length})`}
            summary={`${report.consensus_areas.length} area${report.consensus_areas.length !== 1 ? 's' : ''}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.consensus_areas.map((area, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {area}
                </p>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Detection stats */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
          DETECTION: {report.programmatic_detection_count} by code · {report.llm_detection_count} by review · {report.false_positive_count} false positives removed
        </span>
      </div>
    </div>
  );
}

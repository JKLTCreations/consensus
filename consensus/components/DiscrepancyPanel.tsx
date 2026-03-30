'use client';

import { EnhancedDiscrepancyReport } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface DiscrepancyPanelProps {
  report: EnhancedDiscrepancyReport;
}

const SEVERITY_COLORS = {
  high: { color: 'var(--consensus-disagree)', bg: 'rgba(231, 76, 60, 0.1)', border: 'rgba(231, 76, 60, 0.15)' },
  medium: { color: 'var(--consensus-compromise)', bg: 'rgba(247, 183, 49, 0.1)', border: 'rgba(247, 183, 49, 0.15)' },
  low: { color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' },
};

const DETECTION_BADGES = {
  programmatic: { label: 'AUTO', color: 'var(--verification-verified)', bg: 'rgba(78, 205, 196, 0.1)' },
  llm: { label: 'EXPERT', color: 'var(--text-primary)', bg: 'rgba(255,255,255,0.05)' },
  verification: { label: 'PRE-RESOLVED', color: 'var(--consensus-agree)', bg: 'rgba(78, 205, 196, 0.1)' },
};

export default function DiscrepancyPanel({ report }: DiscrepancyPanelProps) {
  return (
    <div className="animate-fade-up">
      <h3 className="font-mono-label" style={{ fontSize: 11, marginBottom: 20, color: 'var(--consensus-compromise)' }}>
        ⚡ DISCREPANCIES DETECTED
      </h3>

      {/* Pre-resolved by verification */}
      {report.verified_resolutions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'var(--consensus-agree)' }}>
            PRE-RESOLVED BY VERIFICATION
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.verified_resolutions.map((res, i) => (
              <div
                key={i}
                className="animate-slide-in"
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: 'rgba(78, 205, 196, 0.04)',
                  border: '1px solid rgba(78, 205, 196, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--consensus-agree)' }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{res.issue}</span>
                </div>
                <p style={{ fontSize: 11, paddingLeft: 20, color: 'rgba(255,255,255,0.55)' }}>
                  Resolved: {res.correct_position}
                  {res.agent_who_was_wrong && (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}> ({res.agent_who_was_wrong} corrected)</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active discrepancies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        {report.discrepancies.map((disc, i) => {
          const agentA = getAgent(disc.agent_a);
          const agentB = getAgent(disc.agent_b);
          const severity = SEVERITY_COLORS[disc.severity];
          const detection = DETECTION_BADGES[disc.detected_by];

          return (
            <div
              key={i}
              className="animate-slide-in"
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${severity.border}`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Header badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: severity.bg }}>
                <span className="font-mono-label" style={{ fontSize: 8, padding: '3px 8px', borderRadius: 3, color: detection.color, background: detection.bg }}>
                  {detection.label}
                </span>
                <span className="font-mono-label" style={{ fontSize: 8, padding: '3px 8px', borderRadius: 3, color: severity.color, background: severity.bg }}>
                  {disc.severity.toUpperCase()}
                </span>
                {disc.stems_from_assumption_conflict && (
                  <span className="font-mono-label" style={{ fontSize: 8, padding: '3px 8px', borderRadius: 3, color: 'var(--consensus-compromise)', background: 'rgba(247, 183, 49, 0.1)' }}>
                    FRAMING CONFLICT
                  </span>
                )}
              </div>

              {/* Issue */}
              <div style={{ padding: '14px 16px 8px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {disc.issue}
                </p>
              </div>

              {/* Versus cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, padding: '8px 16px 16px' }}>
                <div style={{ padding: '10px 14px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="font-mono-label" style={{ fontSize: 9, color: agentA?.color || 'var(--text-secondary)' }}>
                    {agentA?.shortName || disc.agent_a}
                  </span>
                  <p style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>
                    {disc.claim_a}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                  <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>VS</span>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                  <span className="font-mono-label" style={{ fontSize: 9, color: agentB?.color || 'var(--text-secondary)' }}>
                    {agentB?.shortName || disc.agent_b}
                  </span>
                  <p style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>
                    {disc.claim_b}
                  </p>
                </div>
              </div>

              {/* Resolution hint */}
              <div style={{ padding: '0 16px 14px' }}>
                <p style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>
                  {disc.resolution_hint}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Early consensus */}
      {report.consensus_areas.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'var(--consensus-agree)' }}>
            EARLY CONSENSUS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.consensus_areas.map((area, i) => (
              <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(78, 205, 196, 0.7)' }}>
                ✓ {area}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Detection transparency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
          DETECTION: {report.programmatic_detection_count} by code · {report.llm_detection_count} by review · {report.false_positive_count} false positives removed
        </span>
      </div>
    </div>
  );
}

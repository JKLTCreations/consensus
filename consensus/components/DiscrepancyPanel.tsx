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
      <h3 className="font-mono-label text-[11px] mb-4" style={{ color: 'var(--consensus-compromise)' }}>
        ⚡ DISCREPANCIES DETECTED
      </h3>

      {/* Pre-resolved by verification */}
      {report.verified_resolutions.length > 0 && (
        <div className="mb-5">
          <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-agree)' }}>
            PRE-RESOLVED BY VERIFICATION
          </p>
          {report.verified_resolutions.map((res, i) => (
            <div
              key={i}
              className="px-3 py-2 mb-2 rounded-sm animate-slide-in"
              style={{
                background: 'rgba(78, 205, 196, 0.04)',
                border: '1px solid rgba(78, 205, 196, 0.1)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs" style={{ color: 'var(--consensus-agree)' }}>✓</span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{res.issue}</span>
              </div>
              <p className="text-[11px] pl-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Resolved: {res.correct_position}
                {res.agent_who_was_wrong && (
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}> ({res.agent_who_was_wrong} corrected)</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Active discrepancies */}
      <div className="flex flex-col gap-3 mb-5">
        {report.discrepancies.map((disc, i) => {
          const agentA = getAgent(disc.agent_a);
          const agentB = getAgent(disc.agent_b);
          const severity = SEVERITY_COLORS[disc.severity];
          const detection = DETECTION_BADGES[disc.detected_by];

          return (
            <div
              key={i}
              className="rounded-sm overflow-hidden animate-slide-in"
              style={{
                border: `1px solid ${severity.border}`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Header badges */}
              <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: severity.bg }}>
                <span className="font-mono-label text-[8px] px-1.5 py-0.5 rounded" style={{ color: detection.color, background: detection.bg }}>
                  {detection.label}
                </span>
                <span className="font-mono-label text-[8px] px-1.5 py-0.5 rounded" style={{ color: severity.color, background: severity.bg }}>
                  {disc.severity.toUpperCase()}
                </span>
                {disc.stems_from_assumption_conflict && (
                  <span className="font-mono-label text-[8px] px-1.5 py-0.5 rounded" style={{ color: 'var(--consensus-compromise)', background: 'rgba(247, 183, 49, 0.1)' }}>
                    FRAMING CONFLICT
                  </span>
                )}
              </div>

              {/* Issue */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {disc.issue}
                </p>
              </div>

              {/* Versus cards */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 px-3 pb-3">
                <div className="px-2 py-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="font-mono-label text-[9px]" style={{ color: agentA?.color || 'var(--text-secondary)' }}>
                    {agentA?.shortName || disc.agent_a}
                  </span>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {disc.claim_a}
                  </p>
                </div>
                <div className="flex items-center justify-center px-2">
                  <span className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</span>
                </div>
                <div className="px-2 py-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="font-mono-label text-[9px]" style={{ color: agentB?.color || 'var(--text-secondary)' }}>
                    {agentB?.shortName || disc.agent_b}
                  </span>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {disc.claim_b}
                  </p>
                </div>
              </div>

              {/* Resolution hint */}
              <div className="px-3 pb-2">
                <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {disc.resolution_hint}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Early consensus */}
      {report.consensus_areas.length > 0 && (
        <div className="mb-4">
          <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-agree)' }}>
            EARLY CONSENSUS
          </p>
          {report.consensus_areas.map((area, i) => (
            <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(78, 205, 196, 0.7)' }}>
              ✓ {area}
            </p>
          ))}
        </div>
      )}

      {/* Detection transparency */}
      <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          DETECTION: {report.programmatic_detection_count} by code · {report.llm_detection_count} by review · {report.false_positive_count} false positives removed
        </span>
      </div>
    </div>
  );
}
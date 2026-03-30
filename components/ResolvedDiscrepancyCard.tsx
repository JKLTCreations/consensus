'use client';

import { ResolvedDiscrepancy } from '@/lib/types';

interface ResolvedDiscrepancyCardProps {
  discrepancy: ResolvedDiscrepancy;
}

const SOURCE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  programmatic: { label: 'BY CODE', color: 'var(--verification-verified)', bg: 'rgba(78, 205, 196, 0.1)' },
  llm_detected: { label: 'BY REVIEW', color: 'var(--text-primary)', bg: 'rgba(255,255,255,0.05)' },
  verification: { label: 'BY VERIFICATION', color: 'var(--verification-verified)', bg: 'rgba(78, 205, 196, 0.1)' },
  round2_concession: { label: 'BY CONCESSION', color: 'var(--consensus-compromise)', bg: 'rgba(247, 183, 49, 0.1)' },
};

export default function ResolvedDiscrepancyCard({ discrepancy }: ResolvedDiscrepancyCardProps) {
  const badge = SOURCE_BADGES[discrepancy.resolution_source] || SOURCE_BADGES.programmatic;

  return (
    <div
      className="px-4 py-3 rounded-sm"
      style={{
        background: 'rgba(78, 205, 196, 0.03)',
        border: '1px solid rgba(78, 205, 196, 0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-sm shrink-0" style={{ color: 'var(--consensus-agree)' }}>✓</span>
        <div className="flex-1">
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {discrepancy.issue}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              RESOLVED →
            </span>
            <span className="text-xs" style={{ color: 'var(--consensus-agree)' }}>
              {discrepancy.winning_position}
            </span>
          </div>
          <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {discrepancy.resolution}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="font-mono-label text-[8px] px-1.5 py-0.5 rounded"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
            {discrepancy.dissenting_agents.length > 0 && (
              <span className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                DISSENT: {discrepancy.dissenting_agents.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
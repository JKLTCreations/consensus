'use client';

import { ResolvedDiscrepancy } from '@/lib/types';

interface ResolvedDiscrepancyCardProps {
  discrepancy: ResolvedDiscrepancy;
}

export default function ResolvedDiscrepancyCard({ discrepancy }: ResolvedDiscrepancyCardProps) {
  const sourceLabel = {
    programmatic: 'BY CODE',
    llm_detected: 'BY REVIEW',
    verification: 'BY VERIFICATION',
    round2_concession: 'BY CONCESSION',
  }[discrepancy.resolution_source] || 'RESOLVED';

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p style={{ fontSize: 12, marginBottom: 6, color: 'rgba(255,255,255,0.55)' }}>
        {discrepancy.issue}
      </p>
      <p style={{ fontSize: 11, marginBottom: 6, color: 'rgba(255,255,255,0.35)' }}>
        {discrepancy.winning_position}
      </p>
      <p style={{ fontSize: 11, marginBottom: 8, color: 'rgba(255,255,255,0.3)' }}>
        {discrepancy.resolution}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          className="font-mono-label"
          style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }}
        >
          {sourceLabel}
        </span>
        {discrepancy.dissenting_agents.length > 0 && (
          <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
            DISSENT: {discrepancy.dissenting_agents.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

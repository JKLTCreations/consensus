'use client';

import { AssumptionConflict } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface AssumptionConflictCardProps {
  conflict: AssumptionConflict;
}

export default function AssumptionConflictCard({ conflict }: AssumptionConflictCardProps) {
  return (
    <div
      className="animate-slide-in"
      style={{
        padding: '18px 22px',
        borderRadius: 6,
        background: 'rgba(247, 183, 49, 0.04)',
        border: '1px solid rgba(247, 183, 49, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="font-mono-label" style={{ fontSize: 9, color: 'var(--consensus-compromise)' }}>
          ⚡ CONFLICT
        </span>
        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
          {conflict.dimension}
        </span>
      </div>
      <p style={{ fontSize: 12, marginBottom: 14, color: 'rgba(255,255,255,0.55)' }}>
        {conflict.conflict_description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {conflict.agents_and_assumptions.map((aa, i) => {
          const agent = getAgent(aa.agent);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span
                className="font-mono-label"
                style={{
                  fontSize: 9,
                  flexShrink: 0,
                  marginTop: 2,
                  padding: '3px 8px',
                  borderRadius: 4,
                  color: agent?.color || 'var(--text-secondary)',
                  background: `${agent?.color || '#fff'}10`,
                }}
              >
                {agent?.shortName || aa.agent}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                &ldquo;{aa.assumption}&rdquo;
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

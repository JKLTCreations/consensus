'use client';

import { AssumptionConflict } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface AssumptionConflictCardProps {
  conflict: AssumptionConflict;
}

export default function AssumptionConflictCard({ conflict }: AssumptionConflictCardProps) {
  return (
    <div
      style={{
        padding: '14px 18px',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
          CONFLICT
        </span>
        <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
          {conflict.dimension}
        </span>
      </div>
      <p style={{ fontSize: 12, marginBottom: 12, color: 'rgba(255,255,255,0.45)' }}>
        {conflict.conflict_description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  padding: '2px 7px',
                  borderRadius: 4,
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                {agent?.shortName || aa.agent}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                &ldquo;{aa.assumption}&rdquo;
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { AssumptionConflict } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface AssumptionConflictCardProps {
  conflict: AssumptionConflict;
}

export default function AssumptionConflictCard({ conflict }: AssumptionConflictCardProps) {
  return (
    <div
      className="p-4 rounded-sm animate-slide-in"
      style={{
        background: 'rgba(247, 183, 49, 0.04)',
        border: '1px solid rgba(247, 183, 49, 0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono-label text-[9px]" style={{ color: 'var(--consensus-compromise)' }}>
          ⚡ CONFLICT
        </span>
        <span className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {conflict.dimension}
        </span>
      </div>
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {conflict.conflict_description}
      </p>
      <div className="flex flex-col gap-2">
        {conflict.agents_and_assumptions.map((aa, i) => {
          const agent = getAgent(aa.agent);
          return (
            <div key={i} className="flex items-start gap-2">
              <span
                className="font-mono-label text-[9px] shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                style={{
                  color: agent?.color || 'var(--text-secondary)',
                  background: `${agent?.color || '#fff'}10`,
                }}
              >
                {agent?.shortName || aa.agent}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                &ldquo;{aa.assumption}&rdquo;
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'use client';

import { DiscrepancyResponse } from '@/lib/types';

interface DiscrepancyResponseViewProps {
  responses: DiscrepancyResponse[];
  agentColor: string;
}

export default function DiscrepancyResponseView({ responses, agentColor }: DiscrepancyResponseViewProps) {
  if (!responses || responses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {responses.map((dr, i) => (
        <div
          key={i}
          className="px-3 py-2 rounded-sm text-xs"
          style={{
            background: dr.my_response === 'concede'
              ? 'rgba(78, 205, 196, 0.05)'
              : dr.my_response === 'defend'
                ? 'rgba(247, 183, 49, 0.05)'
                : 'rgba(255,255,255,0.02)',
            borderLeft: `2px solid ${
              dr.my_response === 'concede'
                ? 'var(--consensus-agree)'
                : dr.my_response === 'defend'
                  ? agentColor
                  : 'rgba(255,255,255,0.15)'
            }`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-mono-tight text-[9px]"
              style={{
                color: dr.my_response === 'concede'
                  ? 'var(--consensus-agree)'
                  : dr.my_response === 'defend'
                    ? 'var(--consensus-compromise)'
                    : 'rgba(255,255,255,0.45)',
              }}
            >
              {dr.my_response === 'concede' ? '✓ CONCEDE' : dr.my_response === 'defend' ? '⚔️ DEFEND' : '↔️ PARTIAL'}
            </span>
            {dr.stems_from_assumption_conflict && (
              <span
                className="font-mono-label text-[8px] px-1 py-0.5 rounded"
                style={{ background: 'rgba(247, 183, 49, 0.1)', color: 'var(--consensus-compromise)' }}
              >
                FRAMING
              </span>
            )}
          </div>
          <p className="mb-1" style={{ color: 'var(--text-primary)' }}>{dr.issue}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)' }}>{dr.reasoning}</p>
          {dr.updated_claim && dr.my_response !== 'defend' && (
            <p className="mt-1 italic" style={{ color: 'var(--consensus-agree)' }}>
              Updated: {dr.updated_claim}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
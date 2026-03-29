'use client';

import { VerificationResult } from '@/lib/types';

interface EvidenceVerificationBadgeProps {
  status: VerificationResult['status'];
  correctValue?: string;
  sourceName?: string;
  sourceUrl?: string;
  inline?: boolean;
}

const STATUS_CONFIG = {
  verified: { symbol: '✓', color: 'var(--verification-verified)', label: 'VERIFIED', bg: 'rgba(78, 205, 196, 0.1)', border: 'rgba(78, 205, 196, 0.2)' },
  contradicted: { symbol: '✗', color: 'var(--verification-contradicted)', label: 'CONTRADICTED', bg: 'rgba(231, 76, 60, 0.1)', border: 'rgba(231, 76, 60, 0.2)' },
  outdated: { symbol: '⟳', color: 'var(--verification-outdated)', label: 'OUTDATED', bg: 'rgba(247, 183, 49, 0.1)', border: 'rgba(247, 183, 49, 0.2)' },
  unverifiable: { symbol: '?', color: 'var(--verification-unverifiable)', label: 'UNVERIFIABLE', bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.06)' },
};

export default function EvidenceVerificationBadge({ status, correctValue, sourceName, sourceUrl, inline }: EvidenceVerificationBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (inline) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-tight"
        style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
        title={[
          config.label,
          correctValue ? `Correct: ${correctValue}` : '',
          sourceName ? `Source: ${sourceName}` : '',
        ].filter(Boolean).join(' | ')}
      >
        {config.symbol}
      </span>
    );
  }

  return (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded-sm"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <span className="text-sm font-bold shrink-0" style={{ color: config.color }}>
        {config.symbol}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-mono-label text-[9px]" style={{ color: config.color }}>
          {config.label}
        </span>
        {correctValue && (
          <p className="text-xs mt-0.5" style={{ color: config.color }}>
            Correct value: {correctValue}
          </p>
        )}
        {sourceName && (
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                {sourceName}
              </a>
            ) : sourceName}
          </p>
        )}
      </div>
    </div>
  );
}
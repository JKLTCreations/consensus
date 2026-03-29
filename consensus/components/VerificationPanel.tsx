'use client';

import { VerificationReport } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import EvidenceVerificationBadge from './EvidenceVerificationBadge';

interface VerificationPanelProps {
  report: VerificationReport;
}

export default function VerificationPanel({ report }: VerificationPanelProps) {
  const verified = report.verified_claims.filter(c => c.status === 'verified').length;
  const contradicted = report.verified_claims.filter(c => c.status === 'contradicted').length;
  const outdated = report.verified_claims.filter(c => c.status === 'outdated').length;
  const unverifiable = report.verified_claims.filter(c => c.status === 'unverifiable').length;

  return (
    <div className="animate-fade-up">
      <h3 className="font-mono-label text-[11px] mb-4" style={{ color: 'var(--verification-verified)' }}>
        🔍 EVIDENCE VERIFICATION
      </h3>

      {/* Summary bar */}
      <div
        className="flex items-center gap-4 px-4 py-2 mb-4 rounded-sm"
        style={{ background: 'rgba(78, 205, 196, 0.05)', border: '1px solid rgba(78, 205, 196, 0.1)' }}
      >
        <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-verified)' }}>
          {verified} verified
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-contradicted)' }}>
          {contradicted} contradicted
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-outdated)' }}>
          {outdated} outdated
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="text-xs font-mono-tight" style={{ color: 'var(--verification-unverifiable)' }}>
          {unverifiable} unverifiable
        </span>
      </div>

      {/* Claims */}
      <div className="flex flex-col gap-2">
        {report.verified_claims.map((claim, i) => {
          const agent = getAgent(claim.agent_id);
          return (
            <div
              key={i}
              className="flex items-start gap-3 px-3 py-2.5 rounded-sm animate-slide-in"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                animationDelay: `${i * 50}ms`,
              }}
            >
              {/* Agent badge */}
              <span
                className="font-mono-label text-[9px] shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                style={{
                  color: agent?.color || 'var(--text-secondary)',
                  background: `${agent?.color || '#fff'}10`,
                }}
              >
                {agent?.shortName || claim.agent_id}
              </span>

              {/* Claim text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {claim.claim_text}
                </p>
                {claim.confidence_note && (
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {claim.confidence_note}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <EvidenceVerificationBadge
                status={claim.status}
                correctValue={claim.correct_value}
                sourceName={claim.source_name}
                sourceUrl={claim.source_url}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
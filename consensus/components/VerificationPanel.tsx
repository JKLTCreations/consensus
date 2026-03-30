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
      <h3 className="font-mono-label" style={{ fontSize: 11, marginBottom: 20, color: 'var(--verification-verified)' }}>
        🔍 EVIDENCE VERIFICATION
      </h3>

      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 18px',
          marginBottom: 20,
          borderRadius: 6,
          background: 'rgba(78, 205, 196, 0.05)',
          border: '1px solid rgba(78, 205, 196, 0.1)',
        }}
      >
        <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-verified)' }}>
          {verified} verified
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-contradicted)' }}>
          {contradicted} contradicted
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-outdated)' }}>
          {outdated} outdated
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="font-mono-tight" style={{ fontSize: 12, color: 'var(--verification-unverifiable)' }}>
          {unverifiable} unverifiable
        </span>
      </div>

      {/* Claims */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {report.verified_claims.map((claim, i) => {
          const agent = getAgent(claim.agent_id);
          return (
            <div
              key={i}
              className="animate-slide-in"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                animationDelay: `${i * 50}ms`,
              }}
            >
              {/* Agent badge */}
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
                {agent?.shortName || claim.agent_id}
              </span>

              {/* Claim text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {claim.claim_text}
                </p>
                {claim.confidence_note && (
                  <p style={{ fontSize: 10, marginTop: 6, color: 'rgba(255,255,255,0.3)' }}>
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

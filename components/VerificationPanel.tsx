'use client';

import { VerificationReport } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import EvidenceVerificationBadge from './EvidenceVerificationBadge';
import CollapsibleSection from './CollapsibleSection';

interface VerificationPanelProps {
  report: VerificationReport;
}

export default function VerificationPanel({ report }: VerificationPanelProps) {
  const verified = report.verified_claims.filter(c => c.status === 'verified').length;
  const contradicted = report.verified_claims.filter(c => c.status === 'contradicted').length;
  const outdated = report.verified_claims.filter(c => c.status === 'outdated').length;
  const unverifiable = report.verified_claims.filter(c => c.status === 'unverifiable').length;

  return (
    <div>
      {/* Summary always visible */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        {report.verified_claims.length} claims checked — {verified} verified, {contradicted} contradicted, {outdated} outdated, {unverifiable} unverifiable.
      </p>

      {/* Individual claims - collapsed */}
      <CollapsibleSection
        title={`VERIFIED CLAIMS (${report.verified_claims.length})`}
        summary={`${contradicted + outdated} issues found`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {report.verified_claims.map((claim, i) => {
            const agent = getAgent(claim.agent_id);
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <span
                  className="font-mono-label"
                  style={{
                    fontSize: 9,
                    flexShrink: 0,
                    marginTop: 2,
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  {agent?.shortName || claim.agent_id}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
                    {claim.claim_text}
                  </p>
                  {claim.confidence_note && (
                    <p style={{ fontSize: 11, marginTop: 4, color: 'rgba(255,255,255,0.3)' }}>
                      {claim.confidence_note}
                    </p>
                  )}
                </div>
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
      </CollapsibleSection>
    </div>
  );
}

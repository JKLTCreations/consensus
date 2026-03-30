'use client';

import { useState } from 'react';
import { Round1Analysis, Round2Analysis, VerificationResult } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import EvidenceVerificationBadge from './EvidenceVerificationBadge';

interface AgentAnalysisPanelProps {
  agentId: string;
  round: 1 | 2;
  analysis: Round1Analysis;
  round2?: Round2Analysis;
  verifications?: VerificationResult[];
}

function renderEvidence(text: string) {
  const parts: (string | { type: string; text: string })[] = [];
  let lastIndex = 0;
  const regex = /\[(STAT|SOURCE|CAUSAL):\s*([^\]]+)\]/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ type: match[1].toLowerCase(), text: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (typeof part === 'string') return <span key={i}>{part}</span>;
        const className = part.type === 'stat' ? 'claim-stat' : part.type === 'source' ? 'claim-source' : 'claim-causal';
        const icon = part.type === 'stat' ? '📊' : part.type === 'source' ? '📎' : '⚡';
        return (
          <span key={i} className={className}>
            {icon} {part.text}
          </span>
        );
      })}
    </span>
  );
}

export default function AgentAnalysisPanel({ agentId, round, analysis, round2, verifications }: AgentAnalysisPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = getAgent(agentId);
  if (!agent) return null;

  const data = round === 2 && round2 ? round2 : null;

  return (
    <div
      className="animate-slide-in"
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? `${agent.color}30` : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          textAlign: 'left',
          transition: 'background 0.2s',
          background: expanded ? `${agent.color}08` : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: agent.color,
          }}
        />
        <span className="font-mono-label" style={{ fontSize: 11, flex: 1, color: agent.color }}>
          {agent.icon} {agent.name}
        </span>
        {data && (
          <span className="font-mono-tight" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
            CONFIDENCE {data.confidence}/10
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            transition: 'transform 0.2s',
            color: 'rgba(255,255,255,0.25)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▸
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '4px 24px 24px' }}>
          {/* Position */}
          <div
            style={{
              padding: '12px 16px',
              marginBottom: 20,
              borderRadius: 4,
              fontStyle: 'italic',
              fontSize: 13,
              lineHeight: 1.6,
              borderLeft: `2px solid ${agent.color}`,
              color: 'var(--text-primary)',
              background: `${agent.color}08`,
            }}
          >
            {analysis.position}
          </div>

          {/* Verification responses (Round 2) */}
          {data?.verification_responses && data.verification_responses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 10, color: 'var(--verification-verified)' }}>
                VERIFICATION RESPONSES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.verification_responses.map((vr, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: 4,
                    fontSize: 12,
                    background: vr.verification_status === 'contradicted' ? 'rgba(78, 205, 196, 0.05)' : 'rgba(247, 183, 49, 0.05)',
                    borderLeft: `2px solid ${vr.verification_status === 'contradicted' ? 'var(--verification-verified)' : 'var(--verification-outdated)'}`,
                    color: 'rgba(255,255,255,0.55)',
                  }}>
                    <span className="font-mono-tight" style={{ fontSize: 9, color: vr.verification_status === 'contradicted' ? 'var(--verification-verified)' : 'var(--verification-outdated)' }}>
                      {vr.verification_status === 'contradicted' ? 'ACCEPTED' : 'DISPUTED'}
                    </span>
                    {' '}{vr.my_response}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discrepancy responses (Round 2) */}
          {data?.discrepancy_responses && data.discrepancy_responses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 10, color: 'var(--consensus-compromise)' }}>
                DISCREPANCY RESPONSES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.discrepancy_responses.map((dr, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: 4,
                    fontSize: 12,
                    background: dr.my_response === 'concede' ? 'rgba(78, 205, 196, 0.05)' : dr.my_response === 'defend' ? 'rgba(247, 183, 49, 0.05)' : 'rgba(255,255,255,0.02)',
                    borderLeft: `2px solid ${dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.15)'}`,
                    color: 'rgba(255,255,255,0.55)',
                  }}>
                    <span className="font-mono-tight" style={{
                      fontSize: 9,
                      color: dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.45)'
                    }}>
                      {dr.my_response === 'concede' ? '✓ CONCEDE' : dr.my_response === 'defend' ? '⚔️ DEFEND' : '↔️ PARTIAL'}
                    </span>
                    {dr.stems_from_assumption_conflict && (
                      <span className="font-mono-label" style={{ fontSize: 8, marginLeft: 8, padding: '2px 6px', borderRadius: 3, background: 'rgba(247, 183, 49, 0.1)', color: 'var(--consensus-compromise)' }}>
                        FRAMING
                      </span>
                    )}
                    <span style={{ display: 'block', marginTop: 6 }}>{dr.reasoning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arguments */}
          <div style={{ marginBottom: 24 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'rgba(255,255,255,0.25)' }}>
              ARGUMENTS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {analysis.arguments.map((arg, i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                    ▸ {arg.point}
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, paddingLeft: 14, color: 'rgba(255,255,255,0.55)' }}>
                    {renderEvidence(arg.evidence)}
                  </p>
                  {verifications?.filter(v => v.argument_index === i).map((v, vi) => (
                    <div key={vi} style={{ paddingLeft: 14, marginTop: 6 }}>
                      <EvidenceVerificationBadge status={v.status} correctValue={v.correct_value} sourceName={v.source_name} sourceUrl={v.source_url} inline />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Agreements (Round 2) */}
          {data?.agreements && data.agreements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'var(--consensus-agree)' }}>
                ✓ AGREEMENTS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.agreements.map((ag, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(78, 205, 196, 0.7)' }}>
                    With {ag.agent}: {ag.point} — {ag.reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Rebuttals (Round 2) */}
          {data?.rebuttals && data.rebuttals.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'var(--consensus-disagree)' }}>
                ✗ REBUTTALS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.rebuttals.map((rb, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(231, 76, 60, 0.7)' }}>
                    To {rb.agent}: {rb.counter_argument}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          <div style={{ marginBottom: 24 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'var(--consensus-compromise)' }}>
              ⚠️ RISKS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {analysis.risks.map((risk, i) => (
                <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(247, 183, 49, 0.7)' }}>
                  • {risk}
                </p>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div style={{ marginBottom: data ? 24 : 0 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'rgba(255,255,255,0.25)' }}>
              CONDITIONS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {analysis.conditions.map((cond, i) => (
                <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(255,255,255,0.4)' }}>
                  • {cond}
                </p>
              ))}
            </div>
          </div>

          {/* Revised position (Round 2) */}
          {data?.revised_position && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 4,
              marginBottom: 20,
              background: `${agent.color}08`,
              borderLeft: `2px solid ${agent.color}`,
            }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 6, color: agent.color }}>REVISED POSITION</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text-primary)' }}>{data.revised_position}</p>
            </div>
          )}

          {/* Compromises (Round 2) */}
          {data?.compromises && data.compromises.length > 0 && (
            <div>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 12, color: 'rgba(255,255,255,0.25)' }}>
                PROPOSED COMPROMISES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.compromises.map((c, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 14, color: 'rgba(255,255,255,0.55)' }}>
                    • {c}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

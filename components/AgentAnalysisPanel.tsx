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

export default function AgentAnalysisPanel({ agentId, round, analysis, round2, verifications }: AgentAnalysisPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = getAgent(agentId);
  if (!agent) return null;

  const data = round === 2 && round2 ? round2 : null;

  return (
    <div
      style={{
        borderRadius: 6,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          textAlign: 'left',
          transition: 'background 0.2s',
          background: expanded ? 'rgba(255,255,255,0.03)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 11, flexShrink: 0 }}>{agent.icon}</span>
        <span className="font-mono-label" style={{ fontSize: 10, flex: 1, color: 'rgba(255,255,255,0.5)' }}>
          {agent.name}
        </span>
        {data && (
          <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
            CONFIDENCE {data.confidence}/10
          </span>
        )}
        <span
          style={{
            fontSize: 10,
            transition: 'transform 0.2s',
            color: 'rgba(255,255,255,0.25)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '16px 20px 20px' }}>
          {/* Position */}
          <div
            style={{
              padding: '10px 14px',
              marginBottom: 18,
              borderRadius: 4,
              fontStyle: 'italic',
              fontSize: 12,
              lineHeight: 1.6,
              borderLeft: '2px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {analysis.position}
          </div>

          {/* Verification responses (Round 2) */}
          {data?.verification_responses && data.verification_responses.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
                VERIFICATION RESPONSES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.verification_responses.map((vr, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: '2px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
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
            <div style={{ marginBottom: 18 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
                DISCREPANCY RESPONSES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.discrepancy_responses.map((dr, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: '2px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }}>
                    <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                      {dr.my_response === 'concede' ? 'CONCEDE' : dr.my_response === 'defend' ? 'DEFEND' : 'PARTIAL'}
                    </span>
                    {dr.stems_from_assumption_conflict && (
                      <span className="font-mono-label" style={{ fontSize: 8, marginLeft: 6, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                        FRAMING
                      </span>
                    )}
                    <span style={{ display: 'block', marginTop: 4 }}>{dr.reasoning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arguments */}
          <div style={{ marginBottom: 18 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
              ARGUMENTS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analysis.arguments.map((arg, i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, marginBottom: 3, color: 'rgba(255,255,255,0.55)' }}>
                    {arg.point}
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.6, paddingLeft: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {arg.evidence}
                  </p>
                  {verifications?.filter(v => v.argument_index === i).map((v, vi) => (
                    <div key={vi} style={{ paddingLeft: 12, marginTop: 4 }}>
                      <EvidenceVerificationBadge status={v.status} correctValue={v.correct_value} sourceName={v.source_name} sourceUrl={v.source_url} inline />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Agreements (Round 2) */}
          {data?.agreements && data.agreements.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
                AGREEMENTS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.agreements.map((ag, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 12, color: 'rgba(255,255,255,0.45)' }}>
                    With {ag.agent}: {ag.point} — {ag.reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Rebuttals (Round 2) */}
          {data?.rebuttals && data.rebuttals.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
                REBUTTALS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.rebuttals.map((rb, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 12, color: 'rgba(255,255,255,0.45)' }}>
                    To {rb.agent}: {rb.counter_argument}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          <div style={{ marginBottom: 18 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
              RISKS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {analysis.risks.map((risk, i) => (
                <p key={i} style={{ fontSize: 12, paddingLeft: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {risk}
                </p>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div style={{ marginBottom: data ? 18 : 0 }}>
            <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
              CONDITIONS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {analysis.conditions.map((cond, i) => (
                <p key={i} style={{ fontSize: 12, paddingLeft: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {cond}
                </p>
              ))}
            </div>
          </div>

          {/* Revised position (Round 2) */}
          {data?.revised_position && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 4,
              marginBottom: 14,
              background: 'rgba(255,255,255,0.02)',
              borderLeft: '2px solid rgba(255,255,255,0.1)',
            }}>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 4, color: 'rgba(255,255,255,0.4)' }}>REVISED POSITION</p>
              <p style={{ fontSize: 12, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>{data.revised_position}</p>
            </div>
          )}

          {/* Compromises (Round 2) */}
          {data?.compromises && data.compromises.length > 0 && (
            <div>
              <p className="font-mono-label" style={{ fontSize: 9, marginBottom: 8, color: 'rgba(255,255,255,0.4)' }}>
                PROPOSED COMPROMISES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.compromises.map((c, i) => (
                  <p key={i} style={{ fontSize: 12, paddingLeft: 12, color: 'rgba(255,255,255,0.45)' }}>
                    {c}
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

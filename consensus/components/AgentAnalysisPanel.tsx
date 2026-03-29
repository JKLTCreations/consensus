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
  // Replace [STAT: ...], [SOURCE: ...], [CAUSAL: ...] with styled pills
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
      className="rounded-sm overflow-hidden animate-slide-in"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? `${agent.color}30` : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: expanded ? `${agent.color}08` : 'transparent' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: agent.color }}
        />
        <span className="font-mono-label text-[11px] flex-1" style={{ color: agent.color }}>
          {agent.icon} {agent.name}
        </span>
        {data && (
          <span className="font-mono-tight text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            CONFIDENCE {data.confidence}/10
          </span>
        )}
        <span
          className="text-xs transition-transform duration-200"
          style={{
            color: 'rgba(255,255,255,0.25)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▸
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Position */}
          <div
            className="px-3 py-2 mb-3 rounded-sm italic text-sm"
            style={{
              borderLeft: `2px solid ${agent.color}`,
              color: 'var(--text-primary)',
              background: `${agent.color}08`,
            }}
          >
            {analysis.position}
          </div>

          {/* Verification responses (Round 2) */}
          {data?.verification_responses && data.verification_responses.length > 0 && (
            <div className="mb-3">
              <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--verification-verified)' }}>
                VERIFICATION RESPONSES
              </p>
              {data.verification_responses.map((vr, i) => (
                <div key={i} className="px-3 py-2 mb-1 rounded-sm text-xs" style={{
                  background: vr.verification_status === 'contradicted' ? 'rgba(78, 205, 196, 0.05)' : 'rgba(247, 183, 49, 0.05)',
                  borderLeft: `2px solid ${vr.verification_status === 'contradicted' ? 'var(--verification-verified)' : 'var(--verification-outdated)'}`,
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  <span className="font-mono-tight text-[9px]" style={{ color: vr.verification_status === 'contradicted' ? 'var(--verification-verified)' : 'var(--verification-outdated)' }}>
                    {vr.verification_status === 'contradicted' ? 'ACCEPTED' : 'DISPUTED'}
                  </span>
                  {' '}{vr.my_response}
                </div>
              ))}
            </div>
          )}

          {/* Discrepancy responses (Round 2) */}
          {data?.discrepancy_responses && data.discrepancy_responses.length > 0 && (
            <div className="mb-3">
              <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-compromise)' }}>
                DISCREPANCY RESPONSES
              </p>
              {data.discrepancy_responses.map((dr, i) => (
                <div key={i} className="px-3 py-2 mb-1 rounded-sm text-xs" style={{
                  background: dr.my_response === 'concede' ? 'rgba(78, 205, 196, 0.05)' : dr.my_response === 'defend' ? 'rgba(247, 183, 49, 0.05)' : 'rgba(255,255,255,0.02)',
                  borderLeft: `2px solid ${dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.15)'}`,
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  <span className="font-mono-tight text-[9px]" style={{
                    color: dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.45)'
                  }}>
                    {dr.my_response === 'concede' ? '✓ CONCEDE' : dr.my_response === 'defend' ? '⚔️ DEFEND' : '↔️ PARTIAL'}
                  </span>
                  {dr.stems_from_assumption_conflict && (
                    <span className="font-mono-label text-[8px] ml-2 px-1 py-0.5 rounded" style={{ background: 'rgba(247, 183, 49, 0.1)', color: 'var(--consensus-compromise)' }}>
                      FRAMING
                    </span>
                  )}
                  <span className="block mt-1">{dr.reasoning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Arguments */}
          <div className="mb-3">
            <p className="font-mono-label text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ARGUMENTS
            </p>
            {analysis.arguments.map((arg, i) => (
              <div key={i} className="mb-2">
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  ▸ {arg.point}
                </p>
                <p className="text-xs leading-relaxed pl-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {renderEvidence(arg.evidence)}
                </p>
                {/* Show verification badge if applicable */}
                {verifications?.filter(v => v.argument_index === i).map((v, vi) => (
                  <div key={vi} className="pl-3 mt-1">
                    <EvidenceVerificationBadge status={v.status} correctValue={v.correct_value} sourceName={v.source_name} sourceUrl={v.source_url} inline />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Agreements (Round 2) */}
          {data?.agreements && data.agreements.length > 0 && (
            <div className="mb-3">
              <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-agree)' }}>
                ✓ AGREEMENTS
              </p>
              {data.agreements.map((ag, i) => (
                <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(78, 205, 196, 0.7)' }}>
                  With {ag.agent}: {ag.point} — {ag.reason}
                </p>
              ))}
            </div>
          )}

          {/* Rebuttals (Round 2) */}
          {data?.rebuttals && data.rebuttals.length > 0 && (
            <div className="mb-3">
              <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-disagree)' }}>
                ✗ REBUTTALS
              </p>
              {data.rebuttals.map((rb, i) => (
                <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(231, 76, 60, 0.7)' }}>
                  To {rb.agent}: {rb.counter_argument}
                </p>
              ))}
            </div>
          )}

          {/* Risks */}
          <div className="mb-3">
            <p className="font-mono-label text-[9px] mb-2" style={{ color: 'var(--consensus-compromise)' }}>
              ⚠️ RISKS
            </p>
            {analysis.risks.map((risk, i) => (
              <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(247, 183, 49, 0.7)' }}>
                • {risk}
              </p>
            ))}
          </div>

          {/* Conditions */}
          <div>
            <p className="font-mono-label text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              CONDITIONS
            </p>
            {analysis.conditions.map((cond, i) => (
              <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                • {cond}
              </p>
            ))}
          </div>

          {/* Revised position (Round 2) */}
          {data?.revised_position && (
            <div className="mt-3 px-3 py-2 rounded-sm" style={{ background: `${agent.color}08`, borderLeft: `2px solid ${agent.color}` }}>
              <p className="font-mono-label text-[9px] mb-1" style={{ color: agent.color }}>REVISED POSITION</p>
              <p className="text-xs italic" style={{ color: 'var(--text-primary)' }}>{data.revised_position}</p>
            </div>
          )}

          {/* Compromises (Round 2) */}
          {data?.compromises && data.compromises.length > 0 && (
            <div className="mt-3">
              <p className="font-mono-label text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                PROPOSED COMPROMISES
              </p>
              {data.compromises.map((c, i) => (
                <p key={i} className="text-xs pl-3 mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  • {c}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
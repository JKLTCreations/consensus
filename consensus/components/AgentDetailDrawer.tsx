'use client';

import { useState } from 'react';
import { Round1Analysis, Round2Analysis, SpectrumPosition } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface AgentDetailDrawerProps {
  agentId: string;
  spectrumPosition: SpectrumPosition;
  round1: Round1Analysis;
  round2: Round2Analysis;
  rationalityScore?: { score: number; reasoning: string };
  onClose: () => void;
}

type DrawerTab = 'position' | 'arguments' | 'risks' | 'concessions';

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

export default function AgentDetailDrawer({ agentId, spectrumPosition, round1, round2, rationalityScore, onClose }: AgentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('position');
  const agent = getAgent(agentId);
  if (!agent) return null;

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: 'position', label: 'Position' },
    { id: 'arguments', label: 'Arguments' },
    { id: 'risks', label: 'Risks' },
    { id: 'concessions', label: 'Concessions' },
  ];

  return (
    <div className="animate-detail-expand chamber-card" style={{ borderRadius: 6, borderColor: `${agent.color}20` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: agent.color }}
        />
        <span style={{ fontSize: 16 }}>{agent.icon}</span>
        <span className="font-mono-label text-[12px]" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <span className="font-mono-label text-[9px] px-3 py-1 rounded" style={{
          background: `${agent.color}15`,
          color: agent.color,
          marginLeft: 4,
        }}>
          {spectrumPosition.stance_label}
        </span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`drawer-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-6 animate-tab-fade" key={activeTab}>
        {activeTab === 'position' && (
          <div className="flex flex-col gap-6">
            {/* Initial position */}
            <div>
              <p className="font-mono-label text-[9px] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                INITIAL POSITION (ROUND 1)
              </p>
              <div className="px-4 py-3 rounded" style={{
                borderLeft: `2px solid ${agent.color}40`,
                color: 'rgba(255,255,255,0.55)',
                background: 'rgba(255,255,255,0.02)',
                lineHeight: 1.7,
                fontSize: 13,
              }}>
                {round1.position}
              </div>
            </div>

            {/* Revised position */}
            <div>
              <p className="font-mono-label text-[9px] mb-3" style={{ color: agent.color }}>
                REVISED POSITION (ROUND 2)
              </p>
              <div className="px-4 py-3 rounded" style={{
                borderLeft: `2px solid ${agent.color}`,
                color: 'var(--text-primary)',
                background: `${agent.color}08`,
                lineHeight: 1.7,
                fontSize: 13,
              }}>
                {round2.revised_position}
              </div>
            </div>

            {/* Rationality + Confidence */}
            <div className="flex gap-8 pt-2">
              {rationalityScore && (
                <div className="flex items-center gap-3">
                  <span className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>RATIONALITY</span>
                  <span className="font-mono-tight text-lg font-bold" style={{ color: agent.color }}>{rationalityScore.score}</span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/100</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>CONFIDENCE</span>
                <span className="font-mono-tight text-lg font-bold" style={{ color: agent.color }}>{round2.confidence}</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/10</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'arguments' && (
          <div className="flex flex-col gap-5">
            {round1.arguments.map((arg, i) => (
              <div key={i} style={{ paddingBottom: i < round1.arguments.length - 1 ? 16 : 0, borderBottom: i < round1.arguments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {arg.point}
                </p>
                <p className="text-[13px] leading-relaxed pl-4" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                  {renderEvidence(arg.evidence)}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="flex flex-col gap-6">
            {/* Risks */}
            <div>
              <p className="font-mono-label text-[9px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
                IDENTIFIED RISKS
              </p>
              <div className="flex flex-col gap-3">
                {round1.risks.map((risk, i) => (
                  <p key={i} className="text-[13px] pl-4 leading-relaxed" style={{ color: 'rgba(247, 183, 49, 0.7)', lineHeight: 1.6 }}>
                    {risk}
                  </p>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <p className="font-mono-label text-[9px] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                CONDITIONS FOR SUPPORT
              </p>
              <div className="flex flex-col gap-3">
                {round1.conditions.map((cond, i) => (
                  <p key={i} className="text-[13px] pl-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    {cond}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concessions' && (
          <div className="flex flex-col gap-6">
            {/* Agreements */}
            {round2.agreements.length > 0 && (
              <div>
                <p className="font-mono-label text-[9px] mb-3" style={{ color: 'var(--consensus-agree)' }}>
                  AGREEMENTS
                </p>
                <div className="flex flex-col gap-4">
                  {round2.agreements.map((ag, i) => {
                    const otherAgent = getAgent(ag.agent);
                    return (
                      <div key={i} className="pl-4" style={{ borderLeft: `2px solid ${otherAgent?.color || 'rgba(78,205,196,0.3)'}30` }}>
                        <p className="text-[13px] mb-1" style={{ color: 'rgba(78, 205, 196, 0.8)' }}>
                          <span>With </span>
                          <span style={{ color: otherAgent?.color || 'inherit', fontWeight: 600 }}>
                            {otherAgent?.shortName || ag.agent}
                          </span>
                          <span> on: {ag.point}</span>
                        </p>
                        <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{ag.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discrepancy Responses */}
            {round2.discrepancy_responses.length > 0 && (
              <div>
                <p className="font-mono-label text-[9px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
                  DISCREPANCY RESPONSES
                </p>
                <div className="flex flex-col gap-3">
                  {round2.discrepancy_responses.map((dr, i) => (
                    <div key={i} className="px-4 py-3 rounded" style={{
                      background: dr.my_response === 'concede' ? 'rgba(78, 205, 196, 0.05)' : dr.my_response === 'defend' ? 'rgba(247, 183, 49, 0.05)' : 'rgba(255,255,255,0.02)',
                      borderLeft: `2px solid ${dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.15)'}`,
                      color: 'rgba(255,255,255,0.55)',
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono-tight text-[9px]" style={{
                          color: dr.my_response === 'concede' ? 'var(--consensus-agree)' : dr.my_response === 'defend' ? 'var(--consensus-compromise)' : 'rgba(255,255,255,0.45)'
                        }}>
                          {dr.my_response === 'concede' ? 'CONCEDE' : dr.my_response === 'defend' ? 'DEFEND' : 'PARTIAL'}
                        </span>
                        {dr.stems_from_assumption_conflict && (
                          <span className="font-mono-label text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(247, 183, 49, 0.1)', color: 'var(--consensus-compromise)' }}>
                            FRAMING
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ lineHeight: 1.6 }}>{dr.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compromises */}
            {round2.compromises.length > 0 && (
              <div>
                <p className="font-mono-label text-[9px] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  PROPOSED COMPROMISES
                </p>
                <div className="flex flex-col gap-3">
                  {round2.compromises.map((c, i) => (
                    <p key={i} className="text-[13px] pl-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

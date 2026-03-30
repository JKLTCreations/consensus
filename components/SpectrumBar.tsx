'use client';

import { SpectrumPosition } from '@/lib/types';
import { getAgent } from '@/lib/agents';

interface SpectrumBarProps {
  positions: SpectrumPosition[];
  leftLabel: string;
  rightLabel: string;
  selectedAgent: string | null;
  onSelectAgent: (agentId: string) => void;
}

function computeRows(positions: SpectrumPosition[], threshold = 8): (SpectrumPosition & { row: number })[] {
  const sorted = [...positions].sort((a, b) => a.position - b.position);
  const result: (SpectrumPosition & { row: number })[] = [];

  for (const pos of sorted) {
    let row = 0;
    // Check for overlaps with already-placed items in the same row
    for (const placed of result) {
      if (placed.row === row && Math.abs(placed.position - pos.position) < threshold) {
        row++;
      }
    }
    result.push({ ...pos, row });
  }

  return result;
}

export default function SpectrumBar({ positions, leftLabel, rightLabel, selectedAgent, onSelectAgent }: SpectrumBarProps) {
  const positionsWithRows = computeRows(positions);
  const maxRow = Math.max(0, ...positionsWithRows.map(p => p.row));
  const bubbleAreaHeight = 36 + maxRow * 44; // base bubble size + stagger offset per row

  return (
    <div style={{ padding: '0 18px' }}>
      {/* Labels */}
      <div className="flex justify-between mb-2">
        <span className="font-mono-label text-[9px]" style={{ color: 'var(--consensus-disagree)', opacity: 0.7 }}>
          {leftLabel}
        </span>
        <span className="font-mono-label text-[9px]" style={{ color: 'var(--consensus-agree)', opacity: 0.7 }}>
          {rightLabel}
        </span>
      </div>

      {/* Bubble area */}
      <div style={{ position: 'relative', height: bubbleAreaHeight, marginBottom: 8 }}>
        {positionsWithRows.map((pos, i) => {
          const agent = getAgent(pos.agent_id);
          if (!agent) return null;
          const isSelected = selectedAgent === pos.agent_id;

          return (
            <div
              key={pos.agent_id}
              className={`spectrum-bubble animate-bubble-pop ${isSelected ? 'selected' : ''}`}
              style={{
                left: `calc(${pos.position}% - 18px)`,
                top: pos.row * 44,
                animationDelay: `${i * 80}ms`,
                background: `${agent.color}20`,
                borderColor: isSelected ? agent.color : `${agent.color}40`,
                boxShadow: isSelected ? `0 0 12px ${agent.color}30` : 'none',
              }}
              onClick={() => onSelectAgent(pos.agent_id)}
            >
              <span>{agent.icon}</span>
              <div className="spectrum-tooltip">
                <span style={{ color: agent.color, fontWeight: 600 }}>{agent.shortName}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 6px' }}>|</span>
                <span>{pos.one_line_summary}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* The gradient bar */}
      <div className="spectrum-bar">
        {/* Center tick */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: -3,
          bottom: -3,
          width: 1,
          background: 'rgba(255,255,255,0.15)',
        }} />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1.5" style={{ padding: '0 1px' }}>
        <span className="font-mono-label text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>0</span>
        <span className="font-mono-label text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>50</span>
        <span className="font-mono-label text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>100</span>
      </div>
    </div>
  );
}

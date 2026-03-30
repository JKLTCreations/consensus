'use client';

import AgentBadge from './AgentBadge';
import { agents } from '@/lib/agents';

interface AgentStatusBarProps {
  activeAgent: string | null;
  activeRound: number;
  completedAgents: Record<number, string[]>;
}

export default function AgentStatusBar({ activeAgent, activeRound, completedAgents }: AgentStatusBarProps) {
  const displayAgents = activeRound === 1.5 || activeRound === 3
    ? agents.filter(a => a.id === 'moderator')
    : agents.filter(a => a.id !== 'moderator');

  const totalAgents = displayAgents.length;
  const completedCount = (completedAgents[activeRound] || []).length;
  const progress = totalAgents > 0 ? (completedCount / totalAgents) * 100 : 0;

  return (
    <div className="animate-fade-up chamber-card" style={{ padding: '14px 20px', borderRadius: 6 }}>
      {/* Top row: Round label + progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            COMMITTEE MEMBERS
          </span>
          <span className="font-mono-label text-[9px]" style={{ color: 'var(--accent)' }}>
            {completedCount}/{totalAgents} REPORTED
          </span>
        </div>
        {/* Mini progress */}
        <div style={{ width: 80, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 2,
              background: 'var(--accent)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Agent seats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {displayAgents.map(agent => {
          const roundCompleted = completedAgents[activeRound] || [];
          const isActive = activeAgent === agent.id;
          const isComplete = roundCompleted.includes(agent.id);
          return (
            <AgentBadge
              key={agent.id}
              name={agent.name}
              shortName={agent.shortName}
              color={agent.color}
              icon={agent.icon}
              active={isActive}
              complete={isComplete}
            />
          );
        })}
      </div>
    </div>
  );
}

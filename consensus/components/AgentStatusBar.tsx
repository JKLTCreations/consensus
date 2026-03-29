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

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono-label text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          ROUND {activeRound === 1.5 ? '1.5' : activeRound}
        </span>
        <span className="font-mono-label text-[10px]" style={{ color: 'var(--accent)' }}>
          {activeRound === 0 && 'ASSUMPTION FRAMING'}
          {activeRound === 1 && 'INDEPENDENT ANALYSIS'}
          {activeRound === 1.25 && 'EVIDENCE VERIFICATION'}
          {activeRound === 1.5 && 'DISCREPANCY DETECTION'}
          {activeRound === 2 && 'CONFLICT RESOLUTION'}
          {activeRound === 3 && 'CONSENSUS SYNTHESIS'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
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
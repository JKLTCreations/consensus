'use client';

import { getAgent } from '@/lib/agents';

interface RationalityScoresProps {
  scores: Record<string, { score: number; reasoning: string }>;
}

export default function RationalityScores({ scores }: RationalityScoresProps) {
  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);

  return (
    <div>
      <p className="font-mono-label text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
        RATIONALITY SCORES
      </p>
      <div className="flex flex-col gap-3">
        {sorted.map(([agentId, { score, reasoning }]) => {
          const agent = getAgent(agentId);
          if (!agent) return null;
          return (
            <div key={agentId}>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono-label text-[10px] w-20 shrink-0" style={{ color: agent.color }}>
                  {agent.icon} {agent.shortName}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: agent.color }}
                  />
                </div>
                <span className="font-mono-tight text-[11px] w-8 text-right" style={{ color: agent.color }}>
                  {score}
                </span>
              </div>
              <p className="text-[10px] pl-[92px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'use client';

import { getAgent } from '@/lib/agents';

interface RationalityScoresProps {
  scores: Record<string, { score: number; reasoning: string }>;
}

export default function RationalityScores({ scores }: RationalityScoresProps) {
  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);

  return (
    <div className="chamber-card" style={{ padding: '16px 20px', borderRadius: 6 }}>
      <p className="font-mono-label text-[10px] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
        RATIONALITY SCORES
      </p>
      <div className="flex flex-col gap-3">
        {sorted.map(([agentId, { score, reasoning }], i) => {
          const agent = getAgent(agentId);
          if (!agent) return null;
          return (
            <div key={agentId} className="animate-stagger-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2 shrink-0" style={{ width: 100 }}>
                  <span style={{ fontSize: 12 }}>{agent.icon}</span>
                  <span className="font-mono-label text-[10px]" style={{ color: agent.color }}>
                    {agent.shortName}
                  </span>
                </div>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: agent.color }}
                  />
                </div>
                <span className="font-mono-tight text-[12px] w-8 text-right font-bold" style={{ color: agent.color }}>
                  {score}
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', paddingLeft: 100 + 12 }}>
                {reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

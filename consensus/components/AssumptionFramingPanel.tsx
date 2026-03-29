'use client';

import { Round0Assumptions, AssumptionConflict } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import AssumptionConflictCard from './AssumptionConflictCard';

interface AssumptionFramingPanelProps {
  assumptions: Record<string, Round0Assumptions>;
  conflicts: AssumptionConflict[];
}

const CATEGORIES: { key: keyof Round0Assumptions; label: string }[] = [
  { key: 'scope_assumptions', label: 'Scope' },
  { key: 'timeline_assumptions', label: 'Timeline' },
  { key: 'economic_context_assumptions', label: 'Economic Context' },
  { key: 'population_assumptions', label: 'Population' },
  { key: 'key_unstated_assumptions', label: 'Unstated' },
];

export default function AssumptionFramingPanel({ assumptions, conflicts }: AssumptionFramingPanelProps) {
  return (
    <div className="animate-fade-up">
      <h3 className="font-mono-label text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
        ROUND 0 — ASSUMPTION FRAMING
      </h3>

      {/* Agent assumption cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {Object.entries(assumptions).map(([agentId, agentAssumptions]) => {
          const agent = getAgent(agentId);
          if (!agent) return null;
          return (
            <div
              key={agentId}
              className="p-3 rounded-sm animate-slide-in"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{agent.icon}</span>
                <span className="font-mono-label text-[10px]" style={{ color: agent.color }}>
                  {agent.shortName}
                </span>
              </div>
              {CATEGORIES.map(({ key, label }) => {
                const items = agentAssumptions[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} className="mb-2">
                    <span className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {label}
                    </span>
                    {items.map((item, i) => (
                      <p key={i} className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        • {item}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div>
          <h4 className="font-mono-label text-[10px] mb-3" style={{ color: 'var(--consensus-compromise)' }}>
            ⚡ ASSUMPTION CONFLICTS ({conflicts.length})
          </h4>
          <div className="flex flex-col gap-3">
            {conflicts.map((conflict, i) => (
              <AssumptionConflictCard key={i} conflict={conflict} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
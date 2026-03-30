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
      <h3 className="font-mono-label" style={{ fontSize: 11, marginBottom: 20, color: 'var(--text-muted)' }}>
        ROUND 0 — ASSUMPTION FRAMING
      </h3>

      {/* Agent assumption cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        {Object.entries(assumptions).map(([agentId, agentAssumptions]) => {
          const agent = getAgent(agentId);
          if (!agent) return null;
          return (
            <div
              key={agentId}
              className="animate-slide-in"
              style={{
                padding: '16px 18px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 12 }}>{agent.icon}</span>
                <span className="font-mono-label" style={{ fontSize: 10, color: agent.color }}>
                  {agent.shortName}
                </span>
              </div>
              {CATEGORIES.map(({ key, label }) => {
                const items = agentAssumptions[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
                      {label}
                    </span>
                    {items.map((item, i) => (
                      <p key={i} style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
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
          <h4 className="font-mono-label" style={{ fontSize: 10, marginBottom: 16, color: 'var(--consensus-compromise)' }}>
            ⚡ ASSUMPTION CONFLICTS ({conflicts.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {conflicts.map((conflict, i) => (
              <AssumptionConflictCard key={i} conflict={conflict} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

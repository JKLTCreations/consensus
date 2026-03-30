'use client';

import { useState } from 'react';
import { Round0Assumptions, AssumptionConflict } from '@/lib/types';
import { getAgent } from '@/lib/agents';
import CollapsibleSection from './CollapsibleSection';
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

const PAGE_SIZE = 8;

function ConflictsDropdown({ conflicts }: { conflicts: AssumptionConflict[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(conflicts.length / PAGE_SIZE);
  const pageConflicts = conflicts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <CollapsibleSection
      title={`ASSUMPTION CONFLICTS (${conflicts.length})`}
      summary={`${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} detected`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pageConflicts.map((conflict, i) => (
          <AssumptionConflictCard key={page * PAGE_SIZE + i} conflict={conflict} />
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18 }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="font-mono-label"
            style={{
              fontSize: 9,
              padding: '5px 12px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              background: page === 0 ? 'transparent' : 'rgba(255,255,255,0.04)',
              color: page === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
              cursor: page === 0 ? 'default' : 'pointer',
            }}
          >
            ← PREV
          </button>
          <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="font-mono-label"
            style={{
              fontSize: 9,
              padding: '5px 12px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              background: page === totalPages - 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
              color: page === totalPages - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
              cursor: page === totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            NEXT →
          </button>
        </div>
      )}
    </CollapsibleSection>
  );
}

export default function AssumptionFramingPanel({ assumptions, conflicts }: AssumptionFramingPanelProps) {
  const agentCount = Object.keys(assumptions).length;

  return (
    <div>
      {/* Summary line */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        {agentCount} agents declared assumptions across {CATEGORIES.length} dimensions.
        {conflicts.length > 0 && ` ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} detected.`}
      </p>

      {/* Agent assumptions - collapsed */}
      <CollapsibleSection
        title="AGENT ASSUMPTIONS"
        summary={`${agentCount} agents`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
          {Object.entries(assumptions).map(([agentId, agentAssumptions]) => {
            const agent = getAgent(agentId);
            if (!agent) return null;
            return (
              <div
                key={agentId}
                style={{
                  padding: '14px 16px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  width: 260,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11 }}>{agent.icon}</span>
                  <span className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                    {agent.shortName}
                  </span>
                </div>
                {CATEGORIES.map(({ key, label }) => {
                  const items = agentAssumptions[key];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <span className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
                        {label}
                      </span>
                      {items.map((item, i) => (
                        <p key={i} style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                          {item}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Conflicts - collapsed */}
      {conflicts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <ConflictsDropdown conflicts={conflicts} />
        </div>
      )}
    </div>
  );
}

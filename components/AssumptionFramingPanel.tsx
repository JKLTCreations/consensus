'use client';

import { useState } from 'react';
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

const PAGE_SIZE = 8;

function ConflictsDropdown({ conflicts }: { conflicts: AssumptionConflict[] }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(conflicts.length / PAGE_SIZE);
  const pageConflicts = conflicts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      {/* Clickable header */}
      <button
        onClick={() => { setOpen(prev => !prev); setPage(0); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 0',
          width: '100%',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 10,
            color: 'var(--consensus-compromise)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
        <span className="font-mono-label" style={{ fontSize: 10, color: 'var(--consensus-compromise)' }}>
          ⚡ ASSUMPTION CONFLICTS ({conflicts.length})
        </span>
      </button>

      {/* Collapsible content */}
      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pageConflicts.map((conflict, i) => (
              <AssumptionConflictCard key={page * PAGE_SIZE + i} conflict={conflict} />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginTop: 18,
            }}>
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
        </div>
      )}
    </div>
  );
}

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

      {/* Conflicts dropdown with pagination */}
      {conflicts.length > 0 && (
        <ConflictsDropdown conflicts={conflicts} />
      )}
    </div>
  );
}

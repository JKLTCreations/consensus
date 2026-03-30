'use client';

import { useState, useCallback, useRef } from 'react';
import {
  DeliberationState,
  Round0Assumptions,
  Round1Analysis,
  Round2Analysis,
  VerificationReport,
  EnhancedDiscrepancyReport,
  AssumptionConflict,
  ConsensusReport as ConsensusReportType,
} from '@/lib/types';
import PolicyInput from './PolicyInput';
import AgentStatusBar from './AgentStatusBar';
import DeliberationTimeline from './DeliberationTimeline';
import SpectrumView from './SpectrumView';

const initialState: DeliberationState = {
  phase: 'input',
  proposal: '',
  round0: {},
  assumptionConflicts: [],
  round1: {},
  verification: null,
  discrepancies: null,
  round2: {},
  consensus: null,
  activeAgent: null,
  activeRound: 0,
  error: null,
};

export default function ConsensusApp() {
  const [state, setState] = useState<DeliberationState>(initialState);
  const [activeTab, setActiveTab] = useState<'consensus' | 'timeline'>('consensus');
  const [completedAgents, setCompletedAgents] = useState<Record<number, string[]>>({});
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (proposal: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState(prev => ({ ...initialState, phase: 'deliberating', proposal }));
    setCompletedAgents({});

    try {
      const response = await fetch('/api/deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        setState(prev => ({ ...prev, phase: 'error', error: errorData.error || `HTTP ${response.status}` }));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState(prev => ({ ...prev, phase: 'error', error: 'No response stream' }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            processEvent(event);
          } catch {
            // Skip malformed lines
          }
        }
      }

      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer);
          processEvent(event);
        } catch {
          // Skip
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setState(prev => ({
        ...prev,
        phase: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  function processEvent(event: Record<string, unknown>) {
    const type = event.type as string;

    switch (type) {
      case 'agent_start':
        setState(prev => ({
          ...prev,
          activeAgent: event.agent as string,
          activeRound: event.round as number,
        }));
        break;

      case 'agent_complete': {
        const agentId = event.agent as string;
        const round = event.round as number;
        const data = event.data;

        setCompletedAgents(prev => ({
          ...prev,
          [round]: [...(prev[round] || []), agentId],
        }));

        setState(prev => {
          const next = { ...prev, activeAgent: null };

          if (round === 0) {
            next.round0 = { ...prev.round0, [agentId]: data as Round0Assumptions };
          } else if (round === 1) {
            next.round1 = { ...prev.round1, [agentId]: data as Round1Analysis };
          } else if (round === 1.5) {
            // Discrepancy report handled by discrepancies_detected
          } else if (round === 2) {
            next.round2 = { ...prev.round2, [agentId]: data as Round2Analysis };
          } else if (round === 3) {
            // Consensus handled by consensus event
          }

          return next;
        });
        break;
      }

      case 'round_complete':
        setState(prev => ({ ...prev, activeAgent: null }));
        break;

      case 'assumption_conflicts':
        setState(prev => ({
          ...prev,
          assumptionConflicts: event.data as AssumptionConflict[],
        }));
        break;

      case 'verification_complete':
        setState(prev => ({
          ...prev,
          verification: event.data as VerificationReport,
          activeRound: 1.25,
        }));
        break;

      case 'programmatic_discrepancies':
        break;

      case 'discrepancies_detected':
        setState(prev => ({
          ...prev,
          discrepancies: event.data as EnhancedDiscrepancyReport,
        }));
        break;

      case 'consensus':
        setState(prev => ({
          ...prev,
          phase: 'complete',
          consensus: event.data as ConsensusReportType,
          activeAgent: null,
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          phase: 'error',
          error: event.message as string,
        }));
        break;
    }
  }

  const handleReset = () => {
    abortRef.current?.abort();
    setState(initialState);
    setCompletedAgents({});
    setActiveTab('consensus');
  };

  // ━━━ RENDER ━━━

  if (state.phase === 'input') {
    return <PolicyInput onSubmit={handleSubmit} />;
  }

  // Round label helper
  const getRoundLabel = (round: number) => {
    if (round === 0) return 'ASSUMPTION FRAMING';
    if (round === 1) return 'INDEPENDENT ANALYSIS';
    if (round === 1.25) return 'EVIDENCE VERIFICATION';
    if (round === 1.5) return 'DISCREPANCY DETECTION';
    if (round === 2) return 'CONFLICT RESOLUTION';
    if (round === 3) return 'CONSENSUS SYNTHESIS';
    return '';
  };

  return (
    <div className="congress-columns" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 48px' }}>

        {/* Chamber Header */}
        <div className="animate-fade-up" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          padding: '20px 24px',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Seal icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(196, 163, 90, 0.1)',
            border: '1px solid rgba(196, 163, 90, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, color: 'var(--accent)' }}>★</span>
          </div>

          {/* Proposal text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              {state.phase === 'deliberating' ? 'DELIBERATION IN SESSION' : 'DELIBERATION COMPLETE'}
            </p>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {state.proposal}
            </p>
          </div>

          {/* Status / Round indicator */}
          {state.phase === 'deliberating' && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                ROUND {state.activeRound === 1.25 ? '1.25' : state.activeRound === 1.5 ? '1.5' : state.activeRound}
              </p>
              <p className="font-mono-label text-[10px]" style={{ color: 'var(--accent)' }}>
                {getRoundLabel(state.activeRound)}
              </p>
            </div>
          )}
        </div>

        {/* Agent Status Bar (during deliberation) */}
        {state.phase === 'deliberating' && (
          <div style={{ marginBottom: 32 }}>
            <AgentStatusBar
              activeAgent={state.activeAgent}
              activeRound={state.activeRound}
              completedAgents={completedAgents}
            />
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <div
            className="animate-fade-up chamber-card"
            style={{ padding: '20px 24px', borderRadius: 8, marginBottom: 28, background: 'rgba(231, 76, 60, 0.06)', border: '1px solid rgba(231, 76, 60, 0.15)' }}
          >
            <p className="font-mono-label" style={{ fontSize: 10, marginBottom: 6, color: 'var(--consensus-disagree)' }}>
              DELIBERATION ERROR
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              {state.error}
            </p>
            <button
              onClick={handleReset}
              className="font-mono-label"
              style={{ fontSize: 10, marginTop: 14, padding: '8px 16px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
            >
              ← NEW DELIBERATION
            </button>
          </div>
        )}

        {/* Complete phase — tabs */}
        {state.phase === 'complete' && (
          <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <button
              onClick={() => setActiveTab('consensus')}
              className="font-mono-label text-[11px] px-5 py-2 rounded transition-all"
              style={{
                background: activeTab === 'consensus' ? 'rgba(196, 163, 90, 0.1)' : 'transparent',
                color: activeTab === 'consensus' ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${activeTab === 'consensus' ? 'rgba(196, 163, 90, 0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              ★ CONSENSUS
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className="font-mono-label text-[11px] px-5 py-2 rounded transition-all"
              style={{
                background: activeTab === 'timeline' ? 'rgba(196, 163, 90, 0.1)' : 'transparent',
                color: activeTab === 'timeline' ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${activeTab === 'timeline' ? 'rgba(196, 163, 90, 0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              PROCEEDINGS
            </button>
            <div className="flex-1" />
            <button
              onClick={handleReset}
              className="font-mono-label text-[10px] px-4 py-2 rounded transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(196,163,90,0.25)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
              }}
            >
              NEW DELIBERATION
            </button>
          </div>
        )}

        {/* Content */}
        {state.phase === 'complete' && activeTab === 'consensus' && state.consensus && (
          <SpectrumView report={state.consensus} round1={state.round1} round2={state.round2} />
        )}

        {(state.phase === 'deliberating' || (state.phase === 'complete' && activeTab === 'timeline')) && (
          <DeliberationTimeline state={state} />
        )}

        {/* Footer */}
        <footer className="mb-6 text-center" style={{ paddingTop: 64 }}>
          <div className="congress-divider" style={{ width: 100, margin: '0 auto 10px' }} />
          <p className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
            CONSENSUS v1.0 — DECISION SUPPORT, NOT DECISION MAKING &nbsp;|&nbsp; POWERED BY CLAUDE
          </p>
        </footer>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { sampleProposals } from '@/lib/sample-proposals';
import { analysisAgents } from '@/lib/agents';

interface PolicyInputProps {
  onSubmit: (proposal: string) => void;
}

export default function PolicyInput({ onSubmit }: PolicyInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      onSubmit(text.trim());
    }
  };

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      className="congress-columns"
    >
      {/* Chamber glow background */}
      <div className="chamber-glow" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px 24px' }}>

        {/* Header with seal */}
        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }} className="animate-fade-up">
          {/* Decorative star seal */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div className="seal-ring" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(196, 163, 90, 0.08)', border: '1px solid rgba(196, 163, 90, 0.2)' }}>
              <span style={{ fontSize: 22, color: 'var(--accent)' }}>★</span>
            </div>
          </div>
          <h1
            className="font-display gold-gradient"
            style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1 }}
          >
            CONSENSUS
          </h1>
          <p className="font-mono-label" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
            Multi-Agent Policy Deliberation Chamber
          </p>
          {/* Decorative divider */}
          <div className="congress-divider" style={{ width: 280, margin: '12px auto 0' }} />
        </div>

        {/* The Committee */}
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 28, position: 'relative', zIndex: 1 }} className="animate-fade-up" >
          <p className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: 12 }}>
            THE COMMITTEE
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {analysisAgents.map((agent, i) => (
              <div
                key={agent.id}
                className="agent-seat animate-stagger-up"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  minWidth: 110,
                  cursor: 'default',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `${agent.color}15`,
                  border: `1px solid ${agent.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {agent.icon}
                </div>
                <span className="font-mono-label" style={{ fontSize: 9, color: agent.color }}>
                  {agent.shortName}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.3 }}>
                  {agent.id === 'fiscal' && 'Budget & Tax'}
                  {agent.id === 'progressive' && 'Social Policy'}
                  {agent.id === 'macro' && 'Economics'}
                  {agent.id === 'welfare' && 'Public Impact'}
                  {agent.id === 'legal' && 'Constitutional'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div
          style={{
            width: '100%',
            maxWidth: 680,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 8px 8px 24px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            marginBottom: 32,
            position: 'relative',
            zIndex: 1,
          }}
          onFocus={() => {
            const el = document.getElementById('search-bar-wrapper');
            if (el) {
              el.style.borderColor = 'rgba(196,163,90,0.4)';
              el.style.boxShadow = '0 0 0 1px rgba(196,163,90,0.15)';
            }
          }}
          onBlur={() => {
            const el = document.getElementById('search-bar-wrapper');
            if (el) {
              el.style.borderColor = 'rgba(255,255,255,0.1)';
              el.style.boxShadow = 'none';
            }
          }}
          id="search-bar-wrapper"
          className="animate-fade-up"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Introduce a policy proposal for deliberation..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 15,
              lineHeight: '24px',
              resize: 'none',
              padding: '8px 0',
              maxHeight: 200,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: text.trim() ? 'linear-gradient(135deg, #C4A35A, #B8943F)' : 'rgba(255,255,255,0.08)',
              color: text.trim() ? '#070B14' : 'rgba(255,255,255,0.2)',
              cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
              fontSize: 18,
            }}
            aria-label="Begin Deliberation"
          >
            ↑
          </button>
        </div>

        {/* How it works - fills blank space */}
        <div style={{ width: '100%', maxWidth: 680, marginBottom: 32, position: 'relative', zIndex: 1 }} className="animate-fade-up">
          <p className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: 14 }}>
            THE DELIBERATION PROCESS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { step: '01', label: 'FRAMING', desc: 'Agents declare assumptions' },
              { step: '02', label: 'ANALYSIS', desc: 'Independent policy review' },
              { step: '03', label: 'DEBATE', desc: 'Resolve discrepancies' },
              { step: '04', label: 'CONSENSUS', desc: 'Synthesize final report' },
            ].map((item, i) => (
              <div
                key={i}
                className="animate-stagger-up"
                style={{
                  textAlign: 'center',
                  padding: '14px 8px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${300 + i * 100}ms`,
                }}
              >
                <span className="font-mono-label" style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700 }}>
                  {item.step}
                </span>
                <p className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 6, marginBottom: 2 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.3 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="congress-divider" style={{ width: 200, marginBottom: 24 }} />

        {/* Sample Proposals */}
        <div style={{ width: '100%', maxWidth: 720, position: 'relative', zIndex: 1 }} className="animate-fade-up">
          <p className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: 14 }}>
            SAMPLE PROPOSALS ON THE FLOOR
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 10,
            }}
          >
            {sampleProposals.map((proposal, i) => (
              <button
                type="button"
                key={proposal.id}
                onClick={() => { setText(proposal.text); }}
                className="animate-stagger-up"
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'inherit',
                  animationDelay: `${500 + i * 60}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(196,163,90,0.35)';
                  e.currentTarget.style.background = 'rgba(196,163,90,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="font-mono-label" style={{ fontSize: 9, color: 'var(--accent)', opacity: 0.5 }}>
                    {proposal.number}
                  </span>
                  <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {proposal.title}
                  </p>
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.4, color: 'rgba(255,255,255,0.3)' }}>
                  {proposal.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 'auto', paddingTop: 32, paddingBottom: 16, textAlign: 'center' }}>
          <div className="congress-divider" style={{ width: 120, margin: '0 auto 12px' }} />
          <p className="font-mono-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.12)' }}>
            CONSENSUS v1.0 — DECISION SUPPORT, NOT DECISION MAKING &nbsp;|&nbsp; POWERED BY CLAUDE
          </p>
        </footer>
      </div>
    </div>
  );
}

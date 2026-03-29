'use client';

import { useState, useRef, useEffect } from 'react';
import { sampleProposals } from '@/lib/sample-proposals';

interface PolicyInputProps {
  onSubmit: (proposal: string) => void;
}

export default function PolicyInput({ onSubmit }: PolicyInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content, single line by default
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
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 780,
        margin: '0 auto',
        padding: '48px 32px',
      }}
      className="animate-fade-up"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1
          className="font-display gold-gradient"
          style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}
        >
          CONSENSUS
        </h1>
        <p className="font-mono-label" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Multi-Agent Policy Deliberation
        </p>
      </div>

      {/* Search bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 8px 8px 24px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          marginBottom: 48,
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
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a policy proposal..."
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: 16,
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
          aria-label="Submit"
        >
          ↑
        </button>
      </div>

      {/* Sample Proposals */}
      <div style={{ width: '100%', maxWidth: 680 }}>
        <p className="font-mono-label" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>
          OR SELECT A SAMPLE PROPOSAL
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
          }}
        >
          {sampleProposals.map((proposal) => (
            <button
              type="button"
              key={proposal.id}
              onClick={() => { setText(proposal.text); }}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(196,163,90,0.35)';
                e.currentTarget.style.background = 'rgba(196,163,90,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {proposal.title}
              </p>
              <p style={{ fontSize: 11, lineHeight: 1.4, color: 'rgba(255,255,255,0.35)' }}>
                {proposal.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', paddingTop: 48, textAlign: 'center' }}>
        <p className="font-mono-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>
          CONSENSUS v1.0 — DECISION SUPPORT, NOT DECISION MAKING &nbsp;|&nbsp; POWERED BY CLAUDE
        </p>
      </footer>
    </div>
  );
}

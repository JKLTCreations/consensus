'use client';

import { useState } from 'react';
import { sampleProposals } from '@/lib/sample-proposals';

interface PolicyInputProps {
  onSubmit: (proposal: string) => void;
}

export default function PolicyInput({ onSubmit }: PolicyInputProps) {
  const [text, setText] = useState('');

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-6xl md:text-7xl font-black gold-gradient mb-4 tracking-tight">
          CONSENSUS
        </h1>
        <p className="font-mono-label text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Multi-Agent Policy Deliberation
        </p>
      </div>

      {/* Input */}
      <div className="mb-12">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a government financial policy proposal for multi-agent analysis..."
          rows={6}
          className="w-full px-5 py-4 rounded-sm text-[15px] leading-relaxed resize-none transition-colors duration-200 focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            className="font-mono-label text-xs px-8 py-3 rounded-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
            style={{
              background: text.trim() ? 'linear-gradient(135deg, C4A35A_1, B8943F_1)' : 'rgba(255,255,255,0.05)',
              color: text.trim() ? '070B14_1' : 'rgba(255,255,255,0.25)',
            }}
          >
            BEGIN DELIBERATION →
          </button>
        </div>
      </div>

      {/* Sample Proposals */}
      <div>
        <p className="font-mono-label text-[10px] mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          OR SELECT A SAMPLE PROPOSAL
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleProposals.map((proposal) => (
            <button
              key={proposal.id}
              onClick={() => { setText(proposal.text); }}
              className="text-left px-4 py-4 rounded-sm transition-all duration-200 group"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'rgba(196,163,90,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono-label text-[10px] mt-1" style={{ color: 'var(--accent)' }}>
                  {proposal.number}
                </span>
                <div>
                  <p className="font-display text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {proposal.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {proposal.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center">
        <p className="font-mono-label text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          CONSENSUS v1.0 — DECISION SUPPORT, NOT DECISION MAKING &nbsp;|&nbsp; POWERED BY CLAUDE
        </p>
      </footer>
    </div>
  );
}
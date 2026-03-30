'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({ title, summary, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          ▶
        </span>
        <span
          className="font-mono-label"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}
        >
          {title}
        </span>
        {!open && summary && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.25)',
              marginLeft: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            — {summary}
          </span>
        )}
      </button>
      {open && (
        <div style={{ paddingTop: 12, paddingLeft: 20 }}>
          {children}
        </div>
      )}
    </div>
  );
}

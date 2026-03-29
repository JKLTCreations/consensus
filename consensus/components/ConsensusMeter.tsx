'use client';

interface ConsensusMeterProps {
  score: number;
}

export default function ConsensusMeter({ score }: ConsensusMeterProps) {
  const color = score >= 70 ? 'var(--consensus-agree)' : score >= 40 ? 'var(--consensus-compromise)' : 'var(--consensus-disagree)';
  const label = score >= 70 ? 'ALIGNED' : score >= 40 ? 'PARTIAL' : 'DEADLOCK';

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <span
          className="font-display text-3xl font-bold"
          style={{ color }}
          title="Measures agreement among AI analysts, not correctness of the analysis."
        >
          {score}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono-label text-[9px]" style={{ color }}>
            {label}
          </span>
          <span className="font-mono-label text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            DEADLOCK — PARTIAL — ALIGNED
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <p className="text-[9px] mt-1 italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Measures agreement among AI analysts, not correctness.
        </p>
      </div>
    </div>
  );
}
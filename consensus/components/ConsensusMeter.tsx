'use client';

interface ConsensusMeterProps {
  score: number;
}

export default function ConsensusMeter({ score }: ConsensusMeterProps) {
  const color = score >= 70 ? 'var(--consensus-agree)' : score >= 40 ? 'var(--consensus-compromise)' : 'var(--consensus-disagree)';
  const label = score >= 70 ? 'ALIGNED' : score >= 40 ? 'PARTIAL' : 'DEADLOCK';

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      {/* Big score number */}
      <div style={{ marginBottom: 8 }}>
        <span
          className="font-display"
          style={{ fontSize: 48, fontWeight: 900, color, lineHeight: 1 }}
          title="Measures agreement among AI analysts, not correctness of the analysis."
        >
          {score}
        </span>
      </div>

      {/* Label */}
      <p className="font-mono-label text-[10px] mb-3" style={{ color }}>
        {label}
      </p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 200, margin: '0 auto' }}>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono-label text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>DEADLOCK</span>
          <span className="font-mono-label text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>ALIGNED</span>
        </div>
      </div>

      <p className="text-[8px] mt-2 italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Agreement among AI analysts, not correctness.
      </p>
    </div>
  );
}

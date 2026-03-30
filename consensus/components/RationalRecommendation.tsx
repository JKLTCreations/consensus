'use client';

interface RationalRecommendationProps {
  recommendation: string;
}

export default function RationalRecommendation({ recommendation }: RationalRecommendationProps) {
  return (
    <div
      className="chamber-card"
      style={{
        padding: '20px 24px',
        borderRadius: 6,
        borderColor: 'rgba(196, 163, 90, 0.15)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: 'var(--accent)', fontSize: 12 }}>★</span>
        <p className="font-mono-label text-[10px]" style={{ color: 'var(--accent)' }}>
          EVIDENCE-BASED RECOMMENDATION
        </p>
      </div>
      <p className="font-display text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {recommendation}
      </p>
      <p className="text-[10px] mt-3 italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Reflects the position best supported by verified evidence. Not a decision.
      </p>
    </div>
  );
}

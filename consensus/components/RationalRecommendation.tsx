'use client';

interface RationalRecommendationProps {
  recommendation: string;
}

export default function RationalRecommendation({ recommendation }: RationalRecommendationProps) {
  return (
    <div
      className="px-5 py-4 rounded-sm"
      style={{
        background: 'rgba(196, 163, 90, 0.06)',
        border: '1px solid rgba(196, 163, 90, 0.2)',
      }}
    >
      <p className="font-mono-label text-[10px] mb-2" style={{ color: 'var(--accent)' }}>
        ★ EVIDENCE-BASED RECOMMENDATION
      </p>
      <p className="font-display text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {recommendation}
      </p>
      <p className="text-[10px] mt-3 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Reflects the position best supported by verified evidence. Not a decision.
      </p>
    </div>
  );
}
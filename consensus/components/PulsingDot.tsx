'use client';

interface PulsingDotProps {
  color: string;
  active?: boolean;
  complete?: boolean;
}

export default function PulsingDot({ color, active, complete }: PulsingDotProps) {
  if (complete) {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  }

  if (active) {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full animate-pulse-dot"
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
    />
  );
}
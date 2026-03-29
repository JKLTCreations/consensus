'use client';

import PulsingDot from './PulsingDot';

interface AgentBadgeProps {
  name: string;
  shortName: string;
  color: string;
  icon: string;
  active?: boolean;
  complete?: boolean;
}

export default function AgentBadge({ name, shortName, color, icon, active, complete }: AgentBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300"
      style={{
        background: active ? `${color}15` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.04)'}`,
      }}
      title={name}
    >
      <PulsingDot color={color} active={active} complete={complete} />
      <span className="text-xs" style={{ color: active || complete ? color : 'rgba(255,255,255,0.35)' }}>
        {icon}
      </span>
      <span
        className="font-mono-label text-[10px]"
        style={{ color: active || complete ? color : 'rgba(255,255,255,0.35)' }}
      >
        {shortName}
      </span>
    </div>
  );
}
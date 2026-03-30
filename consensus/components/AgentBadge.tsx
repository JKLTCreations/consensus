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
      className={`flex items-center gap-2.5 px-4 py-2 rounded transition-all duration-300 ${active ? 'agent-speaking' : ''}`}
      style={{
        background: active ? `${color}12` : complete ? `${color}08` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? `${color}50` : complete ? `${color}20` : 'rgba(255,255,255,0.04)'}`,
        minWidth: 120,
        justifyContent: 'center',
      }}
      title={name}
    >
      <PulsingDot color={color} active={active} complete={complete} />
      <span className="text-xs" style={{ color: active || complete ? color : 'rgba(255,255,255,0.3)' }}>
        {icon}
      </span>
      <span
        className="font-mono-label text-[10px]"
        style={{ color: active || complete ? color : 'rgba(255,255,255,0.3)' }}
      >
        {shortName}
      </span>
      {active && (
        <span className="font-mono-label text-[7px] px-1.5 py-0.5 rounded" style={{
          background: `${color}20`,
          color: color,
          marginLeft: 2,
        }}>
          SPEAKING
        </span>
      )}
    </div>
  );
}

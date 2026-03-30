'use client';

import { useState } from 'react';
import { ConsensusReport as ConsensusReportType, Round1Analysis, Round2Analysis } from '@/lib/types';
import SpectrumBar from './SpectrumBar';
import AgentDetailDrawer from './AgentDetailDrawer';
import ConsensusReport from './ConsensusReport';
import ConsensusMeter from './ConsensusMeter';

interface SpectrumViewProps {
  report: ConsensusReportType;
  round1: Record<string, Round1Analysis>;
  round2: Record<string, Round2Analysis>;
}

export default function SpectrumView({ report, round1, round2 }: SpectrumViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const spectrum = report.spectrum;

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(prev => prev === agentId ? null : agentId);
  };

  const selectedPosition = spectrum?.agent_positions?.find(p => p.agent_id === selectedAgent);

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Policy question header */}
      {spectrum && (
        <div className="text-center">
          <p className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>
            {spectrum.policy_question}
          </p>
        </div>
      )}

      {/* Spectrum bar + consensus score row */}
      <div className="chamber-card" style={{ padding: '24px 20px 20px', borderRadius: 6 }}>
        {spectrum ? (
          <>
            <SpectrumBar
              positions={spectrum.agent_positions}
              leftLabel={spectrum.left_label}
              rightLabel={spectrum.right_label}
              selectedAgent={selectedAgent}
              onSelectAgent={handleSelectAgent}
            />

            {/* Consensus direction */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-mono-label text-[9px] mb-1 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                CONSENSUS DIRECTION
              </p>
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                {spectrum.consensus_direction}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Consensus score — full width card */}
      <div className="chamber-card animate-scale-in" style={{ padding: '24px 20px', borderRadius: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
          <ConsensusMeter score={report.consensus_score} />
          <div>
            <p className="font-mono-label text-[10px] mb-2" style={{ color: 'var(--accent)' }}>
              EVIDENCE-BASED RECOMMENDATION
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {report.rational_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Agent detail drawer */}
      {selectedAgent && selectedPosition && round1[selectedAgent] && round2[selectedAgent] && (
        <AgentDetailDrawer
          key={selectedAgent}
          agentId={selectedAgent}
          spectrumPosition={selectedPosition}
          round1={round1[selectedAgent]}
          round2={round2[selectedAgent]}
          rationalityScore={report.agent_rationality_scores[selectedAgent]}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Toggle full report */}
      <div className="text-center" style={{ marginTop: 16, marginBottom: 8 }}>
        <button
          onClick={() => setShowFullReport(!showFullReport)}
          className="font-mono-label text-[10px] px-5 py-2 rounded transition-all"
          style={{
            background: showFullReport ? 'rgba(196, 163, 90, 0.1)' : 'rgba(255,255,255,0.03)',
            color: showFullReport ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${showFullReport ? 'rgba(196, 163, 90, 0.2)' : 'rgba(255,255,255,0.05)'}`,
          }}
          onMouseEnter={e => {
            if (!showFullReport) {
              e.currentTarget.style.borderColor = 'rgba(196,163,90,0.15)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }
          }}
          onMouseLeave={e => {
            if (!showFullReport) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
            }
          }}
        >
          {showFullReport ? '▾ HIDE FULL REPORT' : '▸ VIEW FULL REPORT'}
        </button>
      </div>

      {/* Full report */}
      {showFullReport && (
        <div className="animate-fade-up">
          <ConsensusReport report={report} />
        </div>
      )}
    </div>
  );
}

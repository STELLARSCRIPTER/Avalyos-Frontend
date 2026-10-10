import React from 'react';
import { CompareResponse } from '../types';

interface ComparisonChartProps {
  response: CompareResponse;
  regionAName?: string;
  regionBName?: string;
}

const SIGNAL_ORDER = ['financial', 'seismic', 'flood'];

const signalLabel = (s: string) => {
  const L = s.toLowerCase();
  if (L === 'financial') return 'FINANCIAL';
  if (L === 'seismic') return 'SEISMIC';
  if (L === 'flood') return 'FLOOD';
  return s.toUpperCase();
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  response,
  regionAName,
  regionBName,
}) => {
  const { region_a, region_b, result_a, result_b, summary } = response;
  const nameA = regionAName || region_a;
  const nameB = regionBName || region_b;

  // Build a lookup: { financial: {a, b}, seismic: {a, b}, flood: {a, b} }
  const sigA = Object.fromEntries(
    result_a.signals.map((s) => [s.signal, s]),
  );
  const sigB = Object.fromEntries(
    result_b.signals.map((s) => [s.signal, s]),
  );

  const rows = SIGNAL_ORDER.map((key) => {
    const a = sigA[key];
    const b = sigB[key];
    const scoreA = a?.available && a.score !== null ? a.score : null;
    const scoreB = b?.available && b.score !== null ? b.score : null;
    const delta =
      scoreA !== null && scoreB !== null ? Math.abs(scoreB - scoreA) : 0;
    return { key, label: signalLabel(key), scoreA, scoreB, delta };
  });

  const topSignal = summary.top_diverging_signal.toLowerCase();
  const compositeDelta = summary.score_difference;

  const renderBar = (score: number | null, color: string) => {
    const width = score !== null ? `${Math.min(score, 100)}%` : '0%';
    return (
      <div className="flex-1 h-3 bg-[#141414] rounded-sm overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width,
            backgroundColor: score !== null ? color : '#333333',
          }}
        />
      </div>
    );
  };

  const renderRow = (
    label: string,
    scoreA: number | null,
    scoreB: number | null,
    delta: number,
    isTopDivergent: boolean,
    isComposite: boolean = false,
  ) => (
    <div
      className={`grid grid-cols-[110px_1fr_60px_1fr_60px_70px] gap-3 items-center py-2.5 ${
        isTopDivergent && !isComposite
          ? 'border-l-2 border-[#C5A059] pl-3 bg-[#C5A059]/5 -ml-3'
          : 'pl-0'
      } ${isComposite ? 'border-t border-[#1F1F1F] mt-1 pt-3.5' : ''}`}
    >
      <span
        className={`font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider ${
          isComposite ? 'text-[#C5A059] font-bold' : 'text-[#888888]'
        }`}
      >
        {label}
      </span>

      {renderBar(scoreA, '#888888')}
      <span className="font-['JetBrains_Mono'] text-[11px] text-right text-[#c9c9c9]">
        {scoreA !== null ? scoreA.toFixed(0) : '—'}
      </span>

      {renderBar(scoreB, '#C5A059')}
      <span className="font-['JetBrains_Mono'] text-[11px] text-right text-[#c9c9c9]">
        {scoreB !== null ? scoreB.toFixed(0) : '—'}
      </span>

      <span
        className={`font-['JetBrains_Mono'] text-[11px] text-right ${
          isComposite || delta > 0 ? 'text-[#C5A059]' : 'text-[#666666]'
        }`}
      >
        {delta > 0 ? `+${delta.toFixed(delta >= 10 ? 0 : 1)}` : '—'}
      </span>
    </div>
  );

  return (
    <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-1">
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Signal Comparison
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: '#888888' }} />
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888]">
              {nameA}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: '#C5A059' }} />
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#C5A059]">
              {nameB}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-['JetBrains_Mono'] text-[#666666] uppercase tracking-wider mb-4">
        Score (0–100) per signal · Delta column shows divergence
      </div>

      <div>
        {rows.map((r) =>
          renderRow(r.label, r.scoreA, r.scoreB, r.delta, r.key === topSignal),
        )}
        {renderRow(
          'COMPOSITE',
          result_a.risk_score,
          result_b.risk_score,
          compositeDelta,
          false,
          true,
        )}
      </div>
    </div>
  );
};
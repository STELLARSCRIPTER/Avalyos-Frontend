import React from 'react';
import { CompareResponse } from '../types';

interface ComparisonSummaryProps {
  response: CompareResponse;
  regionAName?: string;
  regionBName?: string;
}

const signalLabel = (s: string) => {
  const L = s.toLowerCase();
  if (L === 'flood') return 'flood risk';
  if (L === 'seismic') return 'seismic activity';
  if (L === 'financial') return 'financial exposure';
  return s;
};

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  response,
  regionAName,
  regionBName,
}) => {
  const { summary, region_a, region_b } = response;
  const nameA = regionAName || region_a;
  const nameB = regionBName || region_b;

  const riskierName =
    summary.riskier_region === 'a'
      ? nameA
      : summary.riskier_region === 'b'
        ? nameB
        : null;

  const headline =
    summary.riskier_region === 'equal'
      ? 'Both regions score identically for this scenario.'
      : `${riskierName} is riskier by ${summary.score_difference.toFixed(1)} points.`;

  const subline =
    summary.riskier_region === 'equal'
      ? `${nameA} vs ${nameB}`
      : `${nameA} → ${nameB} · driven mainly by ${signalLabel(summary.top_diverging_signal)}`;

  return (
    <div className="border border-[#C5A059]/30 bg-[#C5A059]/5 rounded-sm p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
            Comparison · {region_a} vs {region_b}
          </p>
          <p className="mt-3 text-xl text-white leading-snug">
            {headline}
          </p>
          <p className="mt-2 text-xs font-['JetBrains_Mono'] text-[#999999] uppercase tracking-wider">
            {subline}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="text-[9px] font-['JetBrains_Mono'] font-bold uppercase tracking-[0.2em] text-[#C5A059] border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-2 rounded-sm">
            {signalLabel(summary.top_diverging_signal)}
          </div>
          <div className="text-[10px] font-['JetBrains_Mono'] text-[#666666] uppercase tracking-wider">
            Δ {summary.diverging_signal_delta.toFixed(1)}
          </div>
        </div>
      </div>

      <p className="mt-4 pt-4 border-t border-[#C5A059]/20 text-[13px] text-[#c9c9c9] leading-relaxed">
        {summary.summary_line}
      </p>
    </div>
  );
};
import React from 'react';

export interface SignalContribution {
  signal: string;
  score: number | null;
  weight: number;
  available: boolean;
}

export interface AnalyzeResponse {
  risk_score: number;
  risk_level: string;
  reasons: string[];
  suggestion: string;
  signals: SignalContribution[];
}

interface DecisionCardProps {
  result: AnalyzeResponse;
  compact?: boolean;
  onExport?: () => void;
  onSeeReasoning?: () => void;
  hideSharedReasons?: boolean;   // for compare view: omit reasons that are shared with the other region
  sharedReasons?: string[];      // reasons to filter out when hideSharedReasons is true
}

const levelColor = (level: string) => {
  const L = level.toUpperCase();
  if (L === 'LOW')
    return {
      text: '#4ade80',
      border: 'rgba(74,222,128,0.4)',
      bg: 'rgba(74,222,128,0.05)',
    };
  if (L === 'MEDIUM')
    return {
      text: '#C5A059',
      border: 'rgba(197,160,89,0.4)',
      bg: 'rgba(197,160,89,0.05)',
    };
  return {
    text: '#f87171',
    border: 'rgba(248,113,113,0.4)',
    bg: 'rgba(248,113,113,0.05)',
  };
};

export const DecisionCard: React.FC<DecisionCardProps> = ({
  result,
  compact = false,
  onExport,
  onSeeReasoning,
  hideSharedReasons = false,
  sharedReasons = [],
}) => {
  const colors = levelColor(result.risk_level);

  const visibleReasons = hideSharedReasons
    ? result.reasons.filter((r) => !sharedReasons.includes(r))
    : result.reasons;

  return (
    <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
            Decision Preview
          </p>
          <p className="mt-2 text-xs text-[#888888]">
            Multi-signal verdict · financial + seismic + flood
          </p>
        </div>
        <div
          className="text-[11px] font-['JetBrains_Mono'] font-bold uppercase tracking-[0.2em] px-3 py-2 rounded-sm border"
          style={{
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
          {result.risk_level} RISK
        </div>
      </div>

      {/* Verdict number */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif-title text-5xl text-white tracking-tight">
          {result.risk_score.toFixed(1)}
        </span>
        <span className="font-['JetBrains_Mono'] text-sm text-[#666666]">
          /100
        </span>
      </div>

      {/* Signal contribution bars */}
      {!compact && result.signals && result.signals.length > 0 && (
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
            Signal Contribution
          </p>
          <div className="space-y-3">
            {result.signals.map((s) => (
              <div key={s.signal} className="flex items-center gap-4">
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#888888] w-24 shrink-0">
                  {s.signal}
                </span>
                <div className="flex-1 h-2 bg-[#141414] rounded-sm overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width:
                        s.available && s.score !== null
                          ? `${Math.min(s.score, 100)}%`
                          : '0%',
                      backgroundColor: s.available ? '#C5A059' : '#333333',
                    }}
                  />
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#c9c9c9] w-16 text-right shrink-0">
                  {s.available && s.score !== null ? s.score.toFixed(0) : '—'}
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#666666] w-14 text-right shrink-0">
                  w {s.weight.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasons */}
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
          Reasons
        </p>
        <ul className="space-y-2">
          {visibleReasons.map((r, i) => (
            <li
              key={i}
              className="flex gap-3 text-[13px] text-[#c9c9c9] leading-relaxed"
            >
              <span className="text-[#C5A059] font-bold shrink-0">◆</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested action */}
      <div className="pt-4 border-t border-[#1F1F1F]">
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
          Suggested Action
        </p>
        <p className="text-[14px] text-white leading-relaxed">
          {result.suggestion}
        </p>
      </div>

      {/* Optional actions footer */}
      {(onExport || onSeeReasoning) && !compact && (
        <div className="pt-4 border-t border-[#1F1F1F] flex gap-3">
          {onSeeReasoning && (
            <button
              onClick={onSeeReasoning}
              className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#888888] hover:text-[#C5A059] transition-colors"
            >
              ▸ See full reasoning
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#888888] hover:text-[#C5A059] transition-colors"
            >
              ▸ Export decision record
            </button>
          )}
        </div>
      )}
    </div>
  );
};
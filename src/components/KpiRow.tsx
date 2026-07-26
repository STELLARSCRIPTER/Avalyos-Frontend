import React from 'react';

interface KpiRowProps {
  onSelectKpi: (kpiType: string) => void;
}

export const KpiRow: React.FC<KpiRowProps> = ({ onSelectKpi }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Global Risk Index */}
      <div
        onClick={() => onSelectKpi('risk-index')}
        className="glass-panel p-5 flex flex-col justify-between cursor-pointer hover:border-[#C5A059]/60 active:scale-[0.99] transition-all group"
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#666666] uppercase tracking-[0.25em]">
            GLOBAL RISK INDEX
          </p>
          <span className="material-symbols-outlined text-[#666666] group-hover:text-[#C5A059] text-[16px] transition-colors">
            expand_content
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-serif-title text-4xl font-normal text-white tracking-tight">6.4</span>
          <div className="flex items-center text-[#C5A059]">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="font-['JetBrains_Mono'] text-xs font-semibold ml-0.5">+0.8</span>
          </div>
        </div>
        <div className="w-full h-1 bg-[#1F1F1F] mt-3 overflow-hidden rounded-full">
          <div className="h-full bg-gradient-to-r from-[#C5A059] via-[#E2C282] to-[#D4AF37] w-[64%] rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
        </div>
      </div>

      {/* KPI 2: Active Crisis Zones */}
      <div
        onClick={() => onSelectKpi('crisis-zones')}
        className="glass-panel p-5 flex flex-col justify-between cursor-pointer hover:border-[#C5A059]/60 active:scale-[0.99] transition-all group"
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#666666] uppercase tracking-[0.25em]">
            ACTIVE CRISIS ZONES
          </p>
          <span className="material-symbols-outlined text-[#666666] group-hover:text-[#C5A059] text-[16px] transition-colors">
            expand_content
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-serif-title text-4xl font-normal text-[#C5A059] tracking-tight">12</span>
        </div>
        <p className="font-['Geist'] text-xs text-[#888888] mt-2">+2 in last 24h</p>
      </div>

      {/* KPI 3: Trade Volatility */}
      <div
        onClick={() => onSelectKpi('trade-volatility')}
        className="glass-panel p-5 flex flex-col justify-between cursor-pointer hover:border-[#C5A059]/60 active:scale-[0.99] transition-all group"
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#666666] uppercase tracking-[0.25em]">
            TRADE VOLATILITY
          </p>
          <span className="material-symbols-outlined text-[#666666] group-hover:text-[#C5A059] text-[16px] transition-colors">
            expand_content
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-serif-title text-4xl font-normal text-white tracking-tight">24.1%</span>
        </div>
        <p className="font-['Geist'] text-xs text-[#888888] mt-2">Baseline: 18.5%</p>
      </div>

      {/* KPI 4: Market Sentiment */}
      <div
        onClick={() => onSelectKpi('market-sentiment')}
        className="glass-panel p-5 flex flex-col justify-between cursor-pointer hover:border-[#C5A059]/60 active:scale-[0.99] transition-all group"
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#666666] uppercase tracking-[0.25em]">
            MARKET SENTIMENT
          </p>
          <span className="material-symbols-outlined text-[#666666] group-hover:text-[#C5A059] text-[16px] transition-colors">
            expand_content
          </span>
        </div>
        <div className="flex items-center gap-2.5 my-1">
          <span className="material-symbols-outlined text-[#C5A059] text-[26px] pulsating-dot">
            sensors
          </span>
          <span className="font-serif-title text-2xl font-normal text-white tracking-wider">
            BEARISH
          </span>
        </div>
        <p className="font-['Geist'] text-xs text-[#888888]">Aggregated AI Consensus</p>
      </div>
    </div>
  );
};

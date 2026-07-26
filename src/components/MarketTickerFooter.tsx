import React from 'react';

interface MarketTickerFooterProps {
  onSelectTicker?: (symbol: string) => void;
}

export const MarketTickerFooter: React.FC<MarketTickerFooterProps> = ({ onSelectTicker }) => {
  const tickerItems = [
    { symbol: 'EUR/USD', value: '1.0824', change: '+0.02%', positive: true, color: 'bg-[#C5A059]' },
    { symbol: 'BRENT CRUDE', value: '82.45', change: '+1.42%', positive: true, color: 'bg-[#C5A059]' },
    { symbol: 'VIX INDEX', value: '18.22', change: '+5.11%', positive: false, color: 'bg-[#ff8e8e]' },
    { symbol: 'GOLD OUNCE', value: '2024.10', change: '+0.15%', positive: true, color: 'bg-[#C5A059]' },
    { symbol: 'NASDAQ 100', value: '17,920.4', change: '-0.88%', positive: false, color: 'bg-[#ff8e8e]' },
    { symbol: 'BITCOIN', value: '$67,420', change: '+2.15%', positive: true, color: 'bg-[#C5A059]' },
    { symbol: 'T-NOTE 10Y', value: '4.22%', change: '-0.05%', positive: false, color: 'bg-[#ff8e8e]' },
  ];

  return (
    <footer className="mt-auto h-10 bg-[#0A0A0A] flex items-center overflow-hidden border-t border-[#1F1F1F] whitespace-nowrap sticky bottom-0 z-40">
      <div className="flex items-center gap-8 animate-marquee font-['JetBrains_Mono'] text-[10px] text-[#888888] uppercase tracking-[0.2em]">
        {/* Render twice for seamless infinite marquee scroll */}
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <span
            key={idx}
            onClick={() => onSelectTicker?.(item.symbol)}
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
            <span className="font-bold text-white">{item.symbol}</span>
            <span>{item.value}</span>
            <span className={item.positive ? 'text-[#C5A059]' : 'text-[#ff8e8e]'}>
              {item.change}
            </span>
          </span>
        ))}
      </div>
    </footer>
  );
};

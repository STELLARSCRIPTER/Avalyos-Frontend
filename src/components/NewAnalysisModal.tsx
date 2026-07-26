import React, { useState } from 'react';

interface AnalyzeResponse {
  risk_score: number;
  risk_level: string;
  reasons: string[];
  suggestion: string;
}

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

// Falls back to localhost:8000 for local dev. Set VITE_API_URL in your
// frontend .env to point at a different backend (e.g. in production).
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
}) => {
  // "initialTopic" (e.g. "Deep Analysis on Revenue") gets dropped into the
  // company field as a starting point, since that's the closest real input
  // the backend actually understands.
  const [company, setCompany] = useState<string>(initialTopic || '');
  const [sector, setSector] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<string>('1000000');
  const [timeHorizonYears, setTimeHorizonYears] = useState<string>('3');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(investmentAmount);
    const years = parseFloat(timeHorizonYears);

    if (!amount || amount <= 0) {
      setError('Investment amount must be greater than 0');
      return;
    }
    if (!years || years <= 0) {
      setError('Time horizon must be greater than 0');
      return;
    }
    if (!company.trim() && !sector.trim()) {
      setError('Enter a company name or a sector');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim() || null,
          sector: sector.trim() || null,
          investment_amount: amount,
          time_horizon_years: years,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail?.error || data?.detail || 'Analysis failed');
      }

      setResult(data as AnalyzeResponse);
    } catch (err: any) {
      console.error('Error running analysis:', err);
      setError(err?.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const isHighRisk = result?.risk_level?.toUpperCase() === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl bg-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-sm p-6 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-[#1F1F1F] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping"></span>
              <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
                AVALYOS RISK ENGINE
              </span>
            </div>
            <h2 className="font-serif-title text-2xl font-normal text-white mt-1">
              New Scenario Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-white p-1 rounded bg-[#141414] hover:bg-[#1F1F1F]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-['JetBrains_Mono'] text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] mb-1">
                COMPANY (OPTIONAL)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Manufacturing"
                className="w-full bg-[#141414] border border-[#1F1F1F] rounded-sm p-2.5 font-['Geist'] text-sm text-white focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] mb-1">
                SECTOR {company ? '(OPTIONAL)' : ''}
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g. Semiconductors"
                className="w-full bg-[#141414] border border-[#1F1F1F] rounded-sm p-2.5 font-['Geist'] text-sm text-white focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] focus:outline-none"
              />
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-['JetBrains_Mono'] text-[10px] text-[#666666] uppercase tracking-wider mb-1">
                INVESTMENT AMOUNT (USD)
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full bg-[#141414] border border-[#1F1F1F] rounded-sm p-2 font-['Geist'] text-xs text-white focus:border-[#C5A059] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[10px] text-[#666666] uppercase tracking-wider mb-1">
                TIME HORIZON (YEARS)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={timeHorizonYears}
                onChange={(e) => setTimeHorizonYears(e.target.value)}
                className="w-full bg-[#141414] border border-[#1F1F1F] rounded-sm p-2 font-['Geist'] text-xs text-white focus:border-[#C5A059] focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] font-bold rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(197,160,89,0.1)]"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Running Risk Analysis...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Run Risk Analysis
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-[#ff8e8e]/10 border border-[#ff8e8e]/40 rounded-sm text-[#ff8e8e] text-xs font-['Geist']">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Output */}
        {result && (
          <div className="mt-6 p-5 bg-[#141414] border border-[#1F1F1F] rounded-sm space-y-4">
            <div className="flex justify-between items-start border-b border-[#1F1F1F] pb-3">
              <div>
                <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.25em]">
                  ANALYSIS RESULT
                </span>
                <h3 className="font-serif-title text-xl font-normal text-white mt-1">
                  Risk Score: {result.risk_score.toFixed(1)} / 10
                </h3>
              </div>

              <span
                className={`font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm ${
                  isHighRisk
                    ? 'bg-[#ff8e8e]/20 text-[#ff8e8e] border border-[#ff8e8e]/40'
                    : 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40'
                }`}
              >
                RISK: {result.risk_level?.toUpperCase()}
              </span>
            </div>

            {/* Reasons */}
            {result.reasons?.length > 0 && (
              <div>
                <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] mb-2 uppercase tracking-[0.2em]">
                  KEY FACTORS
                </h4>
                <ul className="space-y-1">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-['Geist'] text-[#888888]">
                      <span className="text-[#C5A059]">&bull;</span> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestion */}
            <div>
              <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] mb-2 uppercase tracking-[0.2em]">
                RECOMMENDED ACTION
              </h4>
              <p className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-sm text-sm font-['Geist'] text-[#C5A059]">
                {result.suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
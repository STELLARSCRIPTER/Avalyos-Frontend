import React, { useState } from 'react';
import { CompanySearch } from './CompanySearch';
import { Company } from '../types';

const API_BASE = 'http://localhost:8000';

const SECTOR_OPTIONS = [
  'Technology',
  'Automotive',
  'Industrial',
  'Healthcare',
  'Chemicals',
  'Consumer Goods',
  'Food & Beverage',
];

interface SignalContribution {
  signal: string;
  score: number | null;
  weight: number;
  available: boolean;
}

interface AnalyzeResponse {
  risk_score: number;
  risk_level: string;
  reasons: string[];
  suggestion: string;
  signals: SignalContribution[];
}

export const ScenarioBuilderView: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [sector, setSector] = useState<string>('Industrial');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [timeHorizon, setTimeHorizon] = useState<string>('');
  const [scenarioLabel, setScenarioLabel] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const canAnalyze =
    !!company &&
    !!investmentAmount &&
    parseFloat(investmentAmount) > 0 &&
    !!timeHorizon &&
    parseFloat(timeHorizon) > 0;

  const handleAnalyze = async () => {
    if (!canAnalyze || !company) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.name,
          sector: sector,
          country: company.country || null,
          investment_amount: parseFloat(investmentAmount),
          time_horizon_years: parseFloat(timeHorizon),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body?.detail?.error || body?.detail || `Request failed (${res.status})`;
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level: string) => {
    const L = level.toUpperCase();
    if (L === 'LOW') return { text: '#4ade80', border: 'rgba(74,222,128,0.4)', bg: 'rgba(74,222,128,0.05)' };
    if (L === 'MEDIUM') return { text: '#C5A059', border: 'rgba(197,160,89,0.4)', bg: 'rgba(197,160,89,0.05)' };
    return { text: '#f87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.05)' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
          New Scenario
        </p>
        <h1 className="mt-3 font-serif-title text-3xl text-white tracking-tight">
          Define the decision
        </h1>
        <p className="mt-2 text-sm text-[#888888]">
          Pick a company and the parameters. Avalyos will analyze available signals and return a risk verdict with reasons and suggested actions.
        </p>
      </div>

      {/* Company */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Company
        </label>
        <CompanySearch
          onSelect={(c) => {
            setCompany(c);
            setResult(null);
            setError(null);
          }}
        />
        {company && (
          <div className="mt-3 flex items-center gap-3 bg-[#C5A059]/5 border border-[#C5A059]/30 rounded-sm px-4 py-3">
            <span className="material-symbols-outlined text-[#C5A059] text-[20px]">
              domain
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{company.name}</div>
              <div className="text-[10px] font-['JetBrains_Mono'] text-[#888888] uppercase tracking-wider mt-0.5">
                {[company.city, company.country].filter(Boolean).join(' · ')} · LEI {company.lei.slice(0, 8)}…
              </div>
            </div>
            <button
              onClick={() => {
                setCompany(null);
                setResult(null);
                setError(null);
              }}
              className="text-[#666666] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Sector */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Sector
        </label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 rounded-sm outline-none transition-colors"
        >
          {SECTOR_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Investment amount */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Investment Amount (USD)
        </label>
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          placeholder="4200000"
          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 rounded-sm outline-none transition-colors placeholder:text-[#555555]"
        />
      </div>

      {/* Time horizon */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Time Horizon (years)
        </label>
        <input
          type="number"
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(e.target.value)}
          placeholder="0.5"
          step="0.25"
          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 rounded-sm outline-none transition-colors placeholder:text-[#555555]"
        />
      </div>

      {/* Scenario label */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Scenario Description (optional)
        </label>
        <input
          type="text"
          value={scenarioLabel}
          onChange={(e) => setScenarioLabel(e.target.value)}
          placeholder="India govt contract, Nov–Dec delivery"
          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] focus:border-[#C5A059] text-white font-['JetBrains_Mono'] text-xs px-4 py-3 rounded-sm outline-none transition-colors placeholder:text-[#555555]"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze || loading}
        className="w-full border border-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black text-[#C5A059] text-[11px] uppercase tracking-[0.2em] font-['JetBrains_Mono'] font-bold py-4 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#C5A059]/10 disabled:hover:text-[#C5A059]"
      >
        {loading ? 'Analyzing…' : 'Analyze Scenario'}
      </button>

      {/* Error */}
      {error && (
        <div className="border border-red-500/40 bg-red-500/5 text-red-400 text-xs font-['JetBrains_Mono'] px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      {/* Result panel */}
      {result && (
        <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-sm p-6 space-y-6">
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
                color: levelColor(result.risk_level).text,
                borderColor: levelColor(result.risk_level).border,
                backgroundColor: levelColor(result.risk_level).bg,
              }}
            >
              {result.risk_level} RISK
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-serif-title text-5xl text-white tracking-tight">
              {result.risk_score.toFixed(1)}
            </span>
            <span className="font-['JetBrains_Mono'] text-sm text-[#666666]">/100</span>
          </div>

          {/* Signal contribution bars */}
          {result.signals && result.signals.length > 0 && (
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
                          width: s.available && s.score !== null ? `${Math.min(s.score, 100)}%` : '0%',
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

          <div>
            <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
              Reasons
            </p>
            <ul className="space-y-2">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-[#c9c9c9] leading-relaxed">
                  <span className="text-[#C5A059] font-bold shrink-0">◆</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#1F1F1F]">
            <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
              Suggested Action
            </p>
            <p className="text-[14px] text-white leading-relaxed">
              {result.suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
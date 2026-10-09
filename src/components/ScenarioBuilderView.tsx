import React, { useState } from 'react';
import { CompanySearch } from './CompanySearch';
import { DecisionCard, AnalyzeResponse } from './DecisionCard';
import { RegionSelect } from './RegionSelect';
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

export const ScenarioBuilderView: React.FC = () => {
  const [region, setRegion] = useState<string>('');   // '' means "All regions"
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
          // If a region is picked, prefer it over the company's registered country.
          // That way the user can evaluate "this company, in this region" explicitly.
          country: region || company.country || null,
          investment_amount: parseFloat(investmentAmount),
          time_horizon_years: parseFloat(timeHorizon),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          body?.detail?.error || body?.detail || `Request failed (${res.status})`;
        throw new Error(
          typeof detail === 'string' ? detail : JSON.stringify(detail)
        );
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
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
          Pick a company and the parameters. Avalyos will analyze available
          signals and return a risk verdict with reasons and suggested actions.
        </p>
      </div>

      {/* Region */}
      <RegionSelect
        value={region || null}
        onChange={(iso) => {
          setRegion(iso);
          // Changing region invalidates the selected company — the user
          // should re-pick a company from the new scope.
          setCompany(null);
          setResult(null);
          setError(null);
        }}
        label="Region"
        placeholder="All regions (search globally)"
        includeAll={true}
      />

      {/* Company */}
      <div className="space-y-2">
        <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
          Company
        </label>
        <CompanySearch
          region={region || null}
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
                {[company.city, company.country].filter(Boolean).join(' · ')} ·
                LEI {company.lei.slice(0, 8)}…
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
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
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

      {/* Decision card */}
      {result && <DecisionCard result={result} />}
    </div>
  );
};
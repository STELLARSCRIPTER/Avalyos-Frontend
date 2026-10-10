import React, { useState } from 'react';
import { CompanySearch } from './CompanySearch';
import { DecisionCard } from './DecisionCard';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonChart } from './ComparisonChart';
import { RegionSelect } from './RegionSelect';
import { Company, AnalyzeResponse, CompareResponse } from '../types';

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

type Mode = 'single' | 'compare';

export const ScenarioBuilderView: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');

  // Shared form state
  const [company, setCompany] = useState<Company | null>(null);
  const [sector, setSector] = useState<string>('Industrial');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [timeHorizon, setTimeHorizon] = useState<string>('');
  const [scenarioLabel, setScenarioLabel] = useState<string>('');

  // Region state
  const [region, setRegion] = useState<string>('');
  const [regionA, setRegionA] = useState<string>('');
  const [regionB, setRegionB] = useState<string>('');

  // Network state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<AnalyzeResponse | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

  const hasValidAmount =
    !!investmentAmount && parseFloat(investmentAmount) > 0;
  const hasValidHorizon = !!timeHorizon && parseFloat(timeHorizon) > 0;

  const canSingleAnalyze = !!company && hasValidAmount && hasValidHorizon;
  const canCompare =
    !!company &&
    hasValidAmount &&
    hasValidHorizon &&
    !!regionA &&
    !!regionB &&
    regionA !== regionB;

  const resetResults = () => {
    setSingleResult(null);
    setCompareResult(null);
    setError(null);
  };

  const handleSingleAnalyze = async () => {
    if (!canSingleAnalyze || !company) return;

    setLoading(true);
    resetResults();

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.name,
          sector,
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
          typeof detail === 'string' ? detail : JSON.stringify(detail),
        );
      }

      setSingleResult(await res.json());
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!canCompare || !company) return;

    setLoading(true);
    resetResults();

    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.name,
          sector,
          investment_amount: parseFloat(investmentAmount),
          time_horizon_years: parseFloat(timeHorizon),
          region_a: regionA,
          region_b: regionB,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          body?.detail?.error || body?.detail || `Request failed (${res.status})`;
        throw new Error(
          typeof detail === 'string' ? detail : JSON.stringify(detail),
        );
      }

      setCompareResult(await res.json());
    } catch (err: any) {
      setError(err?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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

      {/* Mode toggle */}
      <div className="flex items-center gap-1 border border-[#1F1F1F] bg-[#0A0A0A] rounded-sm p-1 w-fit">
        <button
          onClick={() => {
            setMode('single');
            resetResults();
          }}
          className={`px-5 py-2 text-[10px] font-['JetBrains_Mono'] uppercase tracking-[0.2em] font-bold rounded-sm transition-colors ${
            mode === 'single'
              ? 'bg-[#C5A059] text-black'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Single Region
        </button>
        <button
          onClick={() => {
            setMode('compare');
            resetResults();
          }}
          className={`px-5 py-2 text-[10px] font-['JetBrains_Mono'] uppercase tracking-[0.2em] font-bold rounded-sm transition-colors ${
            mode === 'compare'
              ? 'bg-[#C5A059] text-black'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Compare Regions
        </button>
      </div>

      {/* Form */}
      <div className="max-w-3xl space-y-6">
        {/* Region(s) */}
        {mode === 'single' && (
          <RegionSelect
            value={region || null}
            onChange={(iso) => {
              setRegion(iso);
              setCompany(null);
              resetResults();
            }}
            label="Region"
            placeholder="All regions (search globally)"
            includeAll={true}
          />
        )}

        {mode === 'compare' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RegionSelect
              value={regionA || null}
              onChange={(iso) => {
                setRegionA(iso);
                resetResults();
              }}
              label="Region A"
              placeholder="Select first region…"
            />
            <RegionSelect
              value={regionB || null}
              onChange={(iso) => {
                setRegionB(iso);
                resetResults();
              }}
              label="Region B"
              placeholder="Select second region…"
            />
          </div>
        )}

        {/* Company */}
        <div className="space-y-2">
          <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold">
            Company
          </label>
          <CompanySearch
            region={mode === 'single' ? region || null : null}
            onSelect={(c) => {
              setCompany(c);
              resetResults();
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
                  resetResults();
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

        {/* Investment + Horizon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Action button */}
        <button
          onClick={mode === 'single' ? handleSingleAnalyze : handleCompare}
          disabled={
            loading || (mode === 'single' ? !canSingleAnalyze : !canCompare)
          }
          className="w-full border border-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black text-[#C5A059] text-[11px] uppercase tracking-[0.2em] font-['JetBrains_Mono'] font-bold py-4 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#C5A059]/10 disabled:hover:text-[#C5A059]"
        >
          {loading
            ? mode === 'single'
              ? 'Analyzing…'
              : 'Comparing…'
            : mode === 'single'
              ? 'Analyze Scenario'
              : 'Compare Regions'}
        </button>

        {/* Error */}
        {error && (
          <div className="border border-red-500/40 bg-red-500/5 text-red-400 text-xs font-['JetBrains_Mono'] px-4 py-3 rounded-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results — Single mode */}
      {mode === 'single' && singleResult && (
        <div className="max-w-3xl">
          <DecisionCard result={singleResult} />
        </div>
      )}

      {/* Results — Compare mode */}
      {mode === 'compare' && compareResult && (() => {
        const aReasons = compareResult.result_a.reasons;
        const bReasons = compareResult.result_b.reasons;
        const sharedReasons = aReasons.filter((r) => bReasons.includes(r));

        return (
          <div className="space-y-6">
            <ComparisonSummary response={compareResult} />
            <ComparisonChart response={compareResult} />

            {sharedReasons.length > 0 && (
              <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-sm p-6">
                <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#888888] font-bold mb-3">
                  Shared Reasons · both regions
                </p>
                <ul className="space-y-2">
                  {sharedReasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[13px] text-[#888888] leading-relaxed"
                    >
                      <span className="text-[#666666] font-bold shrink-0">◆</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DecisionCard
                result={compareResult.result_a}
                hideSharedReasons={true}
                sharedReasons={sharedReasons}
              />
              <DecisionCard
                result={compareResult.result_b}
                hideSharedReasons={true}
                sharedReasons={sharedReasons}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
};
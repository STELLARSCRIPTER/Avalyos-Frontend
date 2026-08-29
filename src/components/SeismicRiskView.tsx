import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GOLD = '#C5A059';
const RED = '#ff8e8e';
const BLUE = '#7ec8e3';
const GREEN = '#8fd19e';
const AMBER = '#e3c17e';
const GRID = '#1F1F1F';

const TIER_COLORS: Record<string, string> = {
  SEVERE: RED,
  HIGH: AMBER,
  ELEVATED: GOLD,
  MODERATE: BLUE,
  LOW: GREEN,
};

interface CountrySeismicRisk {
  country: string;
  window_days: number;
  risk_score: number;
  risk_level: string;
  event_count: number;
  max_magnitude: number | null;
  avg_magnitude: number | null;
  reasons: string[];
}

interface BranchSeismicExposure {
  branch_code: string;
  branch_name: string | null;
  company: string | null;
  country: string | null;
  window_days: number | null;
  risk_score: number | null;
  risk_level: string;
  event_count: number | null;
  max_magnitude: number | null;
  avg_magnitude: number | null;
  reasons: string[];
}

const SectionHeader: React.FC<{ step: string; title: string; subtitle: string }> = ({ step, title, subtitle }) => (
  <div className="mb-4">
    <span className="font-['JetBrains_Mono'] text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.25em] px-2 py-0.5 bg-[#C5A059]/15 rounded-sm border border-[#C5A059]/30">
      {step}
    </span>
    <h3 className="font-serif-title text-xl font-normal text-white mt-2">{title}</h3>
    <p className="font-['Geist'] text-xs text-[#888888] mt-1">{subtitle}</p>
  </div>
);

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 bg-[#141414] border border-[#1F1F1F] rounded-sm">
    <p className="font-['JetBrains_Mono'] text-[9px] text-[#666666] uppercase tracking-wider">{label}</p>
    <p className="font-serif-title text-xl font-normal text-white mt-1">{value}</p>
  </div>
);

const TierBadge: React.FC<{ level: string }> = ({ level }) => (
  <span
    className="font-['JetBrains_Mono'] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border"
    style={{
      color: TIER_COLORS[level] || '#666666',
      borderColor: `${TIER_COLORS[level] || '#666666'}55`,
      backgroundColor: `${TIER_COLORS[level] || '#666666'}15`,
    }}
  >
    {level}
  </span>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0A0A] border border-[#C5A059]/40 rounded-sm p-2 text-xs font-['Geist'] text-white">
      {payload.map((p: any, i: number) => (
        <div key={i}>{p.name || p.dataKey}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
      ))}
    </div>
  );
};

export const SeismicRiskView: React.FC = () => {
  const [countries, setCountries] = useState<CountrySeismicRisk[]>([]);
  const [branches, setBranches] = useState<BranchSeismicExposure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState<number>(90);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [countriesRes, branchesRes] = await Promise.all([
          fetch(`${API_BASE}/seismic-risk?days=${windowDays}`),
          fetch(`${API_BASE}/seismic-risk/branches/exposure?days=${windowDays}`),
        ]);

        if (!countriesRes.ok) {
          const err = await countriesRes.json().catch(() => null);
          throw new Error(err?.detail?.error || 'Failed to load seismic risk overview');
        }
        if (!branchesRes.ok) {
          const err = await branchesRes.json().catch(() => null);
          throw new Error(err?.detail?.error || 'Failed to load branch seismic exposure');
        }

        setCountries(await countriesRes.json());
        setBranches(await branchesRes.json());
      } catch (err: any) {
        setError(err?.message || 'Could not reach backend');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [windowDays]);

  const topCountriesChart = useMemo(
    () => countries.slice(0, 12).map((c) => ({
      country: c.country,
      risk_score: c.risk_score,
      risk_level: c.risk_level,
    })),
    [countries]
  );

  const summary = useMemo(() => {
    const severe = countries.filter((c) => c.risk_level === 'SEVERE').length;
    const high = countries.filter((c) => c.risk_level === 'HIGH').length;
    const totalEvents = countries.reduce((sum, c) => sum + c.event_count, 0);
    const topCountry = countries[0]?.country || 'None';
    return { severe, high, totalEvents, topCountry };
  }, [countries]);

  const exposedBranches = useMemo(
    () =>
      branches
        .filter((b) => b.risk_score !== null)
        .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)),
    [branches]
  );

  if (loading) {
    return (
      <div className="glass-panel p-6 text-sm font-['Geist'] text-[#888888]">
        Loading seismic risk analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#ff8e8e]/10 border border-[#ff8e8e]/40 rounded-sm text-[#ff8e8e] text-sm font-['Geist']">
        <strong>Error:</strong> {error}
        <p className="mt-2 text-xs text-[#888888]">
          Make sure you've run <code>python app/seismic_ingest.py</code> on the backend and the
          server is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif-title text-xl font-normal text-white">
            Global Seismic Risk Intelligence
          </h2>
          <p className="font-['Geist'] text-xs text-[#888888] mt-1">
            Live USGS earthquake data scored per country and cross-referenced against branch exposure
          </p>
        </div>
        <select
          value={windowDays}
          onChange={(e) => setWindowDays(Number(e.target.value))}
          className="bg-[#141414] border border-[#1F1F1F] rounded-sm p-2 font-['Geist'] text-xs text-white focus:border-[#C5A059] focus:outline-none"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="HIGHEST RISK COUNTRY" value={summary.topCountry} />
        <StatBox label="SEVERE-TIER COUNTRIES" value={summary.severe} />
        <StatBox label="HIGH-TIER COUNTRIES" value={summary.high} />
        <StatBox label="TOTAL EVENTS TRACKED" value={summary.totalEvents} />
      </div>

      {/* STEP 1: Top countries chart */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 1"
          title="Highest Seismic Risk Countries"
          subtitle={`Composite score from magnitude, event frequency, and tsunami flags — last ${windowDays} days`}
        />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCountriesChart}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="country" stroke="#666" fontSize={10} angle={-30} textAnchor="end" height={70} />
            <YAxis stroke="#666" fontSize={11} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="risk_score" name="Risk Score">
              {topCountriesChart.map((entry, i) => (
                <Cell key={i} fill={TIER_COLORS[entry.risk_level] || GOLD} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 2: Country risk table */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 2"
          title="Country Risk Breakdown"
          subtitle="Every country with recorded seismic activity in the selected window, ranked by risk score"
        />
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {countries.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#1F1F1F] rounded-sm text-xs font-['Geist'] text-white"
            >
              <div className="flex items-center gap-3">
                <span>{c.country}</span>
                <TierBadge level={c.risk_level} />
              </div>
              <div className="flex items-center gap-4 text-[#888888] font-['JetBrains_Mono']">
                <span>{c.event_count} events</span>
                {c.max_magnitude !== null && <span>M{c.max_magnitude.toFixed(1)} peak</span>}
                <span className="text-[#C5A059]">{c.risk_score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 3: Branch exposure */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 3"
          title="Branch Exposure — Entity-Linked Risk"
          subtitle="Every tracked branch, scored against seismic activity in its own country"
        />
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {exposedBranches.length === 0 && (
            <p className="font-['Geist'] text-xs text-[#666666] italic">
              No branches with matching seismic risk data found.
            </p>
          )}
          {exposedBranches.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#1F1F1F] rounded-sm text-xs font-['Geist'] text-white"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{b.branch_name || b.branch_code}</span>
                <span className="text-[#666666] text-[10px]">{b.company} &bull; {b.country}</span>
              </div>
              <div className="flex items-center gap-3">
                <TierBadge level={b.risk_level} />
                {b.risk_score !== null && (
                  <span className="text-[#C5A059] font-['JetBrains_Mono']">{b.risk_score.toFixed(1)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


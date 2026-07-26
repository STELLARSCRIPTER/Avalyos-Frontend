import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GOLD = '#C5A059';
const RED = '#ff8e8e';
const BLUE = '#7ec8e3';
const GREEN = '#8fd19e';
const GRID = '#1F1F1F';

const DRIVER_COLORS: Record<string, string> = {
  'El Nino': RED,
  pIOD: GOLD,
  BoB: BLUE,
  nIOD: GREEN,
  None: '#666666',
};

interface FloodAnalysisResults {
  step1_month_correlation: {
    months: string[];
    flood_events_by_month: number[];
    avg_rainfall_by_month: number[];
    importance_score_by_month: number[];
    correlations: Record<string, { r: number; p: number }>;
    top_flood_months: string[];
  };
  step2_district_topology: {
    h0_points: { birth: number; death: number }[];
    h1_points: { birth: number; death: number }[];
    distinct_monsoon_regimes: number;
    longest_h0_lifetime: number;
    h1_loop_count: number;
  };
  step3_driver_fingerprint: {
    driver_impact: Record<string, { with: number; without: number; ratio: number }>;
    best_driver: string;
    year_points: { year: number; pc1: number; pc2: number; damage_m: number; driver_label: string }[];
  };
  step4_year_topology: {
    h0_points: { birth: number; death: number }[];
    h1_points: { birth: number; death: number }[];
    meaningful_year_clusters: number;
    h1_loop_count: number;
  };
  step5_month_driver_heatmap: {
    months: string[];
    driver_damage_share: Record<string, number[]>;
    lag_correlation: { lag0: number; lag1: number; lag2: number };
  };
  step6_country_topology: {
    countries_analyzed: number;
    distinct_clusters: number;
    country_points: {
      country: string; pc1: number; pc2: number; mean_damage_m: number;
      mean_deaths: number; dominant_driver: string;
    }[];
  };
  step7_wasserstein: {
    countries: string[];
    distance_matrix: number[][];
    most_similar_pairs: { country_a: string; country_b: string; distance: number }[];
  };
  summary: {
    top_flood_months_india: string[];
    driver_ratios: Record<string, number>;
    dominant_driver_india: string;
    distinct_monsoon_regimes: number;
    meaningful_year_clusters_india: number;
    countries_analyzed_globally: number;
    global_country_clusters: number;
    most_similar_country_pair: { country_a: string; country_b: string; distance: number } | null;
  };
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

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0A0A] border border-[#C5A059]/40 rounded-sm p-2 text-xs font-['Geist'] text-white">
      {payload.map((p: any, i: number) => (
        <div key={i}>{p.name || p.dataKey}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</div>
      ))}
    </div>
  );
};

export const FloodRiskView: React.FC = () => {
  const [data, setData] = useState<FloodAnalysisResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/flood-risk`);
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.detail?.error || 'Failed to load flood risk analysis');
        }
        const json: FloodAnalysisResults = await res.json();
        setData(json);
        if (json.step7_wasserstein.countries.length > 0) {
          setSelectedCountry(json.step7_wasserstein.countries[0]);
        }
      } catch (err: any) {
        setError(err?.message || 'Could not reach backend');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const step1Chart = useMemo(() => {
    if (!data) return [];
    const s = data.step1_month_correlation;
    return s.months.map((m, i) => ({
      month: m,
      importance: s.importance_score_by_month[i],
      rainfall: s.avg_rainfall_by_month[i],
      events: s.flood_events_by_month[i],
    }));
  }, [data]);

  const step3DriverBars = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.step3_driver_fingerprint.driver_impact).map(([driver, v]) => ({
      driver,
      ratio: v.ratio,
    }));
  }, [data]);

  const step5Chart = useMemo(() => {
    if (!data) return [];
    const s = data.step5_month_driver_heatmap;
    return s.months.map((m, i) => ({
      month: m,
      ElNino: s.driver_damage_share['ElNino']?.[i] ?? 0,
      pIOD: s.driver_damage_share['pIOD']?.[i] ?? 0,
      nIOD: s.driver_damage_share['nIOD']?.[i] ?? 0,
      BoB: s.driver_damage_share['BoB']?.[i] ?? 0,
    }));
  }, [data]);

  const step6Groups = useMemo(() => {
    if (!data) return {};
    const groups: Record<string, { country: string; pc1: number; pc2: number; mean_damage_m: number }[]> = {};
    data.step6_country_topology.country_points.forEach((p) => {
      if (!groups[p.dominant_driver]) groups[p.dominant_driver] = [];
      groups[p.dominant_driver].push(p);
    });
    return groups;
  }, [data]);

  const nearestCountries = useMemo(() => {
    if (!data || !selectedCountry) return [];
    const { countries, distance_matrix } = data.step7_wasserstein;
    const idx = countries.indexOf(selectedCountry);
    if (idx === -1) return [];
    return countries
      .map((c, i) => ({ country: c, distance: distance_matrix[idx][i] }))
      .filter((c) => c.country !== selectedCountry)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [data, selectedCountry]);

  if (loading) {
    return (
      <div className="glass-panel p-6 text-sm font-['Geist'] text-[#888888]">
        Loading flood risk analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#ff8e8e]/10 border border-[#ff8e8e]/40 rounded-sm text-[#ff8e8e] text-sm font-['Geist']">
        <strong>Error:</strong> {error}
        <p className="mt-2 text-xs text-[#888888]">
          Make sure you've run <code>python app/flood_analysis.py</code> on the backend and the
          server is running.
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="glass-panel p-4">
        <h2 className="font-serif-title text-xl font-normal text-white">
          Global Flood Risk Intelligence
        </h2>
        <p className="font-['Geist'] text-xs text-[#888888] mt-1">
          Topological data analysis of monsoon rainfall (India) and global flood-disaster
          patterns across {data.summary.countries_analyzed_globally} countries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="TOP FLOOD MONTHS (INDIA)" value={data.summary.top_flood_months_india.join(', ')} />
        <StatBox label="DOMINANT DRIVER (INDIA)" value={data.summary.dominant_driver_india} />
        <StatBox label="MONSOON REGIMES" value={data.summary.distinct_monsoon_regimes} />
        <StatBox label="GLOBAL COUNTRY CLUSTERS" value={data.summary.global_country_clusters} />
      </div>

      {/* STEP 1 */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 1"
          title="Which Months Actually Drive Flood Risk (India)"
          subtitle="Joint importance score = normalized rainfall x normalized flood-event count per month"
        />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={step1Chart}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="importance" name="Importance Score">
              {step1Chart.map((entry, i) => (
                <Cell key={i} fill={entry.importance > 0.3 ? RED : GOLD} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 2 */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 2"
          title="Persistent Homology on District Rainfall Space"
          subtitle={`${data.step2_district_topology.distinct_monsoon_regimes} distinct monsoon regimes detected, ${data.step2_district_topology.h1_loop_count} topological loops (H1)`}
        />
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="birth" name="Birth" stroke="#666" fontSize={11} />
            <YAxis type="number" dataKey="death" name="Death" stroke="#666" fontSize={11} />
            <ZAxis range={[30, 30]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="H0 (regime clusters)" data={data.step2_district_topology.h0_points} fill={GOLD} />
            <Scatter name="H1 (loops)" data={data.step2_district_topology.h1_points} fill={BLUE} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 3 */}
      <div className="glass-panel p-6 space-y-6">
        <SectionHeader
          step="STEP 3"
          title="Monsoon Driver Fingerprinting"
          subtitle={`Damage multiplier by climate driver vs baseline years — dominant driver: ${data.step3_driver_fingerprint.best_driver}`}
        />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={step3DriverBars}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="driver" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={11} />
            <ReferenceLine y={1} stroke="#666" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="ratio" name="Damage Ratio" fill={GOLD} />
          </BarChart>
        </ResponsiveContainer>

        <div>
          <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">
            YEAR CLUSTERS IN DRIVER SPACE
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="pc1" name="PC1" stroke="#666" fontSize={11} />
              <YAxis type="number" dataKey="pc2" name="PC2" stroke="#666" fontSize={11} />
              <ZAxis type="number" dataKey="damage_m" range={[30, 250]} name="Damage ($M)" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={data.step3_driver_fingerprint.year_points} fill={GOLD}>
                {data.step3_driver_fingerprint.year_points.map((p, i) => (
                  <Cell key={i} fill={DRIVER_COLORS[p.driver_label.split('+')[0]] || '#666'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STEP 4 */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 4"
          title="Persistent Homology on Year-Space (India)"
          subtitle={`${data.step4_year_topology.meaningful_year_clusters} meaningful year clusters, ${data.step4_year_topology.h1_loop_count} recurring cycles (H1)`}
        />
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="birth" name="Birth" stroke="#666" fontSize={11} />
            <YAxis type="number" dataKey="death" name="Death" stroke="#666" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="H0 (year clusters)" data={data.step4_year_topology.h0_points} fill={RED} />
            <Scatter name="H1 (cycles)" data={data.step4_year_topology.h1_points} fill={BLUE} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 5 */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 5"
          title="Month x Driver Damage Share (India)"
          subtitle="Share of each climate driver's total damage attributed to each flood month"
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={step5Chart}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="ElNino" stackId="a" name="El Nino" fill={RED} />
            <Bar dataKey="pIOD" stackId="a" name="pIOD" fill={GOLD} />
            <Bar dataKey="nIOD" stackId="a" name="nIOD" fill={GREEN} />
            <Bar dataKey="BoB" stackId="a" name="BoB" fill={BLUE} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 6 */}
      <div className="glass-panel p-6">
        <SectionHeader
          step="STEP 6"
          title="Global Country Flood-Topology Clusters"
          subtitle={`${data.step6_country_topology.countries_analyzed} countries analyzed, ${data.step6_country_topology.distinct_clusters} distinct clusters — colored by dominant climate driver`}
        />
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="pc1" name="PC1" stroke="#666" fontSize={11} />
            <YAxis type="number" dataKey="pc2" name="PC2" stroke="#666" fontSize={11} />
            <ZAxis type="number" dataKey="mean_damage_m" range={[20, 300]} name="Mean Damage ($M)" />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(step6Groups).map(([driver, points]) => (
              <Scatter key={driver} name={driver} data={points} fill={DRIVER_COLORS[driver] || '#666'} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* STEP 7 */}
      <div className="glass-panel p-6 space-y-4">
        <SectionHeader
          step="STEP 7"
          title="Topological Similarity Between Countries"
          subtitle="Wasserstein distance between flood-risk persistence diagrams — lower = more structurally similar flood pattern"
        />

        <div>
          <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">
            MOST SIMILAR COUNTRY PAIRS (GLOBAL)
          </h4>
          <div className="space-y-1.5">
            {data.step7_wasserstein.most_similar_pairs.slice(0, 6).map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#1F1F1F] rounded-sm text-xs font-['Geist'] text-white"
              >
                <span>{p.country_a} &harr; {p.country_b}</span>
                <span className="text-[#C5A059] font-['JetBrains_Mono']">W = {p.distance.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">
            EXPLORE: NEAREST FLOOD-RISK NEIGHBORS
          </h4>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full sm:w-64 bg-[#141414] border border-[#1F1F1F] rounded-sm p-2 font-['Geist'] text-xs text-white focus:border-[#C5A059] focus:outline-none mb-3"
          >
            {data.step7_wasserstein.countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="space-y-1.5">
            {nearestCountries.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#1F1F1F] rounded-sm text-xs font-['Geist'] text-white"
              >
                <span>{c.country}</span>
                <span className="text-[#888888] font-['JetBrains_Mono']">W = {c.distance.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
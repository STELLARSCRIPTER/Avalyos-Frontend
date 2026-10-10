export type NavTab =
  | 'global-overview'
  | 'company-intelligence'
  | 'flood-risk'
  | 'seismic-risk'
  | 'scenario-builder';

export type AlertSeverity = 'CRITICAL' | 'ELEVATED' | 'STABLE';


export interface IntelBriefRequest {
  topic: string;
  category: 'Geopolitical' | 'Macroeconomic' | 'Supply Chain' | 'Regulatory' | 'Military';
  region: string;
  timeframe: string;
}

export interface IntelBriefResponse {
  title: string;
  threatLevel: 'CRITICAL' | 'ELEVATED' | 'STABLE';
  summary: string;
  keyDrivers: string[];
  marketImpact: {
    equities: string;
    commodities: string;
    fx: string;
  };
  strategicRecommendations: string[];
  rawAnalysisText?: string;
}

// NEW: Company entity from GLEIF search
export interface Company {
  lei: string;
  name: string;
  status: string;
  jurisdiction: string | null;
  country: string | null;
  city: string | null;
}

export interface Region {
  iso_code: string;
  name: string;
  flag_url: string | null;
}

// --- Decision engine types (mirror backend schemas) ---

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

export interface ComparisonSummary {
  riskier_region: 'a' | 'b' | 'equal';
  score_difference: number;
  level_change: string;
  top_diverging_signal: string;
  diverging_signal_delta: number;
  summary_line: string;
}

export interface CompareResponse {
  company: string | null;
  region_a: string;
  region_b: string;
  result_a: AnalyzeResponse;
  result_b: AnalyzeResponse;
  summary: ComparisonSummary;
}
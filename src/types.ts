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
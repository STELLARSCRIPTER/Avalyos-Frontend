export type NavTab = 'global-overview' | 'company-intelligence' | 'flood-risk' | 'seismic-risk';

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
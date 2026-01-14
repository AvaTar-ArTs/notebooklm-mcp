export interface Keyword {
  id: string;
  keyword: string;
  search_volume: number;
  competition_index: number;
  category: string;
  trend_status: 'rising' | 'stable' | 'declining' | 'peak' | 'seasonal';
  created_at: string;
  updated_at: string;
}

export interface KeywordMetrics {
  id: string;
  keyword_id: string;
  click_volume: number;
  conversion_potential: number;
  niche_saturation: number;
  commercial_intent: number;
  recorded_at: string;
}

export interface TrendAnalysis {
  id: string;
  keyword_id: string;
  velocity_score: number;
  seasonality_pattern: string;
  peak_month: number | null;
  growth_7d: number;
  growth_30d: number;
  analyzed_at: string;
}

export interface KeywordRelationship {
  id: string;
  keyword_id: string;
  related_keyword_id: string;
  correlation_strength: number;
  relationship_type: 'cross_appeal' | 'trend_combo' | 'seasonal_combo';
}

export interface NicheCategory {
  id: string;
  name: string;
  description: string | null;
  trending_keywords_count: number;
  average_opportunity_score: number;
  created_at: string;
}

export interface OpportunityScore {
  keyword: string;
  opportunity_score: number;
  search_volume: number;
  competition_index: number;
  category: string;
  reason: string;
  potential_revenue_tier: 'low' | 'medium' | 'high' | 'very_high';
}

export interface TrendingKeyword {
  keyword: string;
  search_volume: number;
  competition_index: number;
  trend_status: string;
  velocity_score: number;
  category: string;
}

import { supabase } from '../db/client.js';
import type { Keyword } from '../types/index.js';

export interface KeywordInput {
  keyword: string;
  search_volume: number;
  competition_index: number;
  category: string;
  trend_status?: 'rising' | 'stable' | 'declining' | 'peak' | 'seasonal';
}

export class DataImporter {
  async importKeywords(keywords: KeywordInput[]): Promise<Keyword[]> {
    const sanitized = keywords.map((k) => ({
      keyword: k.keyword.toLowerCase().trim(),
      search_volume: Math.max(0, k.search_volume),
      competition_index: Math.max(0, Math.min(100, k.competition_index)),
      category: k.category.toLowerCase().trim(),
      trend_status: k.trend_status || 'stable',
    }));

    const { data, error } = await supabase
      .from('keywords')
      .upsert(sanitized, { onConflict: 'keyword' })
      .select();

    if (error) {
      throw new Error(`Import failed: ${error.message}`);
    }

    return data || [];
  }

  async batchAddMetrics(
    keywordId: string,
    metrics: {
      click_volume?: number;
      conversion_potential?: number;
      niche_saturation?: number;
      commercial_intent?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('keyword_metrics')
      .insert({
        keyword_id: keywordId,
        click_volume: metrics.click_volume ?? 0,
        conversion_potential: metrics.conversion_potential ?? 0,
        niche_saturation: metrics.niche_saturation ?? 0,
        commercial_intent: metrics.commercial_intent ?? 0,
      })
      .select();

    if (error) {
      throw new Error(`Failed to add metrics: ${error.message}`);
    }

    return data;
  }

  async batchAddTrendAnalysis(
    keywordId: string,
    analysis: {
      velocity_score?: number;
      seasonality_pattern?: string;
      peak_month?: number;
      growth_7d?: number;
      growth_30d?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('trend_analysis')
      .insert({
        keyword_id: keywordId,
        velocity_score: analysis.velocity_score ?? 0,
        seasonality_pattern: analysis.seasonality_pattern ?? 'stable',
        peak_month: analysis.peak_month,
        growth_7d: analysis.growth_7d ?? 0,
        growth_30d: analysis.growth_30d ?? 0,
      })
      .select();

    if (error) {
      throw new Error(`Failed to add trend analysis: ${error.message}`);
    }

    return data;
  }

  async createOrUpdateNiche(name: string, description?: string) {
    const { data, error } = await supabase
      .from('niche_categories')
      .upsert({ name: name.toLowerCase().trim(), description }, { onConflict: 'name' })
      .select();

    if (error) {
      throw new Error(`Failed to create niche: ${error.message}`);
    }

    return data?.[0];
  }

  async addKeywordRelationship(
    keywordId: string,
    relatedKeywordId: string,
    correlationStrength: number,
    relationshipType: 'cross_appeal' | 'trend_combo' | 'seasonal_combo'
  ) {
    const { data, error } = await supabase
      .from('keyword_relationships')
      .insert({
        keyword_id: keywordId,
        related_keyword_id: relatedKeywordId,
        correlation_strength: Math.max(0, Math.min(100, correlationStrength)),
        relationship_type: relationshipType,
      })
      .select();

    if (error && !error.message.includes('duplicate')) {
      throw new Error(`Failed to add relationship: ${error.message}`);
    }

    return data;
  }
}

import { supabase } from '../db/client.js';
import { ScoringEngine } from './scoring.js';
import type { Keyword, KeywordMetrics, TrendAnalysis, OpportunityScore, TrendingKeyword } from '../types/index.js';

export class KeywordAnalyzer {
  private scoring = new ScoringEngine();

  async findOpportunities(
    minSearchVolume: number = 100,
    maxCompetitionIndex: number = 50
  ): Promise<OpportunityScore[]> {
    const { data: keywords, error: keywordError } = await supabase
      .from('keywords')
      .select('*')
      .gte('search_volume', minSearchVolume)
      .lte('competition_index', maxCompetitionIndex)
      .order('search_volume', { ascending: false })
      .limit(100);

    if (keywordError || !keywords) {
      throw new Error(`Failed to fetch keywords: ${keywordError?.message}`);
    }

    const opportunities: OpportunityScore[] = [];

    for (const keyword of keywords) {
      const { data: metrics } = await supabase
        .from('keyword_metrics')
        .select('*')
        .eq('keyword_id', keyword.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: trend } = await supabase
        .from('trend_analysis')
        .select('*')
        .eq('keyword_id', keyword.id)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const opportunity = this.scoring.calculateOpportunityScore(
        keyword,
        metrics as KeywordMetrics | null,
        trend as TrendAnalysis | null
      );

      opportunities.push(opportunity);
    }

    return opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);
  }

  async getTrendingKeywords(category?: string, limit: number = 50): Promise<TrendingKeyword[]> {
    let query = supabase
      .from('keywords')
      .select(
        `id, keyword, search_volume, competition_index, trend_status, category,
        trend_analysis(velocity_score)`
      )
      .eq('trend_status', 'rising')
      .order('search_volume', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw new Error(`Failed to fetch trending keywords: ${error?.message}`);
    }

    return data.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.search_volume,
      competition_index: item.competition_index,
      trend_status: item.trend_status,
      velocity_score: item.trend_analysis?.[0]?.velocity_score ?? 0,
      category: item.category,
    }));
  }

  async getKeywordsByCategory(category: string): Promise<Keyword[]> {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('category', category)
      .order('search_volume', { ascending: false });

    if (error || !data) {
      throw new Error(`Failed to fetch keywords for category: ${error?.message}`);
    }

    return data;
  }

  async getRelatedKeywords(keywordId: string): Promise<Keyword[]> {
    const { data: relationships, error: relError } = await supabase
      .from('keyword_relationships')
      .select('related_keyword_id')
      .eq('keyword_id', keywordId);

    if (relError || !relationships) {
      throw new Error(`Failed to fetch relationships: ${relError?.message}`);
    }

    const relatedIds = relationships.map((r) => r.related_keyword_id);

    if (relatedIds.length === 0) {
      return [];
    }

    const { data: keywords, error: keyError } = await supabase
      .from('keywords')
      .select('*')
      .in('id', relatedIds);

    if (keyError || !keywords) {
      throw new Error(`Failed to fetch related keywords: ${keyError?.message}`);
    }

    return keywords;
  }

  async searchKeyword(keyword: string): Promise<Keyword | null> {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .ilike('keyword', `%${keyword}%`)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || null;
  }

  async getCompetitionAnalysis(category: string) {
    const { data, error } = await supabase
      .from('keywords')
      .select('competition_index')
      .eq('category', category);

    if (error || !data) {
      throw new Error(`Failed to analyze competition: ${error?.message}`);
    }

    const indices = data.map((k: any) => k.competition_index).sort((a: number, b: number) => a - b);
    const len = indices.length;

    return {
      low_competition: indices.filter((i: number) => i < 33).length,
      medium_competition: indices.filter((i: number) => i >= 33 && i < 66).length,
      high_competition: indices.filter((i: number) => i >= 66).length,
      average: Math.round(indices.reduce((a: number, b: number) => a + b, 0) / len),
      median: indices[Math.floor(len / 2)],
    };
  }

  async getSeasonalTrends(category: string) {
    const { data, error } = await supabase
      .from('trend_analysis')
      .select('peak_month, keywords(category)')
      .eq('keywords.category', category);

    if (error || !data) {
      throw new Error(`Failed to fetch seasonal data: ${error?.message}`);
    }

    const monthCounts = new Map<number, number>();
    data.forEach((item: any) => {
      if (item.peak_month) {
        monthCounts.set(item.peak_month, (monthCounts.get(item.peak_month) ?? 0) + 1);
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    return Array.from(monthCounts.entries()).map(([month, count]) => ({
      month: monthNames[month - 1],
      peak_keywords_count: count,
    }));
  }
}

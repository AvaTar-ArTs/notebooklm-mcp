import type { Keyword, KeywordMetrics, TrendAnalysis, OpportunityScore } from '../types/index.js';

export class ScoringEngine {
  calculateOpportunityScore(
    keyword: Keyword,
    metrics: KeywordMetrics | null,
    trend: TrendAnalysis | null
  ): OpportunityScore {
    const searchVolume = keyword.search_volume;
    const competitionIndex = keyword.competition_index;
    const velocityScore = trend?.velocity_score ?? 0;
    const niche_saturation = metrics?.niche_saturation ?? 50;

    const volumeScore = Math.min(searchVolume / 100, 100);
    const competitionScore = (100 - competitionIndex) * 0.4;
    const trendScore = Math.max(0, velocityScore) * 0.3;
    const saturationScore = (100 - niche_saturation) * 0.2;

    const opportunityScore = Math.round(
      (volumeScore * 0.2 + competitionScore + trendScore + saturationScore) / 1.7
    );

    const reason = this.generateReason(keyword, metrics, trend);
    const revenueTier = this.categorizeRevenueTier(opportunityScore, searchVolume, competitionIndex);

    return {
      keyword: keyword.keyword,
      opportunity_score: Math.min(100, Math.max(0, opportunityScore)),
      search_volume: searchVolume,
      competition_index: competitionIndex,
      category: keyword.category,
      reason,
      potential_revenue_tier: revenueTier,
    };
  }

  private generateReason(
    keyword: Keyword,
    metrics: KeywordMetrics | null,
    trend: TrendAnalysis | null
  ): string {
    const factors = [];

    if (keyword.search_volume > 500) {
      factors.push(`High search volume (${keyword.search_volume} searches)`);
    }

    if (keyword.competition_index < 40) {
      factors.push('Low competition');
    } else if (keyword.competition_index > 70) {
      factors.push('High competition market');
    }

    if (trend && trend.velocity_score > 50) {
      factors.push('Rapidly rising trend');
    } else if (trend && trend.velocity_score > 20) {
      factors.push('Growing trend');
    }

    if (keyword.trend_status === 'peak') {
      factors.push('Currently at peak popularity');
    } else if (keyword.trend_status === 'rising') {
      factors.push('Trending upward');
    }

    if (metrics && metrics.commercial_intent > 70) {
      factors.push('High buyer intent');
    }

    return factors.length > 0 ? factors.join('. ') : 'Moderate opportunity';
  }

  private categorizeRevenueTier(
    opportunityScore: number,
    searchVolume: number,
    competitionIndex: number
  ): 'low' | 'medium' | 'high' | 'very_high' {
    if (opportunityScore > 80 && searchVolume > 1000 && competitionIndex < 30) {
      return 'very_high';
    }
    if (opportunityScore > 70 && searchVolume > 500) {
      return 'high';
    }
    if (opportunityScore > 50) {
      return 'medium';
    }
    return 'low';
  }

  calculateSEOScore(keyword: Keyword, metrics: KeywordMetrics | null): number {
    const baseScore = Math.min(keyword.search_volume / 20, 50);
    const competitiveScore = (100 - keyword.competition_index) * 0.3;
    const conversionScore = (metrics?.conversion_potential ?? 50) * 0.2;

    return Math.round(baseScore + competitiveScore + conversionScore);
  }

  calculateTrendVelocity(growthSevenDay: number, growthThirtyDay: number): number {
    if (growthSevenDay > growthThirtyDay) {
      return Math.min(100, (growthSevenDay - growthThirtyDay) * 2);
    }
    return Math.max(-100, (growthSevenDay - growthThirtyDay) * 2);
  }
}

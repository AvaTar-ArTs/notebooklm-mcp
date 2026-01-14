#!/usr/bin/env node

import { KeywordAnalyzer } from './services/keyword-analyzer.js';
import { DataImporter } from './services/data-importer.js';
import { trendingKeywords } from './data/trending-keywords.js';

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║         SEO Trend Analyzer v1.0.0                        ║');
  console.log('║                                                          ║');
  console.log('║  Trending Keyword Analysis & Opportunity Detection       ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const importer = new DataImporter();
  const analyzer = new KeywordAnalyzer();

  try {
    console.log('📊 Importing trending keywords...');
    const imported = await importer.importKeywords(trendingKeywords);
    console.log(`✓ Imported ${imported.length} keywords\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 TOP OPPORTUNITIES (Low Competition, High Volume)\n');

    const opportunities = await analyzer.findOpportunities(100, 50);
    opportunities.slice(0, 15).forEach((opp, i) => {
      const tier = {
        'very_high': '🌟🌟🌟',
        'high': '🌟🌟',
        'medium': '🌟',
        'low': '○',
      }[opp.potential_revenue_tier];

      console.log(`${String(i + 1).padStart(2, ' ')}. ${tier} "${opp.keyword}"`);
      console.log(`    Score: ${opp.opportunity_score}/100 | Vol: ${opp.search_volume} | Comp: ${opp.competition_index}%`);
      console.log(`    ${opp.reason}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RISING TRENDS\n');

    const trending = await analyzer.getTrendingKeywords(undefined, 12);
    trending.forEach((trend, i) => {
      console.log(`${String(i + 1).padStart(2, ' ')}. "${trend.keyword}"`);
      console.log(`    Category: ${trend.category} | Vol: ${trend.search_volume} | Comp: ${trend.competition_index}%\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ Analysis complete\n');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

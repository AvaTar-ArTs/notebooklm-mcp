# SEO Trend Analyzer

Data-driven SEO and trending keyword analysis engine for identifying high-opportunity keywords across niches like Redbubble, e-commerce, and marketplace platforms.

## Features

### Core Analysis
- **Opportunity Scoring**: Calculate SEO opportunity scores combining search volume, competition, trend velocity, and market saturation
- **Trend Detection**: Identify rising trends with growth analysis and seasonality patterns
- **Competition Analysis**: Detailed breakdown of market saturation by category
- **Keyword Relationships**: Find related keywords and cross-appeal opportunities
- **Seasonal Insights**: Detect peak months and seasonal trends for targeted campaigns

### Data Management
- **Keyword Import**: Bulk import trending keywords with metrics
- **Metrics Tracking**: Track click volume, conversion potential, commercial intent
- **Trend Analysis**: Monitor velocity, growth rates (7-day, 30-day), and patterns
- **Niche Organization**: Categorize keywords by niche for targeted analysis

## Installation

```bash
npm install
npm run build
```

## Quick Start

```bash
# Run keyword analysis
node dist/index.js

# Watch for changes
npm run watch

# Development mode
npm run dev
```

## Database Setup

The system uses Supabase for data persistence. The schema includes:

- **keywords** - Core keyword data with search volume and competition metrics
- **keyword_metrics** - Conversion potential, commercial intent, niche saturation
- **trend_analysis** - Velocity scores, seasonal patterns, growth rates
- **keyword_relationships** - Related keywords and correlation strength
- **niche_categories** - Organized keyword categories

Migration automatically creates all tables, indexes, and Row Level Security policies.

## API Usage

### KeywordAnalyzer

```typescript
import { KeywordAnalyzer } from './services/keyword-analyzer.js';

const analyzer = new KeywordAnalyzer();

// Find opportunities (low competition, high volume)
const opportunities = await analyzer.findOpportunities(
  minSearchVolume = 100,
  maxCompetitionIndex = 50
);

// Get trending keywords
const trending = await analyzer.getTrendingKeywords(
  category?: string,
  limit = 50
);

// Get keywords by category
const categoryKeywords = await analyzer.getKeywordsByCategory('anime');

// Search for keyword
const keyword = await analyzer.searchKeyword('tesla');

// Analyze competition in category
const competition = await analyzer.getCompetitionAnalysis('barbie-core');

// Get seasonal trends
const seasonal = await analyzer.getSeasonalTrends('automotive');
```

### DataImporter

```typescript
import { DataImporter } from './services/data-importer.js';

const importer = new DataImporter();

// Import keywords
const imported = await importer.importKeywords([
  {
    keyword: 'mojo dojo house',
    search_volume: 1340,
    competition_index: 25,
    category: 'barbie-core',
    trend_status: 'peak'
  }
]);

// Add metrics for keyword
await importer.batchAddMetrics(keywordId, {
  click_volume: 450,
  conversion_potential: 75,
  niche_saturation: 35,
  commercial_intent: 82
});

// Add trend analysis
await importer.batchAddTrendAnalysis(keywordId, {
  velocity_score: 65,
  growth_7d: 12,
  growth_30d: 8,
  peak_month: 8
});

// Create niche category
await importer.createOrUpdateNiche('anime-manga', 'Anime and manga related keywords');

// Link related keywords
await importer.addKeywordRelationship(
  keywordId1,
  keywordId2,
  correlationStrength,
  'cross_appeal'
);
```

## Trending Keywords Database

Pre-loaded with 36 trending keywords across 15+ categories:

- **Barbie-core**: "mojo dojo house", "im just ken", "barbie dying"
- **Pop Culture**: "heartstopper netflix", "richard osman", "for all mankind"
- **Dark Humor**: "electricity kills", "my boat doesn't run on thanks"
- **Anime/Manga**: "my happy marriage", "5th gear luffy stickers"
- **True Crime**: "mrballen"
- **Nostalgia**: "calvin and hobbs", "xena", "pee wee"
- **Niche Shows**: "detectorists", "hank and trash truck"
- **Cute Animals**: "tater tot cat"
- **Bookish**: "a book a day keeps reality away"
- **Automotive**: "tesla bumper stickers"

## Opportunity Scoring Algorithm

```
Opportunity Score = (
  Search Volume (normalized) × 0.2 +
  Competition Index (inverted) × 0.4 +
  Trend Velocity × 0.3 +
  Niche Saturation (inverted) × 0.2
) / 1.7
```

### Revenue Tier Classification

- **Very High** (80-100): Score > 80 + Volume > 1000 + Competition < 30%
- **High** (60-79): Score > 70 + Volume > 500
- **Medium** (40-59): Score > 50
- **Low** (0-39): Score < 50

## Categories

Supported niche categories:

- barbie-core
- dark-humor
- retro-culture
- niche-shows
- nostalgia
- cute-animals
- dog-breeds
- bookish
- true-crime
- diy-fashion
- adult-humor
- kids-shows
- seasonal
- sci-fi
- anime-manga
- mystery-books
- anime-automotive
- retro-tv
- teen-romance
- automotive-tech
- artistic

## Trend Status

Keywords are classified by trend status:

- **rising** - Rapidly gaining popularity
- **peak** - At maximum popularity
- **stable** - Consistent searches
- **declining** - Losing momentum
- **seasonal** - Peaks at specific times of year

## Output Example

```
TOP OPPORTUNITIES (Low Competition, High Volume)

 1. 🌟🌟🌟 "barbie dying"
    Score: 92/100 | Vol: 2340 | Comp: 22%
    High search volume. Low competition. Currently at peak popularity.

 2. 🌟🌟🌟 "tesla bumper stickers"
    Score: 88/100 | Vol: 1456 | Comp: 35%
    High search volume. Growing trend. High buyer intent.

 3. 🌟🌟 "a book a day keeps reality away"
    Score: 79/100 | Vol: 1159 | Comp: 18%
    High search volume. Low competition. Trending upward.
```

## Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

```
SEO Trend Analyzer
├── src/
│   ├── db/
│   │   └── client.ts           # Supabase connection
│   ├── services/
│   │   ├── keyword-analyzer.ts # Core analysis engine
│   │   ├── scoring.ts          # Opportunity calculation
│   │   └── data-importer.ts    # Data import/management
│   ├── data/
│   │   └── trending-keywords.ts # Pre-loaded keywords
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── index.ts                # Entry point
├── dist/                       # Compiled output
└── package.json
```

## Security

Row Level Security (RLS) policies are enabled on all tables:

- Public read access for research queries
- Authenticated write access for data updates
- No direct public write permissions

## Performance

Optimized with database indexes on:

- `search_volume` (descending)
- `competition_index` (ascending)
- `trend_status`
- `category`
- Foreign key relationships

## Project Structure

```
/src
  /db          - Database connection
  /services    - Business logic
  /data        - Static data
  /types       - TypeScript definitions
  index.ts     - CLI entry point
```

## Future Enhancements

- Real-time trend velocity updates
- Machine learning trend prediction
- Multi-marketplace support (Amazon, Etsy, Shopify)
- Export to CSV/JSON
- API server with REST endpoints
- Web dashboard for visualization
- Integration with Google Trends API
- Competitor analysis tools

## License

MIT

## Author

SEO Trend Analyzer Contributors

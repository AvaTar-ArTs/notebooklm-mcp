/*
  # Create Keyword Analytics Schema for SEO Trend Analysis

  ## Overview
  This migration creates the core schema for analyzing trending keywords, SEO metrics, and market opportunities.
  Used for identifying high-volume, low-competition keywords across niches like Redbubble, e-commerce, etc.

  ## Tables

  ### keywords
  - `id` (uuid, primary key) - Unique identifier
  - `keyword` (text, unique) - The search term (e.g., "mojo dojo house")
  - `search_volume` (integer) - Monthly search volume
  - `competition_index` (integer 0-100) - Redbubble/platform competition level
  - `category` (text) - Niche category (pop culture, automotive, anime, etc.)
  - `trend_status` (text) - Status: 'rising', 'stable', 'declining', 'peak'
  - `created_at` (timestamp) - When keyword was added
  - `updated_at` (timestamp) - Last update

  ### keyword_metrics
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, FK) - Reference to keywords table
  - `click_volume` (integer) - Estimated clicks
  - `conversion_potential` (float 0-100) - Estimated conversion score
  - `niche_saturation` (float 0-100) - How saturated the niche is
  - `commercial_intent` (float 0-100) - Buyer intent score
  - `recorded_at` (timestamp) - When metrics were recorded

  ### trend_analysis
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, FK)
  - `velocity_score` (float) - Rate of trend change (-100 to 100)
  - `seasonality_pattern` (text) - Seasonal trend pattern
  - `peak_month` (integer) - Month with highest search (1-12)
  - `growth_7d` (float) - 7-day growth percentage
  - `growth_30d` (float) - 30-day growth percentage
  - `analyzed_at` (timestamp)

  ### keyword_relationships
  - `id` (uuid, primary key)
  - `keyword_id` (uuid, FK) - Primary keyword
  - `related_keyword_id` (uuid, FK) - Related keyword
  - `correlation_strength` (float 0-100) - How often searched together
  - `relationship_type` (text) - 'cross_appeal', 'trend_combo', 'seasonal_combo'

  ### niche_categories
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name
  - `description` (text) - Category description
  - `trending_keywords_count` (integer) - How many trending keywords in category
  - `average_opportunity_score` (float) - Average opportunity score in category

  ## Security
  - RLS enabled on all tables
  - Public read access for research queries
  - Authenticated write access only
*/

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text UNIQUE NOT NULL,
  search_volume integer NOT NULL,
  competition_index integer NOT NULL CHECK (competition_index >= 0 AND competition_index <= 100),
  category text NOT NULL,
  trend_status text NOT NULL CHECK (trend_status IN ('rising', 'stable', 'declining', 'peak')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create keyword_metrics table
CREATE TABLE IF NOT EXISTS keyword_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  click_volume integer DEFAULT 0,
  conversion_potential float DEFAULT 0 CHECK (conversion_potential >= 0 AND conversion_potential <= 100),
  niche_saturation float DEFAULT 0 CHECK (niche_saturation >= 0 AND niche_saturation <= 100),
  commercial_intent float DEFAULT 0 CHECK (commercial_intent >= 0 AND commercial_intent <= 100),
  recorded_at timestamptz DEFAULT now()
);

-- Create trend_analysis table
CREATE TABLE IF NOT EXISTS trend_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  velocity_score float DEFAULT 0 CHECK (velocity_score >= -100 AND velocity_score <= 100),
  seasonality_pattern text DEFAULT 'stable',
  peak_month integer CHECK (peak_month IS NULL OR (peak_month >= 1 AND peak_month <= 12)),
  growth_7d float DEFAULT 0,
  growth_30d float DEFAULT 0,
  analyzed_at timestamptz DEFAULT now()
);

-- Create keyword_relationships table
CREATE TABLE IF NOT EXISTS keyword_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  related_keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  correlation_strength float DEFAULT 0 CHECK (correlation_strength >= 0 AND correlation_strength <= 100),
  relationship_type text NOT NULL CHECK (relationship_type IN ('cross_appeal', 'trend_combo', 'seasonal_combo')),
  UNIQUE(keyword_id, related_keyword_id),
  CHECK (keyword_id != related_keyword_id)
);

-- Create niche_categories table
CREATE TABLE IF NOT EXISTS niche_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  trending_keywords_count integer DEFAULT 0,
  average_opportunity_score float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume ON keywords(search_volume DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_competition ON keywords(competition_index ASC);
CREATE INDEX IF NOT EXISTS idx_keywords_trend_status ON keywords(trend_status);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_keyword_id ON keyword_metrics(keyword_id);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_keyword_id ON trend_analysis(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_relationships_keyword_id ON keyword_relationships(keyword_id);
CREATE INDEX IF NOT EXISTS idx_niche_categories_name ON niche_categories(name);

-- Enable RLS
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche_categories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read keywords"
  ON keywords FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read keyword metrics"
  ON keyword_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read trend analysis"
  ON trend_analysis FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read keyword relationships"
  ON keyword_relationships FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read niche categories"
  ON niche_categories FOR SELECT
  TO public
  USING (true);

-- Authenticated write policies
CREATE POLICY "Authenticated users can insert keywords"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update keywords"
  ON keywords FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON keyword_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert trend analysis"
  ON trend_analysis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert relationships"
  ON keyword_relationships FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert categories"
  ON niche_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

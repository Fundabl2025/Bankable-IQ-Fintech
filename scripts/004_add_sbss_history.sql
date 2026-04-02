-- ================================================================================
-- T-12B: Add sbss_history column to business_profiles
-- Run this script in your Supabase SQL editor.
-- Safe to run multiple times — uses IF NOT EXISTS.
-- ================================================================================

-- Add sbss_history JSONB column
-- Stores an array of { score, date, scoringVersion } snapshots.
-- Max 24 entries (capped in app layer). Default empty array.
ALTER TABLE IF EXISTS business_profiles
  ADD COLUMN IF NOT EXISTS sbss_history JSONB DEFAULT '[]'::jsonb;

-- Verify the column was added
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'business_profiles'
  AND column_name  = 'sbss_history';

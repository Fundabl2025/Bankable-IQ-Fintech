-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFY SUPABASE SCHEMA FOR business_profiles TABLE
-- Run this script in your Supabase SQL editor to ensure all required columns exist
-- ════════════════════════════════════════════════════════════════════════════════

-- Check if business_profiles table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'business_profiles'
) as table_exists;

-- Display current columns if table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'business_profiles'
ORDER BY ordinal_position;

-- ════════════════════════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS (run only if columns don't exist)
-- ════════════════════════════════════════════════════════════════════════════════

-- Add fund_score column if it doesn't exist
ALTER TABLE IF EXISTS business_profiles
ADD COLUMN IF NOT EXISTS fund_score INTEGER;

-- Add bankable_score column if it doesn't exist
ALTER TABLE IF EXISTS business_profiles
ADD COLUMN IF NOT EXISTS bankable_score INTEGER;

-- Add created_at column if it doesn't exist (for audit trail)
ALTER TABLE IF EXISTS business_profiles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add assessment_data column if it doesn't exist
ALTER TABLE IF EXISTS business_profiles
ADD COLUMN IF NOT EXISTS assessment_data JSONB;

-- Verify all columns are now present
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'business_profiles'
ORDER BY ordinal_position;

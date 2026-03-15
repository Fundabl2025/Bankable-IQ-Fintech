-- FundReady Tables (Part 1)
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Profiles Table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_legal_name TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  business_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  business_type TEXT,
  industry TEXT,
  naics_code TEXT,
  time_in_business TEXT,
  annual_revenue TEXT,
  monthly_revenue TEXT,
  has_ein BOOLEAN DEFAULT FALSE,
  ein_number TEXT,
  has_bank_account BOOLEAN DEFAULT FALSE,
  has_business_address BOOLEAN DEFAULT FALSE,
  has_business_phone BOOLEAN DEFAULT FALSE,
  business_phone_number TEXT,
  has_business_email BOOLEAN DEFAULT FALSE,
  has_website BOOLEAN DEFAULT FALSE,
  website_url TEXT,
  has_business_license BOOLEAN DEFAULT FALSE,
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  has_business_credit BOOLEAN DEFAULT FALSE,
  tradeline_count INTEGER DEFAULT 0,
  has_duns BOOLEAN DEFAULT FALSE,
  duns_number TEXT,
  profile_photo TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  ethnicity TEXT,
  annual_household_income TEXT,
  primary_language TEXT,
  household_size TEXT,
  comfortable_with_english_coaching TEXT,
  lives_in_rural_area TEXT,
  gender TEXT,
  referral_source TEXT,
  birthday DATE,
  banking_partner TEXT,
  scan_completed BOOLEAN DEFAULT FALSE,
  scan_completed_date TIMESTAMPTZ,
  fund_score INTEGER DEFAULT 0,
  eligibility_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_source TEXT DEFAULT 'manual',
  UNIQUE(user_id)
);

-- Audit Items Table
CREATE TABLE IF NOT EXISTS public.audit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'incomplete',
  fico_impact INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  completed_date TIMESTAMPTZ,
  source TEXT,
  verification_status TEXT DEFAULT 'estimated',
  verification_date TIMESTAMPTZ,
  module_id TEXT,
  task_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_key)
);

-- FICO History Table
CREATE TABLE IF NOT EXISTS public.fico_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fund_score INTEGER NOT NULL,
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),
  snapshot_reason TEXT,
  items_completed INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 83,
  eligibility_tier TEXT,
  eligible_programs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification Data Table
CREATE TABLE IF NOT EXISTS public.gamification_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  last_celebration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_date TIMESTAMPTZ,
  criteria_type TEXT,
  criteria_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  changed_by_source TEXT DEFAULT 'user',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funding Applications Table
CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  lender_name TEXT,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  amount_requested DECIMAL(15,2),
  amount_approved DECIMAL(15,2),
  terms_offered JSONB,
  decline_reason TEXT,
  fund_score_at_application INTEGER,
  personal_credit_at_application INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FundReady Database Schema Migration
-- Creates persistent storage for business profiles, audit items, and analytics
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: BUSINESS PROFILES
-- Stores all business and owner information from the assessment
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Business Information
  business_legal_name TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Business Address
  business_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Business Details
  business_type TEXT, -- LLC, Corporation, etc.
  industry TEXT,
  naics_code TEXT,
  time_in_business TEXT,
  annual_revenue TEXT,
  monthly_revenue TEXT,
  
  -- Business Basics (Yes/No)
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
  
  -- Credit Information
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  has_business_credit BOOLEAN DEFAULT FALSE,
  tradeline_count INTEGER DEFAULT 0,
  has_duns BOOLEAN DEFAULT FALSE,
  duns_number TEXT,
  
  -- Social Media & Branding
  profile_photo TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  
  -- Personal Information (Owner/Contact)
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
  
  -- Scan/Assessment Metadata
  scan_completed BOOLEAN DEFAULT FALSE,
  scan_completed_date TIMESTAMPTZ,
  
  -- Computed Scores (cached for performance)
  fund_score INTEGER DEFAULT 0, -- 0-160 scale
  eligibility_tier TEXT, -- 'pre-qualified' | 'likely-qualified' | 'not-pre-qualified'
  
  -- Audit Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_source TEXT DEFAULT 'manual', -- 'manual' | 'scan' | 'api' | 'import'
  
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE 2: AUDIT ITEMS
-- Individual compliance/readiness items that contribute to FundScore
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item Identification
  item_key TEXT NOT NULL, -- e.g., 'entity-formation', 'business-bank-account'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'lender-compliance', 'personal-credit', etc.
  
  -- Status
  status TEXT DEFAULT 'incomplete', -- 'complete' | 'incomplete' | 'in-progress'
  fico_impact INTEGER DEFAULT 0, -- Points this item contributes to score
  priority TEXT DEFAULT 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  
  -- Completion Info
  completed_date TIMESTAMPTZ,
  source TEXT, -- 'scan' | 'manual' | 'automated' | 'verified'
  verification_status TEXT DEFAULT 'estimated', -- 'estimated' | 'verified' | 'document-uploaded'
  verification_date TIMESTAMPTZ,
  
  -- Module Linking
  module_id TEXT, -- Links to Lender Compliance module
  task_id TEXT, -- Links to specific task within module
  notes TEXT,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, item_key)
);

-- ============================================================================
-- TABLE 3: FICO HISTORY
-- Historical snapshots of credit scores for tracking progress
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fico_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Score Snapshot
  fund_score INTEGER NOT NULL, -- 0-160 FundReady score
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  
  -- Context
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),
  snapshot_reason TEXT, -- 'daily' | 'assessment-complete' | 'manual' | 'milestone'
  items_completed INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 83,
  
  -- Eligibility at time of snapshot
  eligibility_tier TEXT,
  eligible_programs JSONB, -- Array of program IDs user qualified for
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: GAMIFICATION DATA
-- Achievements, streaks, and engagement tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gamification_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Streak Tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Points & Levels
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  
  -- Celebration Tracking
  last_celebration TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE 5: ACHIEVEMENTS
-- Individual achievement records for each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  achievement_key TEXT NOT NULL, -- e.g., 'first-task', 'week-streak'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'completion' | 'speed' | 'quality' | 'streak' | 'milestone'
  
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_date TIMESTAMPTZ,
  
  -- Criteria for unlocking
  criteria_type TEXT, -- 'task_count' | 'percentage' | 'module_complete' | etc.
  criteria_value TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_key)
);

-- ============================================================================
-- TABLE 6: AUDIT LOGS
-- Complete change history for compliance and trust transparency
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Change Details
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL, -- 'INSERT' | 'UPDATE' | 'DELETE'
  
  -- Value Tracking
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[], -- List of field names that changed
  
  -- Context
  changed_by_source TEXT DEFAULT 'user', -- 'user' | 'system' | 'scan' | 'api'
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE 7: FUNDING APPLICATIONS (Future: Marketplace Phase)
-- Tracks user applications to funding programs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Program Info
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  lender_name TEXT,
  
  -- Application Status
  status TEXT DEFAULT 'draft', -- 'draft' | 'submitted' | 'under-review' | 'approved' | 'declined' | 'funded'
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  
  -- Outcome (for predictive intelligence)
  amount_requested DECIMAL(15,2),
  amount_approved DECIMAL(15,2),
  terms_offered JSONB,
  decline_reason TEXT,
  
  -- Score Snapshot at Application
  fund_score_at_application INTEGER,
  personal_credit_at_application INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fico_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;

-- Business Profiles Policies
CREATE POLICY "Users can view own profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.business_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Audit Items Policies
CREATE POLICY "Users can view own audit items" ON public.audit_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit items" ON public.audit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audit items" ON public.audit_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own audit items" ON public.audit_items
  FOR DELETE USING (auth.uid() = user_id);

-- FICO History Policies
CREATE POLICY "Users can view own fico history" ON public.fico_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fico history" ON public.fico_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gamification Data Policies
CREATE POLICY "Users can view own gamification data" ON public.gamification_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification data" ON public.gamification_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification data" ON public.gamification_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit Logs Policies (read-only for users, insert via system)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Funding Applications Policies
CREATE POLICY "Users can view own applications" ON public.funding_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.funding_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.funding_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_items_user_id ON public.audit_items(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_items_category ON public.audit_items(category);
CREATE INDEX IF NOT EXISTS idx_audit_items_status ON public.audit_items(status);
CREATE INDEX IF NOT EXISTS idx_fico_history_user_id ON public.fico_history(user_id);
CREATE INDEX IF NOT EXISTS idx_fico_history_date ON public.fico_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON public.gamification_data(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_funding_applications_user_id ON public.funding_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_applications_status ON public.funding_applications(status);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_audit_items_updated_at ON public.audit_items;
CREATE TRIGGER update_audit_items_updated_at
  BEFORE UPDATE ON public.audit_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gamification_data_updated_at ON public.gamification_data;
CREATE TRIGGER update_gamification_data_updated_at
  BEFORE UPDATE ON public.gamification_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_funding_applications_updated_at ON public.funding_applications;
CREATE TRIGGER update_funding_applications_updated_at
  BEFORE UPDATE ON public.funding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create empty business profile for new user
  INSERT INTO public.business_profiles (user_id, contact_email, contact_first_name, contact_last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create empty gamification data
  INSERT INTO public.gamification_data (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- FundReady Simple Schema
-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_legal_name TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  has_ein BOOLEAN DEFAULT FALSE,
  ein_number TEXT,
  has_bank_account BOOLEAN DEFAULT FALSE,
  scan_completed BOOLEAN DEFAULT FALSE,
  scan_completed_date TIMESTAMPTZ,
  fund_score INTEGER DEFAULT 0,
  eligibility_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_items table
CREATE TABLE IF NOT EXISTS public.audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'incomplete',
  fico_impact INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  completed_date TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'estimated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_key)
);

-- Create fico_history table
CREATE TABLE IF NOT EXISTS public.fico_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fund_score INTEGER NOT NULL,
  personal_credit_score INTEGER,
  equifax_score INTEGER,
  transunion_score INTEGER,
  experian_score INTEGER,
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),
  eligibility_tier TEXT,
  items_completed INTEGER DEFAULT 0
);

-- Create funding_applications table
CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  lender_name TEXT,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  amount_requested DECIMAL(15,2),
  amount_approved DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gamification_data table
CREATE TABLE IF NOT EXISTS public.gamification_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

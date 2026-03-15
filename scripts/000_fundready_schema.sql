-- FundReady Supabase Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- ============================================================================
-- 1. BUSINESS PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  businessLegalName TEXT,
  contactFirstName TEXT,
  contactLastName TEXT,
  contactEmail TEXT,
  contactPhone TEXT,
  businessAddress TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  businessType TEXT,
  industry TEXT,
  naicsCode TEXT,
  timeInBusiness TEXT,
  annualRevenue TEXT,
  monthlyRevenue TEXT,
  hasEIN BOOLEAN DEFAULT FALSE,
  einNumber TEXT,
  hasBankAccount BOOLEAN DEFAULT FALSE,
  hasBusinessAddress BOOLEAN DEFAULT FALSE,
  hasBusinessPhone BOOLEAN DEFAULT FALSE,
  businessPhoneNumber TEXT,
  hasBusinessEmail BOOLEAN DEFAULT FALSE,
  hasWebsite BOOLEAN DEFAULT FALSE,
  websiteUrl TEXT,
  hasBusinessLicense BOOLEAN DEFAULT FALSE,
  personalCreditScore INTEGER,
  equifaxScore INTEGER,
  transunionScore INTEGER,
  experianScore INTEGER,
  hasBusinessCredit BOOLEAN DEFAULT FALSE,
  tradelineCount INTEGER,
  hasDUNS BOOLEAN DEFAULT FALSE,
  dunsNumber TEXT,
  profilePhoto TEXT,
  linkedInUrl TEXT,
  facebookUrl TEXT,
  twitterUrl TEXT,
  instagramUrl TEXT,
  youtubeUrl TEXT,
  tiktokUrl TEXT,
  ethnicity TEXT,
  annualHouseholdIncome TEXT,
  primaryLanguage TEXT,
  householdSize TEXT,
  comfortableWithEnglishCoaching TEXT,
  livesInRuralArea TEXT,
  gender TEXT,
  referralSource TEXT,
  birthday TEXT,
  bankingPartner TEXT,
  scanCompleted BOOLEAN DEFAULT FALSE,
  scanCompletedDate TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  createdDate TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 2. AUDIT ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  ficoImpact INTEGER DEFAULT 0,
  priority TEXT,
  completedDate TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  source TEXT,
  moduleId TEXT,
  taskId TEXT,
  notes TEXT,
  UNIQUE(user_id, id)
);

-- ============================================================================
-- 3. FICO HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS fico_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  score INTEGER,
  source TEXT,
  breakdown JSONB
);

-- ============================================================================
-- 4. GAMIFICATION DATA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS gamification_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  totalPoints INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experiencePoints INTEGER DEFAULT 0,
  currentStreak INTEGER DEFAULT 0,
  longestStreak INTEGER DEFAULT 0,
  lastActivityDate TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 5. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  icon TEXT,
  category TEXT,
  isUnlocked BOOLEAN DEFAULT FALSE,
  unlockedDate TIMESTAMP,
  criteria JSONB,
  UNIQUE(user_id, id)
);

-- ============================================================================
-- 6. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 7. FUNDING APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT,
  program_name TEXT,
  status TEXT DEFAULT 'draft',
  appliedDate TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  programData JSONB
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fico_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- BUSINESS PROFILES
CREATE POLICY "Users can view own profile" ON business_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON business_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON business_profiles FOR DELETE USING (auth.uid() = user_id);

-- AUDIT ITEMS
CREATE POLICY "Users can view own items" ON audit_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON audit_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON audit_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON audit_items FOR DELETE USING (auth.uid() = user_id);

-- FICO HISTORY
CREATE POLICY "Users can view own fico" ON fico_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fico" ON fico_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GAMIFICATION DATA
CREATE POLICY "Users can view own gamification" ON gamification_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON gamification_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON gamification_data FOR UPDATE USING (auth.uid() = user_id);

-- ACHIEVEMENTS
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AUDIT LOGS
CREATE POLICY "Users can view own logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FUNDING APPLICATIONS
CREATE POLICY "Users can view own apps" ON funding_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own apps" ON funding_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own apps" ON funding_applications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_audit_items_user_id ON audit_items(user_id);
CREATE INDEX idx_audit_items_category ON audit_items(category);
CREATE INDEX idx_fico_history_user_id ON fico_history(user_id);
CREATE INDEX idx_gamification_user_id ON gamification_data(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_funding_apps_user_id ON funding_applications(user_id);

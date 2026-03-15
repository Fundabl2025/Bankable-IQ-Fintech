-- FundReady RLS Policies (Part 2)

-- Enable RLS on all tables
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fico_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;

-- Business Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.business_profiles;
CREATE POLICY "Users can view own profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.business_profiles;
CREATE POLICY "Users can insert own profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.business_profiles;
CREATE POLICY "Users can update own profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.business_profiles;
CREATE POLICY "Users can delete own profile" ON public.business_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Audit Items Policies
DROP POLICY IF EXISTS "Users can view own audit items" ON public.audit_items;
CREATE POLICY "Users can view own audit items" ON public.audit_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audit items" ON public.audit_items;
CREATE POLICY "Users can insert own audit items" ON public.audit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own audit items" ON public.audit_items;
CREATE POLICY "Users can update own audit items" ON public.audit_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own audit items" ON public.audit_items;
CREATE POLICY "Users can delete own audit items" ON public.audit_items
  FOR DELETE USING (auth.uid() = user_id);

-- FICO History Policies
DROP POLICY IF EXISTS "Users can view own fico history" ON public.fico_history;
CREATE POLICY "Users can view own fico history" ON public.fico_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fico history" ON public.fico_history;
CREATE POLICY "Users can insert own fico history" ON public.fico_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gamification Data Policies
DROP POLICY IF EXISTS "Users can view own gamification data" ON public.gamification_data;
CREATE POLICY "Users can view own gamification data" ON public.gamification_data
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification data" ON public.gamification_data;
CREATE POLICY "Users can insert own gamification data" ON public.gamification_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification data" ON public.gamification_data;
CREATE POLICY "Users can update own gamification data" ON public.gamification_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements Policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own achievements" ON public.achievements;
CREATE POLICY "Users can update own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Funding Applications Policies
DROP POLICY IF EXISTS "Users can view own applications" ON public.funding_applications;
CREATE POLICY "Users can view own applications" ON public.funding_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON public.funding_applications;
CREATE POLICY "Users can insert own applications" ON public.funding_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.funding_applications;
CREATE POLICY "Users can update own applications" ON public.funding_applications
  FOR UPDATE USING (auth.uid() = user_id);

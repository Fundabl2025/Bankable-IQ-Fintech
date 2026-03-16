-- FundReady Row Level Security Policies
-- Users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fico_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- business_profiles policies
CREATE POLICY "Users can view own profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.business_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- audit_items policies
CREATE POLICY "Users can view own audit items" ON public.audit_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit items" ON public.audit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audit items" ON public.audit_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audit items" ON public.audit_items
  FOR DELETE USING (auth.uid() = user_id);

-- fico_history policies
CREATE POLICY "Users can view own fico history" ON public.fico_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fico history" ON public.fico_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- funding_applications policies
CREATE POLICY "Users can view own funding applications" ON public.funding_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funding applications" ON public.funding_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funding applications" ON public.funding_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- gamification_data policies
CREATE POLICY "Users can view own gamification data" ON public.gamification_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification data" ON public.gamification_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data" ON public.gamification_data
  FOR UPDATE USING (auth.uid() = user_id);

-- audit_logs policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

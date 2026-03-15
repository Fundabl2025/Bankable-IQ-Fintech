-- FundReady Indexes and Triggers (Part 3)

-- Indexes for performance
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to business_profiles
DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to audit_items
DROP TRIGGER IF EXISTS update_audit_items_updated_at ON public.audit_items;
CREATE TRIGGER update_audit_items_updated_at
  BEFORE UPDATE ON public.audit_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to gamification_data
DROP TRIGGER IF EXISTS update_gamification_data_updated_at ON public.gamification_data;
CREATE TRIGGER update_gamification_data_updated_at
  BEFORE UPDATE ON public.gamification_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to funding_applications
DROP TRIGGER IF EXISTS update_funding_applications_updated_at ON public.funding_applications;
CREATE TRIGGER update_funding_applications_updated_at
  BEFORE UPDATE ON public.funding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.business_profiles (user_id, contact_email, contact_first_name, contact_last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.gamification_data (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

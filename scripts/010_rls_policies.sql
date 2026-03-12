-- 010_rls_policies.sql
-- Row Level Security policies for all tables

-- ============================================
-- TENANTS
-- ============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "tenants_super_admin_all" ON tenants;
CREATE POLICY "tenants_super_admin_all" ON tenants
  FOR ALL USING (auth.is_super_admin());

-- Users can read their own tenant
DROP POLICY IF EXISTS "tenants_users_read_own" ON tenants;
CREATE POLICY "tenants_users_read_own" ON tenants
  FOR SELECT USING (id = auth.tenant_id());

-- ============================================
-- PROFILES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "profiles_super_admin_all" ON profiles;
CREATE POLICY "profiles_super_admin_all" ON profiles
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can read all profiles in their tenant
DROP POLICY IF EXISTS "profiles_tenant_admin_read" ON profiles;
CREATE POLICY "profiles_tenant_admin_read" ON profiles
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles_users_read_own" ON profiles;
CREATE POLICY "profiles_users_read_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_users_update_own" ON profiles;
CREATE POLICY "profiles_users_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================
-- TENANT INVITATIONS
-- ============================================
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "invitations_super_admin_all" ON tenant_invitations;
CREATE POLICY "invitations_super_admin_all" ON tenant_invitations
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can manage invitations for their tenant
DROP POLICY IF EXISTS "invitations_tenant_admin_all" ON tenant_invitations;
CREATE POLICY "invitations_tenant_admin_all" ON tenant_invitations
  FOR ALL USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Anyone can read invitations by token (for accepting)
DROP POLICY IF EXISTS "invitations_read_by_token" ON tenant_invitations;
CREATE POLICY "invitations_read_by_token" ON tenant_invitations
  FOR SELECT USING (true);

-- ============================================
-- BUSINESSES
-- ============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "businesses_super_admin_all" ON businesses;
CREATE POLICY "businesses_super_admin_all" ON businesses
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can read all businesses in their tenant
DROP POLICY IF EXISTS "businesses_tenant_admin_read" ON businesses;
CREATE POLICY "businesses_tenant_admin_read" ON businesses
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Users can manage their own businesses
DROP POLICY IF EXISTS "businesses_users_own" ON businesses;
CREATE POLICY "businesses_users_own" ON businesses
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- SCAN RESULTS
-- ============================================
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "scan_results_super_admin_all" ON scan_results;
CREATE POLICY "scan_results_super_admin_all" ON scan_results
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can read all scan results in their tenant
DROP POLICY IF EXISTS "scan_results_tenant_admin_read" ON scan_results;
CREATE POLICY "scan_results_tenant_admin_read" ON scan_results
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Users can manage their own scan results
DROP POLICY IF EXISTS "scan_results_users_own" ON scan_results;
CREATE POLICY "scan_results_users_own" ON scan_results
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- PROGRAM ELIGIBILITY
-- ============================================
ALTER TABLE program_eligibility ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "program_eligibility_super_admin_all" ON program_eligibility;
CREATE POLICY "program_eligibility_super_admin_all" ON program_eligibility
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can read all eligibility in their tenant
DROP POLICY IF EXISTS "program_eligibility_tenant_admin_read" ON program_eligibility;
CREATE POLICY "program_eligibility_tenant_admin_read" ON program_eligibility
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Users can manage their own eligibility
DROP POLICY IF EXISTS "program_eligibility_users_own" ON program_eligibility;
CREATE POLICY "program_eligibility_users_own" ON program_eligibility
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- COMPLIANCE PROGRESS
-- ============================================
ALTER TABLE compliance_progress ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
DROP POLICY IF EXISTS "compliance_progress_super_admin_all" ON compliance_progress;
CREATE POLICY "compliance_progress_super_admin_all" ON compliance_progress
  FOR ALL USING (auth.is_super_admin());

-- Tenant admins can read all progress in their tenant
DROP POLICY IF EXISTS "compliance_progress_tenant_admin_read" ON compliance_progress;
CREATE POLICY "compliance_progress_tenant_admin_read" ON compliance_progress
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Users can manage their own progress
DROP POLICY IF EXISTS "compliance_progress_users_own" ON compliance_progress;
CREATE POLICY "compliance_progress_users_own" ON compliance_progress
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- AUDIT LOG
-- ============================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Super admin can read all audit logs
DROP POLICY IF EXISTS "audit_log_super_admin_read" ON audit_log;
CREATE POLICY "audit_log_super_admin_read" ON audit_log
  FOR SELECT USING (auth.is_super_admin());

-- Super admin can insert audit logs
DROP POLICY IF EXISTS "audit_log_super_admin_insert" ON audit_log;
CREATE POLICY "audit_log_super_admin_insert" ON audit_log
  FOR INSERT WITH CHECK (auth.is_super_admin());

-- Tenant admins can read audit logs for their tenant
DROP POLICY IF EXISTS "audit_log_tenant_admin_read" ON audit_log;
CREATE POLICY "audit_log_tenant_admin_read" ON audit_log
  FOR SELECT USING (
    tenant_id = auth.tenant_id() AND 
    auth.user_role() = 'tenant_admin'
  );

-- Allow service role to insert audit logs (for triggers)
DROP POLICY IF EXISTS "audit_log_service_insert" ON audit_log;
CREATE POLICY "audit_log_service_insert" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Migration 014: Enable RLS on all new tables + per-tenant policy
-- ============================================================================
-- Application must SET app.tenant_id = '<uuid>' at the start of each connection
-- (or per transaction) for these policies to scope queries correctly.
-- ============================================================================

DO $$
DECLARE
  t TEXT;
  tables_to_secure TEXT[] := ARRAY[
    -- 25 readiness schemas
    'business_identity', 'principal_profiles', 'data_authorizations',
    'financial_source_connections', 'financial_statements', 'banking_behavior',
    'cash_flow_metrics', 'document_readiness', 'tax_readiness',
    'debt_obligations', 'collateral_assets', 'revenue_quality', 'operational_maturity',
    'capital_requests', 'readiness_assessments', 'readiness_findings',
    'readiness_action_items', 'lender_profiles', 'lender_products',
    'lender_matches', 'deal_cards', 'institution_interactions', 'capital_outcomes',
    'restricted_compliance_data', 'data_quality_audit',
    -- 5 credit schemas
    'credit_profiles_personal', 'credit_profiles_business', 'tradeline_inventory',
    'credit_actions', 'credit_position_scores',
    -- 5 BAI schemas
    'lender_intelligence_realtime', 'industry_benchmarks', 'macro_market_indicators',
    'predicted_funding_outcomes', 'personalization_features'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_secure LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- Drop pre-existing policy with same name (idempotent)
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'tenant_isolation', t);
    -- Per-tenant policy: only rows matching app.tenant_id session variable
    EXECUTE format($pol$
      CREATE POLICY %I ON public.%I
        USING (tenant_id::text = current_setting('app.tenant_id', true))
        WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true))
    $pol$, 'tenant_isolation', t);
    RAISE NOTICE 'RLS enabled with tenant_isolation policy on public.%', t;
  END LOOP;
END $$;

-- Platform admins bypass tenant scoping via a separate elevated policy.
-- Add this per table only when the platform_admin role needs cross-tenant access.
-- Example for one table (apply per-table as needed):
-- CREATE POLICY platform_admin_all ON public.lender_profiles
--   USING (current_setting('app.role', true) = 'platform_admin');

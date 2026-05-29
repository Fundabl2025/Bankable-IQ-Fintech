-- ============================================================================
-- Migration 012: Credit Intelligence Engine schemas (Blueprint v1.8 §34, 26-30)
-- The "moat" credit schemas. Operationalize the Capital Position C end-to-end.
-- ============================================================================

-- Schema 26: credit_profiles_personal
CREATE TABLE IF NOT EXISTS public.credit_profiles_personal (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  principal_profile_id UUID REFERENCES public.principal_profiles(id) ON DELETE CASCADE,
  bureau          TEXT NOT NULL CHECK (bureau IN ('experian', 'equifax', 'transunion')),
  fico_8          INTEGER CHECK (fico_8 BETWEEN 300 AND 850),
  fico_9          INTEGER,
  fico_10         INTEGER,
  vantage_4      INTEGER,
  pulled_at       TIMESTAMPTZ NOT NULL,
  raw_payload_enc BYTEA,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_personal_tenant ON public.credit_profiles_personal (tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_personal_principal_time ON public.credit_profiles_personal (principal_profile_id, pulled_at DESC);

-- Schema 27: credit_profiles_business
CREATE TABLE IF NOT EXISTS public.credit_profiles_business (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  bureau          TEXT NOT NULL CHECK (bureau IN ('dnb', 'experian_business', 'equifax_business')),
  paydex          INTEGER,
  intelliscore    INTEGER,
  fico_sbss       INTEGER CHECK (fico_sbss BETWEEN 0 AND 300),
  pulled_at       TIMESTAMPTZ NOT NULL,
  raw_payload_enc BYTEA,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_business_tenant ON public.credit_profiles_business (tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_business_org_time ON public.credit_profiles_business (org_id, pulled_at DESC);

-- Schema 28: tradeline_inventory
CREATE TABLE IF NOT EXISTS public.tradeline_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  tradeline_type  TEXT NOT NULL CHECK (tradeline_type IN ('net30_vendor', 'business_credit_card', 'revolving', 'installment', 'authorized_user')),
  furnisher_name  TEXT,
  opened_at       DATE,
  credit_limit    NUMERIC(14,2),
  current_balance NUMERIC(14,2),
  utilization_pct NUMERIC(5,2),
  age_months      INTEGER,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tradeline_inventory_tenant ON public.tradeline_inventory (tenant_id);

-- Schema 29: credit_actions
CREATE TABLE IF NOT EXISTS public.credit_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  action_type     TEXT NOT NULL CHECK (action_type IN ('cli_request', 'dispute_filed', 'new_account_opened', 'account_closed', 'tradeline_placement', 'authorized_user_added', 'paydown')),
  target          TEXT,
  expected_impact_points NUMERIC(5,2),
  actual_impact_points NUMERIC(5,2),
  status          TEXT NOT NULL DEFAULT 'pending',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  initiated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_credit_actions_tenant ON public.credit_actions (tenant_id);

-- Schema 30: credit_position_scores — Bankable Credit Position Score (0-100)
CREATE TABLE IF NOT EXISTS public.credit_position_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  personal_component NUMERIC(5,2),
  business_component NUMERIC(5,2),
  tradeline_depth_component NUMERIC(5,2),
  utilization_component NUMERIC(5,2),
  payment_history_component NUMERIC(5,2),
  pg_exposure_component NUMERIC(5,2),
  shap_values     JSONB,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_position_scores_tenant ON public.credit_position_scores (tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_position_scores_org_time ON public.credit_position_scores (org_id, computed_at DESC);

COMMENT ON TABLE public.credit_position_scores IS
  'The Bankable Credit Position Score (0-100) per Blueprint v1.8 §17 Module 4. Credit-side companion to the Bankability Score.';

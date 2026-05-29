-- ============================================================================
-- Migration 011: The 25 readiness schemas (Blueprint v1.8 §34, schemas 1-25)
-- ============================================================================
-- Each schema corresponds to a Focus Area in the Bankability Wheel
-- (4 Domains × 5 FAs = 20 + 5 infrastructure schemas).
-- ============================================================================

-- ============================================================================
-- DOMAIN 1 — Business Identity (Schemas 1-3)
-- ============================================================================

-- Schema 1: business_identity (FA 1: Entity & Structure)
CREATE TABLE IF NOT EXISTS public.business_identity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  legal_name      TEXT,
  entity_type     TEXT,
  ein             TEXT,
  formation_date  DATE,
  formation_state TEXT,
  naics_code      TEXT,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_identity_tenant ON public.business_identity (tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_identity_org ON public.business_identity (org_id);

-- Schema 2: principal_profiles (FA 2: Ownership & Guarantors)
CREATE TABLE IF NOT EXISTS public.principal_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  user_id         UUID,
  ownership_pct   NUMERIC(5,2),
  is_guarantor    BOOLEAN NOT NULL DEFAULT FALSE,
  pii_encrypted   BYTEA,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_principal_profiles_tenant ON public.principal_profiles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_principal_profiles_org ON public.principal_profiles (org_id);

-- Schema 3: data_authorizations (FA 4: Legitimacy & Records)
CREATE TABLE IF NOT EXISTS public.data_authorizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  authorization_type TEXT NOT NULL,
  scope           TEXT[],
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at      TIMESTAMPTZ,
  ip_address      INET,
  user_agent      TEXT,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_data_authorizations_tenant ON public.data_authorizations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_authorizations_org ON public.data_authorizations (org_id);

-- ============================================================================
-- DOMAIN 2 — Financial Intelligence (Schemas 4-7, 9)
-- ============================================================================

-- Schema 4: financial_source_connections (FA 10: Data Sources & Connections)
CREATE TABLE IF NOT EXISTS public.financial_source_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  source_type     TEXT NOT NULL CHECK (source_type IN ('plaid_bank', 'quickbooks', 'xero', 'wave', 'csv_upload', 'manual')),
  plaid_item_id   TEXT,
  access_token_enc BYTEA,
  status          TEXT NOT NULL DEFAULT 'pending',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_at    TIMESTAMPTZ,
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_financial_source_connections_tenant ON public.financial_source_connections (tenant_id);

-- Schema 5: financial_statements (FA 6: Financial Statements)
CREATE TABLE IF NOT EXISTS public.financial_statements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  statement_type  TEXT NOT NULL CHECK (statement_type IN ('pnl', 'balance_sheet', 'cash_flow_statement')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  source          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_financial_statements_tenant ON public.financial_statements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_statements_org_period ON public.financial_statements (org_id, period_end DESC);

-- Schema 6: banking_behavior (FA 7: Banking Behavior)
CREATE TABLE IF NOT EXISTS public.banking_behavior (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  observed_month  DATE NOT NULL,
  avg_balance     NUMERIC(14,2),
  nsf_count       INTEGER DEFAULT 0,
  overdraft_count INTEGER DEFAULT 0,
  deposit_consistency_score NUMERIC(5,2),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_banking_behavior_tenant ON public.banking_behavior (tenant_id);
CREATE INDEX IF NOT EXISTS idx_banking_behavior_org_month ON public.banking_behavior (org_id, observed_month DESC);

-- Schema 7: cash_flow_metrics (FA 8: Cash Flow Intelligence)
CREATE TABLE IF NOT EXISTS public.cash_flow_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  observed_month  DATE NOT NULL,
  dscr            NUMERIC(6,3),
  monthly_cash_flow NUMERIC(14,2),
  debt_service    NUMERIC(14,2),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cash_flow_metrics_tenant ON public.cash_flow_metrics (tenant_id);

-- Schema 9: tax_readiness (FA 9: Tax Posture)
CREATE TABLE IF NOT EXISTS public.tax_readiness (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  tax_year        INTEGER NOT NULL,
  return_filed    BOOLEAN NOT NULL DEFAULT FALSE,
  transcript_pulled BOOLEAN NOT NULL DEFAULT FALSE,
  book_tax_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_readiness_tenant ON public.tax_readiness (tenant_id);

-- ============================================================================
-- DOMAIN 3 — Operational Maturity (Schemas 8, 10-13)
-- ============================================================================

-- Schema 8: document_readiness (FA 15: Document Readiness)
CREATE TABLE IF NOT EXISTS public.document_readiness (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  doc_type        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('missing', 'requested', 'received', 'verified', 'rejected')),
  s3_key          TEXT,
  ocr_extracted   JSONB,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_readiness_tenant ON public.document_readiness (tenant_id);

-- Schema 10: debt_obligations (FA 13: Debt & Obligations)
CREATE TABLE IF NOT EXISTS public.debt_obligations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  obligation_type TEXT NOT NULL,
  original_amount NUMERIC(14,2),
  current_balance NUMERIC(14,2),
  monthly_payment NUMERIC(14,2),
  interest_rate   NUMERIC(6,4),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_debt_obligations_tenant ON public.debt_obligations (tenant_id);

-- Schema 11: collateral_assets (FA 14: Collateral & Assets)
CREATE TABLE IF NOT EXISTS public.collateral_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  asset_type      TEXT NOT NULL,
  description     TEXT,
  fair_value      NUMERIC(14,2),
  ucc_filings     JSONB,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_collateral_assets_tenant ON public.collateral_assets (tenant_id);

-- Schema 12: revenue_quality (FA 12: Revenue Quality)
CREATE TABLE IF NOT EXISTS public.revenue_quality (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  observed_month  DATE NOT NULL,
  recurring_revenue_pct NUMERIC(5,2),
  customer_concentration_top5_pct NUMERIC(5,2),
  predictability_score NUMERIC(5,2),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_revenue_quality_tenant ON public.revenue_quality (tenant_id);

-- Schema 13: operational_maturity (FA 11: Operational Systems)
CREATE TABLE IF NOT EXISTS public.operational_maturity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  owner_dependency_score NUMERIC(5,2),
  process_documentation_score NUMERIC(5,2),
  management_team_score NUMERIC(5,2),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_operational_maturity_tenant ON public.operational_maturity (tenant_id);

-- ============================================================================
-- DOMAIN 4 — Capital Readiness (Schemas 14-23)
-- ============================================================================

-- Schema 14: capital_requests (FA 16: Capital Plan & Intent)
CREATE TABLE IF NOT EXISTS public.capital_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  requested_amount NUMERIC(14,2) NOT NULL,
  target_outcome  TEXT NOT NULL CHECK (target_outcome IN ('capital_today', 'bankability_built', 'institutional_access')),
  product_type    TEXT,
  purpose         TEXT,
  timeline_days   INTEGER,
  status          TEXT NOT NULL DEFAULT 'open',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_capital_requests_tenant ON public.capital_requests (tenant_id);

-- Schema 15: readiness_assessments (FA 17: Readiness Score & Findings)
CREATE TABLE IF NOT EXISTS public.readiness_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('compass', 'wheel_diagnostic')),
  bankability_score INTEGER NOT NULL CHECK (bankability_score BETWEEN 0 AND 100),
  maturity_level  TEXT NOT NULL CHECK (maturity_level IN ('foundation', 'organized', 'optimized', 'lender_ready', 'compounding_capital')),
  domain_scores   JSONB NOT NULL DEFAULT '{}'::jsonb,
  focus_area_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  factor_trace    JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_hash     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_tenant ON public.readiness_assessments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_org_recent ON public.readiness_assessments (org_id, created_at DESC);

-- Schema 16: readiness_findings (FA 17)
CREATE TABLE IF NOT EXISTS public.readiness_findings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  assessment_id   UUID REFERENCES public.readiness_assessments(id) ON DELETE CASCADE,
  focus_area      INTEGER NOT NULL CHECK (focus_area BETWEEN 1 AND 20),
  severity        TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  finding_text    TEXT NOT NULL,
  capital_impact_score NUMERIC(5,2),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_readiness_findings_tenant ON public.readiness_findings (tenant_id);

-- Schema 17: readiness_action_items (FA 18: Action Plan & Velocity)
CREATE TABLE IF NOT EXISTS public.readiness_action_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  assessment_id   UUID REFERENCES public.readiness_assessments(id),
  bucket          TEXT NOT NULL CHECK (bucket IN ('day_30', 'day_60', 'day_90')),
  owner           TEXT NOT NULL CHECK (owner IN ('client', 'advisor', 'system')),
  action_text     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  due_at          TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_readiness_action_items_tenant ON public.readiness_action_items (tenant_id);

-- Schema 18: lender_profiles (FA 19: Lender Match & Sequencing)
CREATE TABLE IF NOT EXISTS public.lender_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  legal_name      TEXT NOT NULL,
  lender_type     TEXT NOT NULL,
  api_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'active',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lender_profiles_tenant ON public.lender_profiles (tenant_id);

-- Schema 19: lender_products
CREATE TABLE IF NOT EXISTS public.lender_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  lender_id       UUID NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  product_name    TEXT NOT NULL,
  product_type    TEXT NOT NULL,
  min_amount      NUMERIC(14,2),
  max_amount      NUMERIC(14,2),
  min_fico        INTEGER,
  min_time_in_business_months INTEGER,
  credit_box_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'active',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lender_products_tenant ON public.lender_products (tenant_id);

-- Schema 20: lender_matches
CREATE TABLE IF NOT EXISTS public.lender_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  capital_request_id UUID REFERENCES public.capital_requests(id),
  lender_product_id UUID NOT NULL REFERENCES public.lender_products(id),
  match_score     NUMERIC(5,4),
  rank            INTEGER,
  pre_validated   BOOLEAN NOT NULL DEFAULT FALSE,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lender_matches_tenant ON public.lender_matches (tenant_id);

-- Schema 21: deal_cards (FA 20)
CREATE TABLE IF NOT EXISTS public.deal_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  capital_request_id UUID REFERENCES public.capital_requests(id),
  lender_match_id UUID REFERENCES public.lender_matches(id),
  package_s3_key  TEXT,
  ai_memo         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
  submitted_at    TIMESTAMPTZ,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deal_cards_tenant ON public.deal_cards (tenant_id);

-- Schema 22: institution_interactions (FA 20)
CREATE TABLE IF NOT EXISTS public.institution_interactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  deal_card_id    UUID REFERENCES public.deal_cards(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('submitted', 'question', 'delay', 'counter_offer', 'approved', 'declined', 'funded')),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_institution_interactions_tenant ON public.institution_interactions (tenant_id);

-- Schema 23: capital_outcomes (FA 20)
CREATE TABLE IF NOT EXISTS public.capital_outcomes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  deal_card_id    UUID REFERENCES public.deal_cards(id),
  outcome_type    TEXT NOT NULL CHECK (outcome_type IN ('funded', 'declined', 'withdrawn', 'expired')),
  funded_amount   NUMERIC(14,2),
  apr             NUMERIC(6,4),
  term_months     INTEGER,
  decision_reasons TEXT[],
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_capital_outcomes_tenant ON public.capital_outcomes (tenant_id);

-- ============================================================================
-- INFRASTRUCTURE (Schemas 24-25)
-- ============================================================================

-- Schema 24: restricted_compliance_data — hash-chained audit log
CREATE TABLE IF NOT EXISTS public.restricted_compliance_data (
  seq             BIGSERIAL PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  actor_id        UUID,
  action          TEXT NOT NULL,
  subject_type    TEXT NOT NULL,
  subject_id      UUID,
  payload         JSONB NOT NULL,
  prev_hash       BYTEA NOT NULL,
  curr_hash       BYTEA NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_restricted_compliance_data_tenant ON public.restricted_compliance_data (tenant_id);
CREATE INDEX IF NOT EXISTS idx_restricted_compliance_data_subject ON public.restricted_compliance_data (subject_type, subject_id);

-- Schema 25: data_quality_audit
CREATE TABLE IF NOT EXISTS public.data_quality_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  audit_type      TEXT NOT NULL,
  table_name      TEXT,
  finding         TEXT,
  severity        TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'error')),
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_data_quality_audit_tenant ON public.data_quality_audit (tenant_id);

COMMENT ON TABLE public.readiness_assessments IS
  'Bankability Score (0-100) + Maturity Level per Blueprint v1.8 §XIII. Source of truth for the Wheel.';

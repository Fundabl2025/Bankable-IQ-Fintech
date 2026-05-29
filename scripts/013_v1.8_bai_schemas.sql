-- ============================================================================
-- Migration 013: BAI Engine schemas (NEW v1.8 §34, 31-35)
-- Powers the personalization layer wrapping every other layer.
-- ============================================================================

-- Schema 31: lender_intelligence_realtime (BLIN)
CREATE TABLE IF NOT EXISTS public.lender_intelligence_realtime (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  lender_id       UUID REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  signal_type     TEXT NOT NULL CHECK (signal_type IN ('rate_change', 'criteria_update', 'volume_signal', 'response_time', 'decline_reason', 'industry_appetite')),
  signal_data     JSONB NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('lender_portal_scrape', 'lender_api', 'cca_self_report', 'rate_post', 'public_filing')),
  confidence_score NUMERIC(5,2),
  observed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lender_intelligence_realtime_tenant ON public.lender_intelligence_realtime (tenant_id);
CREATE INDEX IF NOT EXISTS idx_lender_intelligence_realtime_lender_time ON public.lender_intelligence_realtime (lender_id, observed_at DESC);

-- Schema 32: industry_benchmarks (BII)
CREATE TABLE IF NOT EXISTS public.industry_benchmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  naics_code      TEXT NOT NULL,
  revenue_band    TEXT,
  benchmark_type  TEXT NOT NULL CHECK (benchmark_type IN ('gross_margin', 'working_capital_cycle', 'seasonality', 'default_rate', 'growth_rate', 'common_decline_reason')),
  benchmark_value NUMERIC(14,4),
  benchmark_data  JSONB NOT NULL DEFAULT '{}'::jsonb,
  source          TEXT,
  effective_period_start DATE,
  effective_period_end   DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_tenant ON public.industry_benchmarks (tenant_id);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_naics ON public.industry_benchmarks (naics_code, benchmark_type);

-- Schema 33: macro_market_indicators (BMS)
CREATE TABLE IF NOT EXISTS public.macro_market_indicators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  indicator       TEXT NOT NULL,
  region          TEXT,
  value           NUMERIC(14,4),
  unit            TEXT,
  source          TEXT NOT NULL CHECK (source IN ('fred', 'sba', 'bls', 'news_sentiment', 'regional_edo')),
  observed_at     TIMESTAMPTZ NOT NULL,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_macro_market_indicators_tenant ON public.macro_market_indicators (tenant_id);
CREATE INDEX IF NOT EXISTS idx_macro_market_indicators_indicator_time ON public.macro_market_indicators (indicator, observed_at DESC);

-- Schema 34: predicted_funding_outcomes (BPFS)
CREATE TABLE IF NOT EXISTS public.predicted_funding_outcomes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID NOT NULL,
  assessment_id   UUID REFERENCES public.readiness_assessments(id),
  lender_product_id UUID REFERENCES public.lender_products(id),
  model_version   TEXT NOT NULL,
  approval_probability NUMERIC(5,4) NOT NULL CHECK (approval_probability BETWEEN 0 AND 1),
  expected_apr    NUMERIC(6,4),
  expected_amount NUMERIC(14,2),
  expected_term_months INTEGER,
  features_used   JSONB NOT NULL DEFAULT '{}'::jsonb,
  shap_values     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_predicted_funding_outcomes_tenant ON public.predicted_funding_outcomes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_predicted_funding_outcomes_org_time ON public.predicted_funding_outcomes (org_id, created_at DESC);

-- Schema 35: personalization_features (ML feature store)
CREATE TABLE IF NOT EXISTS public.personalization_features (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  org_id          UUID,
  feature_set     TEXT NOT NULL,
  features        JSONB NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ttl_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_personalization_features_tenant ON public.personalization_features (tenant_id);
CREATE INDEX IF NOT EXISTS idx_personalization_features_org_set ON public.personalization_features (org_id, feature_set, computed_at DESC);

COMMENT ON TABLE public.predicted_funding_outcomes IS
  'BPFS predictions per Blueprint v1.8 §XII Part 13. Per-business per-lender per-product approval probability.';

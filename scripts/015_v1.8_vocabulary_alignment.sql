-- ============================================================================
-- Migration 015: Vocabulary alignment per Blueprint v1.8
-- ============================================================================
-- Adds the new canonical columns ALONGSIDE the legacy ones. Application code
-- transitions to the new columns progressively. Legacy columns are dropped
-- only after the application no longer references them (separate PR).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- business_profiles: add bankability_score (0-100) alongside fund_score (0-160)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='business_profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='business_profiles' AND column_name='bankability_score'
    ) THEN
      ALTER TABLE public.business_profiles
        ADD COLUMN bankability_score INTEGER
          CHECK (bankability_score BETWEEN 0 AND 100);
      RAISE NOTICE 'Added bankability_score (0-100) to public.business_profiles';
    END IF;

    -- Add maturity_level enum column alongside legacy eligibility_tier
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='business_profiles' AND column_name='maturity_level'
    ) THEN
      ALTER TABLE public.business_profiles
        ADD COLUMN maturity_level TEXT
          CHECK (maturity_level IN ('foundation','organized','optimized','lender_ready','compounding_capital'));
      RAISE NOTICE 'Added maturity_level to public.business_profiles';
    END IF;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Rescale + map: when fund_score exists and bankability_score is null, derive
-- ---------------------------------------------------------------------------
-- Legacy FundScore 0-160 → Bankability Score 0-100: linear rescale.
-- formula: bankability_score = round(fund_score * 100 / 160)
-- Bankable threshold (Blueprint v1.8): 76 (Lender-Ready Maturity Level)
-- corresponds to legacy FundScore ~122 (76 * 160 / 100).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='business_profiles' AND column_name='fund_score'
  ) THEN
    UPDATE public.business_profiles
      SET bankability_score = ROUND((fund_score::numeric * 100.0) / 160.0)::integer
      WHERE fund_score IS NOT NULL AND bankability_score IS NULL;
    RAISE NOTICE 'Backfilled bankability_score from fund_score (0-160 → 0-100 linear rescale)';
  END IF;

  -- Map legacy eligibility_tier → maturity_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='business_profiles' AND column_name='eligibility_tier'
  ) THEN
    UPDATE public.business_profiles SET maturity_level = CASE eligibility_tier
      WHEN 'not-pre-qualified' THEN 'foundation'
      WHEN 'likely-qualified'  THEN 'optimized'
      WHEN 'pre-qualified'     THEN 'lender_ready'
      ELSE maturity_level
    END
    WHERE maturity_level IS NULL AND eligibility_tier IS NOT NULL;
    RAISE NOTICE 'Mapped legacy eligibility_tier → v1.8 maturity_level';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Triggers to keep them in sync during the transition window
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_bankability_from_fund_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.fund_score IS NOT NULL AND NEW.bankability_score IS NULL THEN
    NEW.bankability_score := ROUND((NEW.fund_score::numeric * 100.0) / 160.0)::integer;
  END IF;
  RETURN NEW;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='business_profiles' AND column_name='fund_score'
  ) THEN
    DROP TRIGGER IF EXISTS trg_sync_bankability_score ON public.business_profiles;
    CREATE TRIGGER trg_sync_bankability_score
      BEFORE INSERT OR UPDATE OF fund_score ON public.business_profiles
      FOR EACH ROW EXECUTE FUNCTION public.sync_bankability_from_fund_score();
  END IF;
END $$;

COMMENT ON COLUMN public.business_profiles.bankability_score IS
  'Canonical Bankability Score (0-100) per Blueprint v1.8. Replaces fund_score (0-160).';
COMMENT ON COLUMN public.business_profiles.maturity_level IS
  '5-stage Bankable Maturity Level per Blueprint v1.8 §XIII. Replaces eligibility_tier.';

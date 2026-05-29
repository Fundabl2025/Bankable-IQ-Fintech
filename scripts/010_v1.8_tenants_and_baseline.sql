-- ============================================================================
-- Migration 010: Tenants table + tenant_id baseline on existing tables
-- Blueprint v1.8 aligned. Multi-tenant from this point forward.
-- ============================================================================
-- Compliance: this migration is compliance-sensitive.
-- Adds tenant_id NOT NULL UUID column to every existing row.
-- All existing rows backfilled with the default tenant.
-- Per Blueprint v1.8 §17 (Workspace + Command Center are tenant-scoped).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- TENANTS — the multi-tenant root
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            CITEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  tenant_type     TEXT NOT NULL CHECK (tenant_type IN ('platform', 'advisor_org', 'edo_partner', 'lender_partner', 'demo')),
  brand_config    JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants (status) WHERE status = 'active';

-- Seed the default platform tenant. All existing data backfills to this row.
INSERT INTO public.tenants (id, slug, display_name, tenant_type)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'bankable-iq',
  'BANKABLE IQ',
  'platform'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Add tenant_id NOT NULL UUID to every existing table.
-- Default backfill = the platform tenant above.
-- ============================================================================
DO $$
DECLARE
  t TEXT;
  default_tenant CONSTANT UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  existing_tables TEXT[] := ARRAY[
    'business_profiles',
    'audit_items',
    'audit_logs',
    'assessments',
    'funding_applications',
    'fico_history',
    'gamification_data',
    'achievements'
  ];
BEGIN
  FOREACH t IN ARRAY existing_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      -- Add column if absent
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = t
          AND column_name = 'tenant_id'
      ) THEN
        EXECUTE format(
          'ALTER TABLE public.%I ADD COLUMN tenant_id UUID DEFAULT %L::uuid',
          t, default_tenant
        );
        -- Backfill any nulls (should be zero after default)
        EXECUTE format('UPDATE public.%I SET tenant_id = %L::uuid WHERE tenant_id IS NULL', t, default_tenant);
        -- Enforce NOT NULL
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', t);
        -- Foreign key to tenants
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE RESTRICT',
          t,
          'fk_' || t || '_tenant_id'
        );
        -- Index on tenant_id (every multi-tenant table needs this)
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)', 'idx_' || t || '_tenant_id', t);
        RAISE NOTICE 'Added tenant_id to public.%', t;
      ELSE
        RAISE NOTICE 'tenant_id already present on public.%', t;
      END IF;
    ELSE
      RAISE NOTICE 'Table public.% does not exist; skipping', t;
    END IF;
  END LOOP;
END $$;

-- Tenants table itself does not have a tenant_id (it IS the root).
-- Enable RLS on tenants but expose only via super-admin policy.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Default policy: rows visible only to platform admins and members of the tenant
CREATE POLICY tenants_visible_to_members ON public.tenants
  FOR SELECT
  USING (
    id::text = current_setting('app.tenant_id', true)
    OR current_setting('app.role', true) = 'platform_admin'
  );

COMMENT ON TABLE public.tenants IS
  'Multi-tenant root per Blueprint v1.8. Every other table references tenant_id.';

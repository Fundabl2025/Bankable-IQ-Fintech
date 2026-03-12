-- 004_businesses.sql
-- Business information for each user

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  dba_name TEXT,
  business_type TEXT,
  entity_type TEXT,
  industry TEXT,
  naics_code TEXT,
  ein_number TEXT,
  state_of_incorporation TEXT,
  date_established DATE,
  time_in_business TEXT,
  annual_revenue TEXT,
  monthly_revenue TEXT,
  employee_count TEXT,
  address JSONB DEFAULT '{}',
  contact JSONB DEFAULT '{}',
  credit_profile JSONB DEFAULT '{}',
  banking JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_tenant_id ON businesses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- Update trigger
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

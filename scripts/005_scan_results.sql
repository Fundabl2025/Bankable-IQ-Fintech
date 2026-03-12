-- 005_scan_results.sql
-- Business Success Scan results

CREATE TABLE IF NOT EXISTS scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  fico_sbss_score INTEGER,
  fund_score INTEGER,
  nap_score INTEGER,
  bankable_score INTEGER,
  dimension_scores JSONB DEFAULT '{}',
  scan_data JSONB DEFAULT '{}',
  answers JSONB DEFAULT '{}',
  blocking_factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scan_results_tenant_id ON scan_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_business_id ON scan_results(business_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_status ON scan_results(status);
CREATE INDEX IF NOT EXISTS idx_scan_results_created_at ON scan_results(created_at DESC);

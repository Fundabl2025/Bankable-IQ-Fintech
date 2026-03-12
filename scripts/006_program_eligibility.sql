-- 006_program_eligibility.sql
-- Funding program eligibility per user

CREATE TABLE IF NOT EXISTS program_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scan_result_id UUID REFERENCES scan_results(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT,
  is_eligible BOOLEAN DEFAULT false,
  eligibility_score INTEGER DEFAULT 0,
  match_percentage INTEGER DEFAULT 0,
  blocking_factors JSONB DEFAULT '[]',
  gap_analysis JSONB DEFAULT '{}',
  requirements_met JSONB DEFAULT '[]',
  requirements_missing JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_eligibility_tenant_id ON program_eligibility(tenant_id);
CREATE INDEX IF NOT EXISTS idx_program_eligibility_user_id ON program_eligibility(user_id);
CREATE INDEX IF NOT EXISTS idx_program_eligibility_program_id ON program_eligibility(program_id);
CREATE INDEX IF NOT EXISTS idx_program_eligibility_is_eligible ON program_eligibility(is_eligible);

-- Update trigger
DROP TRIGGER IF EXISTS update_program_eligibility_updated_at ON program_eligibility;
CREATE TRIGGER update_program_eligibility_updated_at
  BEFORE UPDATE ON program_eligibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

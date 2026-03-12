-- 007_compliance_progress.sql
-- Lender compliance module/task progress tracking

CREATE TABLE IF NOT EXISTS compliance_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_name TEXT,
  task_id TEXT NOT NULL,
  task_name TEXT,
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in_progress', 'complete')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id, task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_progress_tenant_id ON compliance_progress(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_progress_user_id ON compliance_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_progress_module_id ON compliance_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_compliance_progress_status ON compliance_progress(status);

-- Update trigger
DROP TRIGGER IF EXISTS update_compliance_progress_updated_at ON compliance_progress;
CREATE TRIGGER update_compliance_progress_updated_at
  BEFORE UPDATE ON compliance_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════════════════════════
-- FUNDREADY™ — Assessments Table
-- Stores user assessment answers and calculated scores
-- ════════════════════════════════════════════════════════════════════════════════

-- Create the assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Assessment answers (JSONB for flexibility)
  answers JSONB NOT NULL DEFAULT '{}',
  
  -- Calculated scores
  fundscore INTEGER,
  bankable_score INTEGER,
  
  -- Score breakdown by dimension
  credit_score INTEGER,
  documentation_score INTEGER,
  cash_flow_score INTEGER,
  banking_score INTEGER,
  structure_score INTEGER,
  narrative_score INTEGER,
  
  -- Metadata
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);

-- Enable Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own assessments
CREATE POLICY "assessments_select_own" ON public.assessments 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "assessments_insert_own" ON public.assessments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_update_own" ON public.assessments 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "assessments_delete_own" ON public.assessments 
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_assessments_updated ON public.assessments;
CREATE TRIGGER on_assessments_updated
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

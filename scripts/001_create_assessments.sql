-- Create the assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  fundscore INTEGER,
  bankable_score INTEGER,
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "assessments_select_own" ON public.assessments 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "assessments_insert_own" ON public.assessments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_update_own" ON public.assessments 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "assessments_delete_own" ON public.assessments 
  FOR DELETE USING (auth.uid() = user_id);

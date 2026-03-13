-- 용어 사전 테이블
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  module TEXT,
  definition TEXT NOT NULL,
  related_terms TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 같은 사용자가 같은 용어 중복 저장 방지
CREATE UNIQUE INDEX idx_glossary_user_term ON glossary_terms (user_id, term);

-- RLS
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own glossary" ON glossary_terms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glossary" ON glossary_terms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own glossary" ON glossary_terms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own glossary" ON glossary_terms
  FOR DELETE USING (auth.uid() = user_id);

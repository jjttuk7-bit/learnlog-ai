CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'LearnLog AI 학습 포트폴리오',
  content JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own portfolios" ON portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public portfolios are readable" ON portfolios FOR SELECT USING (is_public = true);
CREATE INDEX idx_portfolios_user ON portfolios(user_id);

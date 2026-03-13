-- 비즈니스 아이디어
CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  canvas JSONB DEFAULT '{}',
  status TEXT DEFAULT 'exploring' CHECK (status IN ('exploring', 'developing', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 학습-비즈니스 연결 인사이트
CREATE TABLE IF NOT EXISTS business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES business_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT,
  skill_learned TEXT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own ideas" ON business_ideas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own insights" ON business_insights
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_business_ideas_user ON business_ideas(user_id, status, updated_at DESC);
CREATE INDEX idx_business_insights_idea ON business_insights(idea_id, created_at DESC);

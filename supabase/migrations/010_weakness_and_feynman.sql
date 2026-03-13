-- 약점 개념 추적
CREATE TABLE weakness_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  module TEXT NOT NULL,
  topic TEXT,
  fail_count INT DEFAULT 1,
  last_asked TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 파인만 설명 품질 기록
CREATE TABLE feynman_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  module TEXT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  feedback_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE weakness_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feynman_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own weakness" ON weakness_concepts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own feynman" ON feynman_scores FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_weakness_user ON weakness_concepts(user_id, resolved, last_asked DESC);
CREATE INDEX idx_feynman_user ON feynman_scores(user_id, created_at DESC);
CREATE INDEX idx_feynman_concept ON feynman_scores(user_id, concept, created_at DESC);

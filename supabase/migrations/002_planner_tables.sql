-- 데일리 학습 플래너
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  plan_date DATE NOT NULL,
  module TEXT,
  topic TEXT,
  morning_concepts TEXT DEFAULT '',
  morning_points TEXT DEFAULT '',
  afternoon_concepts TEXT DEFAULT '',
  afternoon_points TEXT DEFAULT '',
  error_situation TEXT DEFAULT '',
  error_cause TEXT DEFAULT '',
  error_solution TEXT DEFAULT '',
  code_memo TEXT DEFAULT '',
  summary_1 TEXT DEFAULT '',
  summary_2 TEXT DEFAULT '',
  summary_3 TEXT DEFAULT '',
  understanding TEXT DEFAULT '',
  mood TEXT DEFAULT '',
  note TEXT DEFAULT '',
  tomorrow_plan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- 위클리 리뷰
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  module TEXT,
  daily_summaries JSONB DEFAULT '[]',
  key_code TEXT DEFAULT '',
  reflection_good TEXT DEFAULT '',
  reflection_bad TEXT DEFAULT '',
  reflection_improve TEXT DEFAULT '',
  next_week_goals TEXT DEFAULT '',
  github_commits INT DEFAULT 0,
  blog_posts INT DEFAULT 0,
  til_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_number)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own daily_plans" ON daily_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own weekly_reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_plans_user ON daily_plans(user_id, day_number);
CREATE INDEX idx_weekly_reviews_user ON weekly_reviews(user_id, week_number);

-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT DEFAULT 'learner',
  learning_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 커리큘럼 (119일 사전 입력 데이터)
CREATE TABLE curriculum (
  id SERIAL PRIMARY KEY,
  day_number INT NOT NULL UNIQUE,
  date DATE NOT NULL,
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INT DEFAULT 1,
  quest_id TEXT,
  quest_type TEXT,
  is_dlthon BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- 학습 캡처 (Smart Capture)
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  capture_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  ai_category TEXT,
  ai_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI 코칭 세션
CREATE TABLE coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  session_type TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  understanding_level INT,
  ai_feedback TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 회고 기록
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  ai_draft TEXT,
  user_content TEXT,
  wins TEXT[],
  struggles TEXT[],
  tomorrow_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀘스트 기록
CREATE TABLE quest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  quest_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  hints_used INT DEFAULT 0,
  hint_log JSONB DEFAULT '[]',
  ai_briefing TEXT,
  ai_review TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 자신감 엔진 (Confidence Engine)
CREATE TABLE confidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  win_cards JSONB DEFAULT '[]',
  streak_count INT DEFAULT 0,
  completion_rate DECIMAL(5,2),
  self_rating INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own captures" ON captures FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own sessions" ON coach_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own reflections" ON reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own quest_logs" ON quest_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own confidence" ON confidence_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Curriculum is readable by all" ON curriculum FOR SELECT USING (true);

-- 인덱스
CREATE INDEX idx_captures_user_date ON captures(user_id, created_at DESC);
CREATE INDEX idx_captures_curriculum ON captures(curriculum_id);
CREATE INDEX idx_sessions_user_date ON coach_sessions(user_id, created_at DESC);
CREATE INDEX idx_quest_logs_user ON quest_logs(user_id, quest_id);
CREATE INDEX idx_confidence_user ON confidence_records(user_id, created_at DESC);

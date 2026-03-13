-- 멘탈 케어 체크인 (아침 컨디션)
CREATE TABLE IF NOT EXISTS mindcare_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_level INT NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  ai_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checkins" ON mindcare_checkins
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_mindcare_checkins_user_date ON mindcare_checkins (user_id, created_at DESC);

-- 멘탈 케어 세션
CREATE TABLE IF NOT EXISTS mindcare_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '새 대화',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON mindcare_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_mindcare_sessions_user ON mindcare_sessions (user_id, updated_at DESC);

-- 멘탈 케어 메시지
CREATE TABLE IF NOT EXISTS mindcare_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES mindcare_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON mindcare_messages
  FOR ALL USING (
    session_id IN (SELECT id FROM mindcare_sessions WHERE user_id = auth.uid())
  );
CREATE INDEX idx_mindcare_messages_session ON mindcare_messages (session_id, created_at ASC);

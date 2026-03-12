CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  module TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tutor sessions" ON tutor_sessions
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can insert own tutor sessions" ON tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tutor sessions" ON tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_tutor_sessions_user ON tutor_sessions(user_id, created_at DESC);
CREATE INDEX idx_tutor_sessions_topic ON tutor_sessions(user_id, topic);

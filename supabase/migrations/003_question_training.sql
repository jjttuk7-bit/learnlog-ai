-- 질문근육 트레이닝 기록
CREATE TABLE IF NOT EXISTS question_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  record TEXT DEFAULT '',
  best_question TEXT DEFAULT '',
  reflection TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_number)
);

ALTER TABLE question_training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own question_training_records" ON question_training_records FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_qt_records_user ON question_training_records(user_id, day_number);

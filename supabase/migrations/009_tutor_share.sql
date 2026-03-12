ALTER TABLE tutor_sessions ADD COLUMN share_token TEXT UNIQUE;

CREATE INDEX idx_tutor_sessions_share ON tutor_sessions(share_token);

-- Allow public read access for shared sessions (via share_token)
CREATE POLICY "Anyone can read shared tutor sessions" ON tutor_sessions
  FOR SELECT USING (share_token IS NOT NULL);

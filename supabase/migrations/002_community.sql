CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'tip',
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON community_likes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_community_posts_date ON community_posts(created_at DESC);
CREATE INDEX idx_community_likes_post ON community_likes(post_id);

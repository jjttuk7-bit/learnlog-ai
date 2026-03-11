export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: "learner" | "admin";
  learning_goal: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurriculumRow {
  id: number;
  day_number: number;
  date: string;
  module: string;
  topic: string;
  difficulty: number;
  quest_id: string | null;
  quest_type: "sub_b" | "sub_c" | "main" | null;
  is_dlthon: boolean;
  notes: string | null;
}

export interface Capture {
  id: string;
  user_id: string;
  curriculum_id: number | null;
  capture_type: "text" | "voice" | "image" | "code";
  content: string;
  ai_category: "concept" | "code" | "question" | "insight" | null;
  ai_tags: string[] | null;
  created_at: string;
}

export interface CoachSession {
  id: string;
  user_id: string;
  curriculum_id: number | null;
  session_type: "checkin" | "feynman" | "blank_recall" | "review";
  messages: Array<{ role: string; content: string; timestamp: string }>;
  understanding_level: number | null;
  ai_feedback: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  curriculum_id: number | null;
  ai_draft: string | null;
  user_content: string | null;
  wins: string[] | null;
  struggles: string[] | null;
  tomorrow_plan: string | null;
  created_at: string;
}

export interface QuestLog {
  id: string;
  user_id: string;
  curriculum_id: number | null;
  quest_id: string;
  status: "not_started" | "in_progress" | "completed";
  hints_used: number;
  hint_log: Array<{ level: number; question: string; hint: string; timestamp: string }>;
  ai_briefing: string | null;
  ai_review: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface ConfidenceRecord {
  id: string;
  user_id: string;
  curriculum_id: number | null;
  win_cards: Array<{ title: string; description: string; evidence: string }>;
  streak_count: number;
  completion_rate: number | null;
  self_rating: number | null;
  created_at: string;
}

import { createClient } from "@/lib/supabase/server";

export interface MetricsResult {
  dailyRecordRate: { value: number; target: number; days: number; elapsed: number };
  coachCompletionRate: { value: number; target: number; completed: number; total: number };
  understandingTrend: { value: number; target: number; firstMonth: number; latestMonth: number };
  mainQuestRate: { value: number; target: number; submitted: number };
  streak: { value: number; current: number };
  winCards: { value: number; target: number; total: number };
}

const CURRICULUM_START = new Date("2026-03-11");
const CURRICULUM_DAYS = 119;
const WIN_CARD_TARGET = 357; // 119 x 3

function getElapsedDays(): number {
  const now = new Date();
  const diffMs = now.getTime() - CURRICULUM_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diffDays, 1), CURRICULUM_DAYS);
}

export async function calcDailyRecordRate(userId: string) {
  const supabase = await createClient();
  const elapsed = getElapsedDays();

  const { data, error } = await supabase
    .from("captures")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", CURRICULUM_START.toISOString());

  if (error || !data) {
    return { value: 0, target: 80, days: 0, elapsed };
  }

  const distinctDays = new Set(
    data.map((row) => new Date(row.created_at).toISOString().slice(0, 10))
  ).size;

  const rate = elapsed > 0 ? Math.round((distinctDays / elapsed) * 100) : 0;
  return { value: rate, target: 80, days: distinctDays, elapsed };
}

export async function calcCoachCompletionRate(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coach_sessions")
    .select("completed_at")
    .eq("user_id", userId);

  if (error || !data) {
    return { value: 0, target: 70, completed: 0, total: 0 };
  }

  const total = data.length;
  const completed = data.filter((row) => row.completed_at !== null).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { value: rate, target: 70, completed, total };
}

export async function calcUnderstandingTrend(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coach_sessions")
    .select("understanding_level, created_at")
    .eq("user_id", userId)
    .not("understanding_level", "is", null)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return { value: 0, target: 20, firstMonth: 0, latestMonth: 0 };
  }

  // Group by month (YYYY-MM)
  const byMonth: Record<string, number[]> = {};
  for (const row of data) {
    const month = new Date(row.created_at).toISOString().slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(row.understanding_level as number);
  }

  const months = Object.keys(byMonth).sort();
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const firstMonth = Math.round(avg(byMonth[months[0]]) * 10) / 10;
  const latestMonth = Math.round(avg(byMonth[months[months.length - 1]]) * 10) / 10;

  // Express improvement as percentage points on a 0-10 scale converted to 0-100
  const improvement =
    firstMonth > 0
      ? Math.round(((latestMonth - firstMonth) / firstMonth) * 100)
      : 0;

  return { value: improvement, target: 20, firstMonth, latestMonth };
}

export async function calcMainQuestRate(userId: string) {
  const supabase = await createClient();

  // Join quest_logs with curriculum to filter type='main'
  const { data, error } = await supabase
    .from("quest_logs")
    .select("submitted_at, curriculum_id")
    .eq("user_id", userId)
    .not("submitted_at", "is", null);

  if (error || !data) {
    return { value: 0, target: 5, submitted: 0 };
  }

  // Filter submitted quests that correspond to main quests via curriculum
  // We fetch curriculum rows with quest_type='main' to cross-check
  const { data: mainCurriculum } = await supabase
    .from("curriculum")
    .select("id")
    .eq("quest_type", "main");

  const mainIds = new Set((mainCurriculum ?? []).map((r) => r.id));
  const submitted = data.filter((row) => mainIds.has(row.curriculum_id)).length;

  const rate = Math.round((submitted / 5) * 100);
  return { value: rate, target: 100, submitted };
}

export async function calcStreak(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captures")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { value: 0, current: 0 };
  }

  const distinctDays = Array.from(
    new Set(data.map((row) => new Date(row.created_at).toISOString().slice(0, 10)))
  ).sort((a, b) => b.localeCompare(a)); // descending

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday to be "current"
  if (distinctDays[0] !== todayStr && distinctDays[0] !== yesterdayStr) {
    return { value: 0, current: 0 };
  }

  let streak = 1;
  for (let i = 1; i < distinctDays.length; i++) {
    const prev = new Date(distinctDays[i - 1]);
    const curr = new Date(distinctDays[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return { value: streak, current: streak };
}

export async function calcWinCards(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("confidence_records")
    .select("win_cards")
    .eq("user_id", userId);

  if (error || !data) {
    return { value: 0, target: WIN_CARD_TARGET, total: 0 };
  }

  const total = data.reduce((sum, row) => {
    const cards = row.win_cards as Array<unknown> | null;
    return sum + (Array.isArray(cards) ? cards.length : 0);
  }, 0);

  return { value: total, target: WIN_CARD_TARGET, total };
}

export async function getAllMetrics(userId: string): Promise<MetricsResult> {
  const [
    dailyRecordRate,
    coachCompletionRate,
    understandingTrend,
    mainQuestRate,
    streak,
    winCards,
  ] = await Promise.all([
    calcDailyRecordRate(userId),
    calcCoachCompletionRate(userId),
    calcUnderstandingTrend(userId),
    calcMainQuestRate(userId),
    calcStreak(userId),
    calcWinCards(userId),
  ]);

  return {
    dailyRecordRate,
    coachCompletionRate,
    understandingTrend,
    mainQuestRate,
    streak,
    winCards,
  };
}

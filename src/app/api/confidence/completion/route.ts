import { createClient } from "@/lib/supabase/server";
import { CURRICULUM } from "@/data/curriculum";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ percentage: 0 });
  }

  const today = new Date().toISOString().split("T")[0];
  const pastDays = CURRICULUM.filter((d) => d.date <= today);
  const totalPastDays = pastDays.length || 1;

  // 1. 기록일수
  const { data: captureDays } = await supabase
    .from("captures")
    .select("created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const uniqueCaptureDays = new Set(
    (captureDays || []).map((c: { created_at: string }) => c.created_at?.split("T")[0])
  ).size;
  const recordRate = Math.min(uniqueCaptureDays / totalPastDays, 1);

  // 2. 코칭 완료율
  const { data: coachDays } = await supabase
    .from("coach_sessions")
    .select("created_at")
    .eq("user_id", user.id);

  const uniqueCoachDays = new Set(
    (coachDays || []).map((c: { created_at: string }) => c.created_at?.split("T")[0])
  ).size;
  const coachRate = Math.min(uniqueCoachDays / totalPastDays, 1);

  // 3. 평균 이해도
  const { data: levels } = await supabase
    .from("coach_sessions")
    .select("understanding_level")
    .eq("user_id", user.id)
    .not("understanding_level", "is", null);

  const avgLevel = levels && levels.length > 0
    ? levels.reduce((sum: number, l: { understanding_level: number | null }) => sum + (l.understanding_level || 0), 0) / levels.length
    : 2.5;

  const percentage = Math.round(
    recordRate * 40 + coachRate * 30 + (avgLevel / 5) * 30
  );

  return Response.json({
    percentage: Math.min(Math.max(percentage, 0), 100),
    details: {
      recordRate: Math.round(recordRate * 100),
      coachRate: Math.round(coachRate * 100),
      avgLevel: Math.round(avgLevel * 10) / 10,
    },
  });
}

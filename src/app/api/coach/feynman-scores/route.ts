import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ scores: [] });

  const { data } = await supabase
    .from("feynman_scores")
    .select("concept, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(30);

  const scores = (data || []).map((d: { concept: string; score: number; created_at: string }) => ({
    date: d.created_at?.split("T")[0],
    concept: d.concept,
    score: d.score,
  }));

  return Response.json({ scores });
}

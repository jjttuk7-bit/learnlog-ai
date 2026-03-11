import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query coach_sessions for understanding levels grouped by week
    const { data: sessions } = await supabase
      .from("coach_sessions")
      .select("created_at, understanding_level, topic")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    // Query captures for sample entries
    const { data: captures } = await supabase
      .from("captures")
      .select("created_at, content, topic, understanding_level")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    // Group sessions by week number (relative to first entry)
    const milestones: {
      week: number;
      avg_understanding: number;
      sample_capture: string;
      topic: string;
    }[] = [];

    if (sessions && sessions.length > 0) {
      const firstDate = new Date(sessions[0].created_at);

      const weekMap = new Map<
        number,
        { levels: number[]; topics: string[]; captures: string[] }
      >();

      for (const session of sessions) {
        const sessionDate = new Date(session.created_at);
        const diffMs = sessionDate.getTime() - firstDate.getTime();
        const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

        if (!weekMap.has(week)) {
          weekMap.set(week, { levels: [], topics: [], captures: [] });
        }
        const entry = weekMap.get(week)!;
        if (session.understanding_level != null) {
          entry.levels.push(session.understanding_level);
        }
        if (session.topic) {
          entry.topics.push(session.topic);
        }
      }

      // Add capture content to matching weeks
      if (captures) {
        for (const capture of captures) {
          const captureDate = new Date(capture.created_at);
          const diffMs = captureDate.getTime() - firstDate.getTime();
          const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

          const entry = weekMap.get(week);
          if (entry && capture.content) {
            entry.captures.push(capture.content);
          }
        }
      }

      for (const [week, data] of weekMap.entries()) {
        const avg =
          data.levels.length > 0
            ? data.levels.reduce((a, b) => a + b, 0) / data.levels.length
            : 0;
        const topTopic = data.topics[0] || "학습";
        const sampleCapture =
          data.captures[0] ||
          (data.topics.length > 0
            ? `${data.topics[0]}에 대해 학습했습니다.`
            : "학습 기록");

        milestones.push({
          week,
          avg_understanding: Math.round(avg * 10) / 10,
          sample_capture: sampleCapture.slice(0, 200),
          topic: topTopic,
        });
      }

      milestones.sort((a, b) => a.week - b.week);
    }

    // Build comparison: earliest week vs most recent week
    const early = milestones[0] || null;
    const recent = milestones[milestones.length - 1] || null;

    // If same week, no meaningful comparison
    const comparison =
      early && recent && early.week !== recent.week
        ? { early, recent }
        : null;

    return Response.json({ milestones, comparison });
  } catch (error) {
    console.error("Growth API error:", error);
    return Response.json({ milestones: [], comparison: null });
  }
}

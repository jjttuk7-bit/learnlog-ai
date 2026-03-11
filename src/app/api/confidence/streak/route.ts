import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all capture dates for this user
    const { data: captures, error } = await supabase
      .from("captures")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch captures" }, { status: 500 });
    }

    if (!captures || captures.length === 0) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        total_active_days: 0,
      });
    }

    // Extract unique dates (YYYY-MM-DD)
    const uniqueDates = Array.from(
      new Set(captures.map((c) => c.created_at.slice(0, 10)))
    ).sort((a, b) => b.localeCompare(a)); // descending

    const total_active_days = uniqueDates.length;

    // Calculate current streak (consecutive days backwards from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current_streak = 0;
    const dateSet = new Set(uniqueDates);

    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (dateSet.has(key)) {
        current_streak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longest_streak = 0;
    let run = 1;

    const sortedAsc = [...uniqueDates].sort((a, b) => a.localeCompare(b));
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        run++;
        if (run > longest_streak) longest_streak = run;
      } else {
        run = 1;
      }
    }
    if (sortedAsc.length > 0 && longest_streak === 0) longest_streak = 1;

    return NextResponse.json({ current_streak, longest_streak, total_active_days });
  } catch (error) {
    console.error("Streak error:", error);
    return NextResponse.json({ error: "Failed to calculate streak" }, { status: 500 });
  }
}

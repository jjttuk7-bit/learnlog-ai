import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllMetrics } from "@/lib/metrics";

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

    const metrics = await getAllMetrics(user.id);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

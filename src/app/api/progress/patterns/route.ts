import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all captures for the user (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: captures } = await supabase
    .from("captures")
    .select("ai_category, created_at, capture_type")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (!captures || captures.length === 0) {
    return NextResponse.json({
      hourly: Array(24).fill(0),
      categories: {},
      daily: {},
      totalCaptures: 0,
      captureTypes: {},
    });
  }

  // Hourly distribution
  const hourly = Array(24).fill(0);
  // Category distribution
  const categories: Record<string, number> = {};
  // Daily activity (last 30 days)
  const daily: Record<string, number> = {};
  // Capture type distribution
  const captureTypes: Record<string, number> = {};

  for (const cap of captures) {
    const date = new Date(cap.created_at);
    const hour = date.getHours();
    hourly[hour]++;

    const cat = cap.ai_category || "concept";
    categories[cat] = (categories[cat] || 0) + 1;

    const dayKey = date.toISOString().slice(0, 10);
    daily[dayKey] = (daily[dayKey] || 0) + 1;

    const type = cap.capture_type || "text";
    captureTypes[type] = (captureTypes[type] || 0) + 1;
  }

  return NextResponse.json({
    hourly,
    categories,
    daily,
    totalCaptures: captures.length,
    captureTypes,
  });
}

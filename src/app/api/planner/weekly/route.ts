import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const week = req.nextUrl.searchParams.get("week");
    if (!week) return NextResponse.json({ error: "week required" }, { status: 400 });

    const { data } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_number", parseInt(week))
      .single();

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error("Weekly review GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { week_number, ...fields } = body;

    if (!week_number) return NextResponse.json({ error: "week_number required" }, { status: 400 });

    const { data, error } = await supabase
      .from("weekly_reviews")
      .upsert(
        {
          user_id: user.id,
          week_number,
          updated_at: new Date().toISOString(),
          ...fields,
        },
        { onConflict: "user_id,week_number" }
      )
      .select()
      .single();

    if (error) {
      console.error("Weekly review upsert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error("Weekly review POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

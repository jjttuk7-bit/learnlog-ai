import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dayNumber = req.nextUrl.searchParams.get("day");
    if (!dayNumber) return NextResponse.json({ error: "day required" }, { status: 400 });

    const { data } = await supabase
      .from("daily_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_number", parseInt(dayNumber))
      .single();

    return NextResponse.json({ plan: data });
  } catch (error) {
    console.error("Daily plan GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { day_number, ...fields } = body;

    if (!day_number) return NextResponse.json({ error: "day_number required" }, { status: 400 });

    // Upsert: create or update
    const { data, error } = await supabase
      .from("daily_plans")
      .upsert(
        {
          user_id: user.id,
          day_number,
          updated_at: new Date().toISOString(),
          ...fields,
        },
        { onConflict: "user_id,day_number" }
      )
      .select()
      .single();

    if (error) {
      console.error("Daily plan upsert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
  } catch (error) {
    console.error("Daily plan POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const day = req.nextUrl.searchParams.get("day");

    if (day) {
      // 특정 Day 조회
      const { data } = await supabase
        .from("question_training_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_number", parseInt(day))
        .single();
      return NextResponse.json({ record: data });
    }

    // 전체 기록 조회
    const { data } = await supabase
      .from("question_training_records")
      .select("*")
      .eq("user_id", user.id)
      .order("day_number");

    return NextResponse.json({ records: data ?? [] });
  } catch (error) {
    console.error("QT GET error:", error);
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

    const { data, error } = await supabase
      .from("question_training_records")
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
      console.error("QT upsert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ record: data });
  } catch (error) {
    console.error("QT POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

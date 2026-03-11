import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET today's self-rating
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

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("confidence_records")
      .select("id, self_rating, created_at")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 });
    }

    return NextResponse.json({ rating: data?.self_rating ?? null, record_id: data?.id ?? null });
  } catch (error) {
    console.error("Rating GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST / upsert today's self-rating
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, record_id } = await request.json();

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    if (record_id) {
      // Update existing record
      const { error } = await supabase
        .from("confidence_records")
        .update({ self_rating: rating })
        .eq("id", record_id)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: "Failed to update rating" }, { status: 500 });
      }
      return NextResponse.json({ success: true, record_id });
    } else {
      // Insert new record with just the rating
      const { data, error } = await supabase
        .from("confidence_records")
        .insert({
          user_id: user.id,
          self_rating: rating,
          win_cards: [],
          streak_count: 0,
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
      }
      return NextResponse.json({ success: true, record_id: data.id });
    }
  } catch (error) {
    console.error("Rating POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

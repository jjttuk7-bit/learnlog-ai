import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 오늘의 세션 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("coach_sessions")
      .select("id, session_type, messages, understanding_level, created_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// 새 세션 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_type, messages } = await request.json();

    const { data, error } = await supabase
      .from("coach_sessions")
      .insert({
        user_id: user.id,
        session_type: session_type || "checkin",
        messages: messages || [],
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// 세션 업데이트 (메시지 추가)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, messages, understanding_level } = await request.json();

    const updateData: Record<string, unknown> = { messages };
    if (understanding_level) {
      updateData.understanding_level = understanding_level;
    }

    const { error } = await supabase
      .from("coach_sessions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET: 세션 목록 (노트 포함)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const search = searchParams.get("search");

    let query = supabase
      .from("tutor_sessions")
      .select("id, topic, module, messages, summary, tags, created_at, updated_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (topic) {
      query = query.eq("topic", topic);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Client-side search filtering (tags + summary + messages content)
    let sessions = data ?? [];
    if (search) {
      const searchLower = search.toLowerCase();
      sessions = sessions.filter((s) => {
        const inTopic = s.topic?.toLowerCase().includes(searchLower);
        const inSummary = s.summary?.toLowerCase().includes(searchLower);
        const inTags = s.tags?.some((t: string) => t.toLowerCase().includes(searchLower));
        const inMessages = s.messages?.some(
          (m: { content: string }) => m.content?.toLowerCase().includes(searchLower)
        );
        return inTopic || inSummary || inTags || inMessages;
      });
    }

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST: 새 세션 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, module, messages } = await request.json();

    const sessionId = crypto.randomUUID();
    const { error } = await supabase
      .from("tutor_sessions")
      .insert({
        id: sessionId,
        user_id: user.id,
        topic: topic || "일반 질문",
        module: module || null,
        messages: messages || [],
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: sessionId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// PATCH: 세션 업데이트 (메시지 추가, 요약 저장)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, messages, summary, tags } = await request.json();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (messages) updateData.messages = messages;
    if (summary) updateData.summary = summary;
    if (tags) updateData.tags = tags;

    const { error } = await supabase
      .from("tutor_sessions")
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

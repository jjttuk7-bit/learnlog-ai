import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [capturesRes, diaryRes] = await Promise.all([
      supabase
        .from("captures")
        .select("id, content, capture_type, ai_category, deleted_at")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50),
      supabase
        .from("diary_entries")
        .select("id, title, content, deleted_at")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(50),
    ]);

    const captures = (capturesRes.data ?? []).map((c) => ({ ...c, type: "capture" as const }));
    const diary = (diaryRes.data ?? []).map((d) => ({ ...d, type: "diary" as const }));

    // 삭제 시간순 정렬
    const items = [...captures, ...diary].sort(
      (a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime()
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch trash" }, { status: 500 });
  }
}

// 복원
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type } = await request.json();
    const table = type === "diary" ? "diary_entries" : "captures";

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: null })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to restore" }, { status: 500 });
  }
}

// 영구 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type } = await request.json();
    const table = type === "diary" ? "diary_entries" : "captures";

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to permanently delete" }, { status: 500 });
  }
}

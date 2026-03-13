import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("mindcare_sessions")
      .select("id, title, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const { data: messages } = await supabase
      .from("mindcare_messages")
      .select("id, role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ session, messages: messages ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

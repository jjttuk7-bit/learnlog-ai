import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST: Generate share token for a session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    // Verify ownership
    const { data: session } = await supabase
      .from("tutor_sessions")
      .select("id, share_token")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Return existing token or generate new one
    if (session.share_token) {
      return NextResponse.json({ token: session.share_token });
    }

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    const { error } = await supabase
      .from("tutor_sessions")
      .update({ share_token: token })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}

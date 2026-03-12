import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET: Fetch shared session by token (public, no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Use service-level query - share_token lookup doesn't need auth
    const { data, error } = await supabase
      .from("tutor_sessions")
      .select("topic, module, messages, summary, tags, created_at")
      .eq("share_token", token)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ session: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

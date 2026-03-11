import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check team exists
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already a member of this team" }, { status: 409 });
    }

    // Add as member
    const { error: insertError } = await supabase.from("team_members").insert({
      team_id: id,
      user_id: user.id,
      role: "member",
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Team join POST error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    // Get team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check membership
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
    }

    // Get members with profile info
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles (
          display_name,
          email
        )
      `)
      .eq("team_id", id)
      .order("joined_at", { ascending: true });

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from("team_activities")
      .select("*")
      .eq("team_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 });
    }

    return NextResponse.json({
      team,
      members: members ?? [],
      activities: activities ?? [],
      currentUserRole: membership.role,
    });
  } catch (error) {
    console.error("Team detail GET error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all teams the user is a member of, with member count
    const { data: memberships, error } = await supabase
      .from("team_members")
      .select(`
        role,
        teams (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For each team, get member count
    const teams = await Promise.all(
      (memberships ?? []).map(async (m) => {
        const team = m.teams as { id: string; name: string; description?: string; created_at: string } | null;
        if (!team) return null;

        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id);

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          created_at: team.created_at,
          role: m.role,
          memberCount: count ?? 1,
        };
      })
    );

    return NextResponse.json({ teams: teams.filter(Boolean) });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name: name.trim(), description: description?.trim() ?? null, created_by: user.id })
      .select()
      .single();

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    // Add creator as leader in team_members
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "leader",
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Team POST error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

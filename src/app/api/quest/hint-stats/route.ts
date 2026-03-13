import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const questId = request.nextUrl.searchParams.get("questId");
  if (!questId) return Response.json({ hintsUsed: 0 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ hintsUsed: 0 });

  const { data } = await supabase
    .from("quest_logs")
    .select("hints_used")
    .eq("user_id", user.id)
    .eq("quest_id", questId)
    .limit(1)
    .single();

  return Response.json({ hintsUsed: data?.hints_used || 0 });
}

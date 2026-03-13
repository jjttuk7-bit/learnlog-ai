import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const module = request.nextUrl.searchParams.get("module");
  const search = request.nextUrl.searchParams.get("q");

  let query = supabase
    .from("glossary_terms")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (module) query = query.eq("module", module);
  if (search) query = query.ilike("term", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ terms: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await supabase.from("glossary_terms").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}

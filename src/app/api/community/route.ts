import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const postType = searchParams.get("post_type");

    let query = supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postType && postType !== "all") {
      query = query.eq("post_type", postType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
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

    const { content, post_type, is_anonymous, display_name, curriculum_id } =
      await request.json();

    if (!content || !post_type) {
      return NextResponse.json(
        { error: "content and post_type required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        content,
        post_type,
        is_anonymous: is_anonymous ?? false,
        display_name: is_anonymous ? null : display_name,
        curriculum_id: curriculum_id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Community POST error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "post id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Community DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

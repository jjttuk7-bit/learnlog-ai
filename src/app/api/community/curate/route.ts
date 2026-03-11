import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_MODELS } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weak_points } = await request.json();

    const { data: posts } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    if (!process.env.OPENAI_API_KEY || !weak_points) {
      const shuffled = [...posts].sort(() => Math.random() - 0.5);
      return NextResponse.json({ posts: shuffled.slice(0, 5) });
    }

    const postSummaries = posts
      .slice(0, 50)
      .map((p, i) => `[${i}] (${p.post_type}) ${p.content.slice(0, 100)}`)
      .join("\n");

    const prompt = `당신은 AI 학습 큐레이터입니다. 사용자의 취약점을 바탕으로 가장 관련성 높은 동료의 학습 공유 글을 추천해주세요.

사용자 취약점: ${weak_points}

동료 게시글 목록 (인덱스: 내용):
${postSummaries}

위 목록에서 사용자의 취약점과 가장 관련성 높은 글의 인덱스를 최대 5개 선택하세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"indices": [0, 3, 7, 12, 25]}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.communityCurate,
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content ?? '{"indices":[]}';
    const parsed = JSON.parse(text);
    const indices: number[] = parsed.indices ?? [];

    const curated = indices
      .filter((i) => i >= 0 && i < posts.length)
      .map((i) => posts[i]);

    return NextResponse.json({ posts: curated });
  } catch (error) {
    console.error("Community curate error:", error);
    return NextResponse.json({ error: "Failed to curate posts" }, { status: 500 });
  }
}

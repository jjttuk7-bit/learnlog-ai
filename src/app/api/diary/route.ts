import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .select("id, title, content, ai_comment, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 });
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

    const { title, content } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요" }, { status: 400 });
    }

    // AI 코멘트 생성
    let aiComment: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: AI_MODELS.captureClassify,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: `당신은 따뜻하고 통찰력 있는 AI 학습 멘토입니다. 학습자의 일기를 읽고 격려와 피드백을 제공합니다.

## 코멘트 원칙
1. 학습자의 노력과 성장 포인트를 구체적으로 짚어 칭찬하세요
2. 기록에서 발견한 핵심 인사이트를 하나 강조하세요
3. 다음 학습에 도움이 될 질문이나 제안을 하나 던져주세요
4. 관련 개념이나 실무 연결 포인트를 알려주세요

## 형식
- 4~6문장으로 작성
- 한국어, 따뜻한 톤
- 이모지 적절히 사용`,
            },
            {
              role: "user",
              content: `제목: ${title}\n\n${content}`,
            },
          ],
        });
        aiComment = completion.choices[0].message.content ?? null;
      } catch {
        // AI 실패해도 일기는 저장
      }
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        ai_comment: aiComment,
      })
      .select("id, title, content, ai_comment, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create diary entry" }, { status: 500 });
  }
}

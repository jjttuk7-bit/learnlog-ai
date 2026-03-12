import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, messages } = await request.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages to summarize" }, { status: 400 });
    }

    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "학생" : "튜터"}: ${m.content}`
      )
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 AI 학습 대화를 핵심 노트로 정리하는 전문가입니다.

다음 대화를 분석하여 JSON으로 응답하세요:

{
  "summary": "대화의 핵심 내용을 3-5개 항목으로 정리 (마크다운 형식, 각 항목은 질문과 핵심 답변을 포함)",
  "tags": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
}

규칙:
- summary는 나중에 복습할 때 유용하도록 핵심만 간결하게
- 각 항목은 "**Q: 질문** → 핵심 답변" 형태
- tags는 대화에서 다룬 주요 개념/기술 키워드 3-5개
- 한글로 작성`,
        },
        {
          role: "user",
          content: conversationText,
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(text);

    const summary = parsed.summary ?? "";
    const tags = parsed.tags ?? [];

    // Save to DB
    if (sessionId) {
      await supabase
        .from("tutor_sessions")
        .update({ summary, tags, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ summary, tags });
  } catch (error) {
    console.error("Tutor summarize error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}

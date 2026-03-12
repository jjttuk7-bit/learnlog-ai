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

    const { sessionId } = await request.json();

    // Fetch the session's summary and messages
    const { data: session } = await supabase
      .from("tutor_sessions")
      .select("summary, messages, topic, tags")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const context = session.summary
      || session.messages?.map((m: { role: string; content: string }) =>
          `${m.role === "user" ? "학생" : "튜터"}: ${m.content}`
        ).join("\n").slice(0, 3000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `학습 대화 내용을 기반으로 복습 퀴즈를 만드세요. JSON으로 응답:

{
  "quiz": [
    {
      "question": "질문 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 0,
      "explanation": "정답 해설"
    }
  ]
}

규칙:
- 3-5개의 4지선다 문제
- 대화에서 다룬 핵심 개념 중심
- 비전공자 수준에 맞게
- 해설은 틀렸을 때 이해할 수 있도록 충분히 설명
- 한글로 작성`,
        },
        {
          role: "user",
          content: `토픽: ${session.topic}\n키워드: ${session.tags?.join(", ") || "없음"}\n\n대화 내용:\n${context}`,
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({ quiz: parsed.quiz ?? [] });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}

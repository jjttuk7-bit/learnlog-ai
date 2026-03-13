import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await request.json();
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const { data: idea } = await supabase
    .from("business_ideas")
    .select("title, canvas")
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .single();

  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ analysis: "API 키가 설정되지 않았습니다." });
  }

  const canvas = idea.canvas || {};
  const completion = await openai.chat.completions.create({
    model: AI_MODELS.businessChat,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `당신은 시장 분석 전문가입니다. 비즈니스 아이디어의 경쟁 환경을 분석해주세요.

## 분석 항목 (마크다운 형식)
### 1. 유사 서비스/경쟁사 (3~5개)
- 이름, 간단한 설명, 강점/약점

### 2. 시장 포지셔닝 맵
- 이 아이디어가 경쟁사 대비 어디에 위치하는지

### 3. 차별화 전략 제안
- 경쟁사 대비 차별화할 수 있는 구체적 방법 2~3가지

### 4. 진입 장벽 & 리스크
- 시장 진입 시 예상되는 장벽과 대응 방안

한국어로 답변하세요.`,
      },
      {
        role: "user",
        content: `비즈니스 아이디어: ${idea.title}
문제: ${canvas.problem || "미정"}
타겟: ${canvas.target || "미정"}
솔루션: ${canvas.solution || "미정"}
기술 스택: ${canvas.tech_stack || "미정"}
경쟁 우위: ${canvas.advantage || "미정"}

이 아이디어의 경쟁 환경을 분석해주세요.`,
      },
    ],
  });

  const analysis = completion.choices[0].message.content ?? "";
  return NextResponse.json({ analysis });
}

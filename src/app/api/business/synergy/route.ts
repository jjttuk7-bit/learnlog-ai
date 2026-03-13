import { NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ideas } = await supabase
    .from("business_ideas")
    .select("id, title, canvas, status")
    .eq("user_id", user.id)
    .neq("status", "paused")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!ideas || ideas.length < 2) {
    return NextResponse.json({ error: "2개 이상의 활성 아이디어가 필요합니다" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ analysis: "API 키가 설정되지 않았습니다." });
  }

  const ideasSummary = ideas.map((idea, i) => {
    const canvas = idea.canvas || {};
    return `${i + 1}. "${idea.title}"
   - 문제: ${canvas.problem || "미정"}
   - 타겟: ${canvas.target || "미정"}
   - 솔루션: ${canvas.solution || "미정"}
   - 기술: ${canvas.tech_stack || "미정"}`;
  }).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.businessSynergy,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `당신은 AI 비즈니스 전략가입니다. 여러 비즈니스 아이디어 간의 시너지를 분석해주세요.

## 분석 포인트
1. **공유 가능 자원**: 기술, 데이터, 인프라 중 공유할 수 있는 것
2. **교차 판매 기회**: 한 서비스의 고객이 다른 서비스도 필요로 할 가능성
3. **통합 아이디어**: 두 개 이상의 아이디어를 합쳐 더 강력한 하나의 서비스를 만들 수 있는지
4. **우선순위 제안**: 어떤 아이디어를 먼저 시작하면 나머지에 도움이 되는지

한국어로 답변하세요. 마크다운 형식으로 구조화해주세요.`,
      },
      {
        role: "user",
        content: `다음 비즈니스 아이디어들 간의 시너지를 분석해주세요:\n\n${ideasSummary}`,
      },
    ],
  });

  const analysis = completion.choices[0].message.content ?? "";
  return NextResponse.json({ analysis });
}

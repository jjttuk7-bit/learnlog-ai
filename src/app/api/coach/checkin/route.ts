import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { captures, module, topic } = await request.json();

  // 미해결 약점 개념 조회
  let weaknessList = "";
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: weaknesses } = await supabase
        .from("weakness_concepts")
        .select("concept, module, fail_count")
        .eq("user_id", user.id)
        .eq("resolved", false)
        .order("fail_count", { ascending: false })
        .limit(5);

      if (weaknesses && weaknesses.length > 0) {
        weaknessList = "\n\n## 이전 학습에서 약했던 개념 (우선 재질문 대상)\n" +
          weaknesses.map((w: { concept: string; module: string; fail_count: number }) =>
            `- ${w.concept} (${w.module}, ${w.fail_count}회 어려움)`
          ).join("\n") +
          "\n\n위 약점 개념 중 오늘 주제와 관련 있는 것이 있다면, 반드시 질문에 포함하세요.";
      }
    }
  } catch {
    // 약점 조회 실패해도 체크인은 정상 진행
  }

  const systemPrompt = `당신은 LearnLog AI의 메타인지 학습 코치입니다.

## 핵심 원칙
1. 소크라테스식 질문법으로 학습자가 스스로 깨닫도록 질문합니다.
2. 예시 우선: 모든 설명에 실생활 예시 + 코드 예시를 포함합니다.
3. 비개발자 맥락: 창업자·기획자 관점 비유를 추가합니다.
4. 구체적 근거 기반 격려를 제공합니다.

현재 모듈: ${module || "미정"}
오늘 주제: ${topic || "미정"}
${weaknessList}

항상 한국어로 답변하세요.`;

  const userMessage =
    captures && captures.length > 0
      ? `오늘 학습 캡처 내용:\n\n${captures.join("\n\n")}\n\n이 내용을 바탕으로 소크라테스식 질문 3개를 생성해주세요. 각 질문은:\n1. 개념 이해 질문\n2. 적용 질문\n3. 연결 질문`
      : `오늘 학습 모듈은 "${module}"이고, 주제는 "${topic}"입니다.\n이 주제에 대해 메타인지 체크인을 시작해주세요. 소크라테스식 질문 3개를 생성해주세요.`;

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content:
          "API 키가 설정되지 않았습니다. .env.local에 OPENAI_API_KEY를 추가해주세요.",
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.coachCheckin,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const text = completion.choices[0].message.content ?? "";

  return new Response(JSON.stringify({ content: text }), {
    headers: { "Content-Type": "application/json" },
  });
}

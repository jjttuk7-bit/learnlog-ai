import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { questId, questTitle, questDescription, module } =
    await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content: `## ${questTitle} 브리핑\n\n이 퀘스트에 대한 AI 브리핑을 보려면 .env.local에 OPENAI_API_KEY를 설정하세요.`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.questBriefing,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `당신은 LearnLog AI의 퀘스트 브리핑 파트너입니다.

[예시 우선 정책 — 필수]
모든 개념 설명에 반드시:
1. 실생활 예시 1개
2. 코드 예시 1개 (3~10줄)
3. 비개발자 맥락 예시 1개

한국어로 답변하세요.`,
      },
      {
        role: "user",
        content: `퀘스트: ${questTitle}\n설명: ${questDescription}\n모듈: ${module}\n\n다음을 제공해주세요:\n1. 퀘스트 목표를 3~4개 하위 단계로 분해\n2. 각 단계에 필요한 핵심 개념\n3. 각 개념에 대한 실생활 예시 + 코드 예시`,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "";
  return new Response(JSON.stringify({ content: text }), {
    headers: { "Content-Type": "application/json" },
  });
}

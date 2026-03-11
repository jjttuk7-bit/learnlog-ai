import { NextRequest } from "next/server";
import OpenAI from "openai";
import { AI_MODELS } from "@/lib/ai/models";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { captures, coachingMessages, module, topic } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content:
          "오늘의 학습 회고를 작성해보세요. (API 키 미설정)",
        wins: ["오늘도 학습을 기록했습니다"],
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.coachReflection,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `당신은 LearnLog AI의 학습 회고 코치입니다.
오늘의 캡처와 코칭 세션을 기반으로 회고 초안을 작성해주세요.

형식:
## 오늘의 학습 요약
(2~3문장)

## 오늘의 WIN 3가지
1. (구체적 성과)
2. (구체적 성과)
3. (구체적 성과)

## 어려웠던 점
(솔직하게)

## 내일 학습 제안
(구체적 다음 단계)

구체적 근거 기반 격려를 포함하세요. 한국어로 작성하세요.`,
      },
      {
        role: "user",
        content: `모듈: ${module}\n주제: ${topic}\n\n캡처 내용:\n${captures?.join("\n") || "없음"}\n\n코칭 대화:\n${coachingMessages?.join("\n") || "없음"}\n\n오늘의 학습 회고를 작성해주세요.`,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "";

  return new Response(JSON.stringify({ content: text }), {
    headers: { "Content-Type": "application/json" },
  });
}

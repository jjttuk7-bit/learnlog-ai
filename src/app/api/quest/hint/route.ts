import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const hintInstructions: Record<number, string> = {
  1: "개념의 방향만 제시하세요. 어떤 개념을 살펴봐야 하는지만 알려주세요. 정답을 주지 마세요.",
  2: "접근 방법을 제시하세요. 문제를 어떤 단계로 나눠서 생각해야 하는지 안내하세요.",
  3: "유사한 문제의 코드 예시를 제공하세요. 퀘스트의 직접 정답이 아닌 비슷한 패턴의 예시 코드를 보여주세요.",
};

export async function POST(request: NextRequest) {
  const { questTitle, stuckPoint, hintLevel, module } = await request.json();
  const level = Math.min(Math.max(hintLevel || 1, 1), 3);

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        content: `힌트 Level ${level}: API 키를 설정하면 AI 힌트를 받을 수 있습니다.`,
        level,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: `당신은 학습 힌트 제공자입니다.
[핵심 철학] 정답을 주지 말고 스스로 도달하게 안내합니다.
${hintInstructions[level]}
한국어로 답변하세요.`,
    messages: [
      {
        role: "user",
        content: `퀘스트: ${questTitle}\n모듈: ${module}\n막힌 지점: ${stuckPoint}\n\nLevel ${level} 힌트를 주세요.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return new Response(JSON.stringify({ content: text, level }), {
    headers: { "Content-Type": "application/json" },
  });
}

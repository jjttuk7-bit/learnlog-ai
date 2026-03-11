import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BLANK_RECALL_SYSTEM_PROMPT } from "@/lib/prompts/deep-check";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { userRecall, originalCaptures, module, topic } =
    await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      content:
        "API 키를 설정하면 백지학습 분석을 받을 수 있습니다.",
      coverage: 0,
    });
  }

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: BLANK_RECALL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `모듈: ${module}, 주제: ${topic}\n\n[오늘의 캡처 원본]\n${originalCaptures || "캡처 없음"}\n\n[학습자의 백지 재구성]\n${userRecall}\n\n비교 분석해주세요.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return Response.json({ content: text });
}

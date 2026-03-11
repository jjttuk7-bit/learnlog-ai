import { NextRequest } from "next/server";
import { BLANK_RECALL_SYSTEM_PROMPT } from "@/lib/prompts/deep-check";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { userRecall, originalCaptures, module, topic } =
    await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      content:
        "API 키를 설정하면 백지학습 분석을 받을 수 있습니다.",
      coverage: 0,
    });
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.blankRecall,
    max_tokens: 1024,
    messages: [
      { role: "system", content: BLANK_RECALL_SYSTEM_PROMPT },
      {
        role: "user",
        content: `모듈: ${module}, 주제: ${topic}\n\n[오늘의 캡처 원본]\n${originalCaptures || "캡처 없음"}\n\n[학습자의 백지 재구성]\n${userRecall}\n\n비교 분석해주세요.`,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "";
  return Response.json({ content: text });
}

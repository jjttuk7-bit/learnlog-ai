import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { module, topic, difficulty } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({
      goals: [
        `${topic}의 핵심 개념을 이해한다`,
        "학습 내용을 최소 3개 캡처한다",
        "AI 코치 체크인을 완료한다",
      ],
    }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.dailyBrief,
      max_tokens: 300,
      messages: [
        { role: "system", content: "당신은 AI 학습 코치입니다. 오늘의 학습 목표 3개를 JSON 배열로 반환하세요. 형식: {\"goals\": [\"목표1\", \"목표2\", \"목표3\"]}. 각 목표는 구체적이고 달성 가능해야 합니다. 한국어로 작성하세요." },
        { role: "user", content: `모듈: ${module}\n주제: ${topic}\n난이도: ${difficulty}/5\n\n이 학습에 맞는 오늘의 학습 목표 3개를 생성해주세요.` },
      ],
    });

    const text = completion.choices[0].message.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
    }
  } catch {}

  return new Response(JSON.stringify({
    goals: [`${topic}의 핵심 개념을 이해한다`, "학습 내용을 최소 3개 캡처한다", "AI 코치 체크인을 완료한다"],
  }), { headers: { "Content-Type": "application/json" } });
}

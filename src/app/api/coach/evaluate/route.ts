import { NextRequest } from "next/server";
import OpenAI from "openai";
import { AI_MODELS } from "@/lib/ai/models";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { question, answer, module, topic } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content:
          "좋은 답변이에요! (API 키 미설정 — 실제 평가를 받으려면 .env.local에 OPENAI_API_KEY를 추가하세요)",
        understanding_level: 3,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const systemPrompt = `당신은 LearnLog AI의 학습 평가 코치입니다.

## 평가 기준 (5점 척도)
1점: 개념 자체를 설명하지 못함
2점: 표면적 이해
3점: 기본 이해
4점: 응용 가능
5점: 전문가 수준

현재 모듈: ${module || "미정"}, 주제: ${topic || "미정"}

답변 형식 (JSON):
{"understanding_level": 1-5, "feedback": "피드백 내용", "follow_up": "후속 질문 또는 제안"}

잘한 점을 먼저 언급하세요. 점수 3 이하 시 실생활 예시 + 코드 예시 보충. 한국어로 답변하세요.`;

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.coachEvaluate,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `질문: ${question}\n\n학습자의 답변: ${answer}\n\n위 답변을 평가해주세요. JSON 형식으로 응답해주세요.`,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "";

  // Try to parse JSON, fallback to text response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(
        JSON.stringify({
          content:
            parsed.feedback +
            (parsed.follow_up ? `\n\n💡 ${parsed.follow_up}` : ""),
          understanding_level: parsed.understanding_level,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
  } catch {
    // fallback below
  }

  return new Response(
    JSON.stringify({ content: text, understanding_level: 3 }),
    { headers: { "Content-Type": "application/json" } },
  );
}

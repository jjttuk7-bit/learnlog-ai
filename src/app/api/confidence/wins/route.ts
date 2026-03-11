import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { captures, coachingMessages, module, topic } = await request.json();

  const defaultWins = [
    {
      title: "오늘도 기록했다",
      description:
        "학습을 기록하는 것 자체가 메타인지의 시작입니다",
      evidence: "LearnLog AI 접속",
    },
    {
      title: "꾸준함이 실력",
      description:
        "매일 조금씩 쌓이는 기록이 6개월 후 포트폴리오가 됩니다",
      evidence: "일일 학습 기록",
    },
    {
      title: "성장 중",
      description: "어제보다 한 걸음 더 나아갔습니다",
      evidence: "학습 진행",
    },
  ];

  if (
    !process.env.OPENAI_API_KEY ||
    (!captures?.length && !coachingMessages?.length)
  ) {
    return Response.json({ wins: defaultWins });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `오늘의 학습 기록에서 잘한 것 3가지를 JSON으로 추출하세요.
형식: {"wins": [{"title": "성과 제목", "description": "구체적 근거", "evidence": "증거"}]}
구체적 근거 기반 격려. 빈 칭찬 금지. 한국어로.`,
        },
        {
          role: "user",
          content: `모듈: ${module}, 주제: ${topic}\n캡처: ${captures?.join("\n") || "없음"}\n코칭: ${coachingMessages?.join("\n") || "없음"}`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Response.json(parsed);
    }
  } catch {
    // Fall through to default wins
  }

  return Response.json({ wins: defaultWins });
}

import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const { user_id, week_number } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const weekNum = week_number ?? getCurrentWeekNumber();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildFallback(weekNum));
    }

    const prompt = `당신은 AI/ML 부트캠프 학습자의 주간 학습을 분석하는 AI 코치입니다.

${weekNum}주차 학습 데이터를 기반으로 주간 리포트를 생성하세요.

다음 JSON 형식으로만 응답하세요:
{
  "week_number": ${weekNum},
  "summary": "이번 주 학습을 한 문장으로 요약",
  "achievements": ["달성한 것 1", "달성한 것 2", "달성한 것 3"],
  "improvements": ["개선이 필요한 부분 1", "개선이 필요한 부분 2"],
  "next_week_goals": ["다음 주 목표 1", "다음 주 목표 2", "다음 주 목표 3"],
  "score": 75
}

score는 0~100 정수로, 이번 주 전반적인 학습 완성도를 나타냅니다.`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.weeklyReport,
      max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `사용자 ${user_id}의 ${weekNum}주차 학습 리포트를 생성해주세요.`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      week_number: parsed.week_number ?? weekNum,
      summary: parsed.summary ?? "",
      achievements: parsed.achievements ?? [],
      improvements: parsed.improvements ?? [],
      next_week_goals: parsed.next_week_goals ?? [],
      score: parsed.score ?? 0,
    });
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json({ error: "Failed to generate weekly report" }, { status: 500 });
  }
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function buildFallback(weekNum: number) {
  return {
    week_number: weekNum,
    summary: `${weekNum}주차 학습을 성실히 완료했습니다.`,
    achievements: [
      "핵심 개념 학습 완료",
      "AI 코치 체크인 3회 완료",
      "퀘스트 제출 완료",
    ],
    improvements: [
      "복습 빈도를 높여보세요",
      "백지학습 연습을 꾸준히 해보세요",
    ],
    next_week_goals: [
      "다음 모듈 예습하기",
      "메타인지 체크인 매일 하기",
      "개념 연결 마인드맵 작성하기",
    ],
    score: 72,
  };
}

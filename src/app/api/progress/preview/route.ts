import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, module, dayNumber, difficulty } = await request.json();

  if (!topic || !module) {
    return NextResponse.json({ error: "topic and module required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      guide: `**${topic}** 예습 가이드\n\n이 주제를 미리 공부하면 본 수업에서 더 많은 것을 얻을 수 있습니다.`,
    });
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.tutorChat,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content: `당신은 비전공자를 위한 AI/ML 학습 예습 가이드 작성자입니다.
학습자는 컴퓨터공학 비전공자이며, AIFFEL AI/ML 부트캠프에 참가 중입니다.

## 예습 가이드 작성 원칙
1. **비전공자 눈높이**: 전문 용어는 반드시 쉬운 비유와 함께 설명
2. **구체적 예시**: 추상적 설명보다 "예를 들어..."로 시작하는 구체적 설명
3. **핵심만 간결하게**: 수업 전에 30분~1시간 안에 훑어볼 수 있는 분량

## 작성 포맷 (마크다운)
### 이 수업에서 배우는 것
- 한 줄 요약

### 미리 알아야 하는 핵심 개념 (3~5개)
각 개념마다:
- **개념명**: 쉬운 설명 + 비유
- 왜 중요한지 한 줄

### 이것만 미리 해보세요
- 구체적으로 미리 해볼 수 있는 실습이나 준비 사항 2~3가지
- 예: "파이썬에서 리스트 만들어보기", "NumPy 공식 문서 훑어보기" 등

### 수업 중 집중 포인트
- 수업에서 특히 집중해서 들어야 할 부분 2~3가지
- "이 부분이 어려우면 ○○○부터 다시 보세요" 팁

### 흔한 실수 & 혼동 주의
- 비전공자가 자주 헷갈리는 포인트 1~2가지

한국어로 작성하세요.`,
      },
      {
        role: "user",
        content: `Day ${dayNumber || "?"} 예습 가이드를 작성해주세요.
모듈: ${module}
주제: ${topic}
난이도: ${difficulty || "?"}/5`,
      },
    ],
  });

  const guide = completion.choices[0].message.content ?? "";
  return NextResponse.json({ guide });
}

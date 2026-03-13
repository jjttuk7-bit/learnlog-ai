import { NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

export async function POST() {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = getTodayCurriculum();
  const currentModule = getCurrentModule();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      briefing: "API 키가 설정되지 않았습니다.",
      topic: today?.topic || "AI/ML",
    });
  }

  // 사용자가 학습 중인 용어 가져오기
  const { data: recentTerms } = await supabase
    .from("glossary_terms")
    .select("term")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const termsContext = (recentTerms || []).map((t) => t.term).join(", ");

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.tutorChat,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `당신은 AI/ML 산업 트렌드 분석가이자 학습 멘토입니다.
비전공자 학습자가 현재 배우고 있는 주제와 관련된 AI 업계 트렌드를 브리핑합니다.

## 브리핑 작성 원칙
1. **학습 주제와 직접 연결**: 현재 배우는 기술이 업계에서 어떻게 쓰이는지
2. **비전공자 눈높이**: 어려운 용어는 반드시 쉬운 설명 추가
3. **동기부여**: "내가 배우는 것이 이렇게 쓰인다"는 느낌을 줄 것
4. **최신성**: 2024~2025년 기준 트렌드 위주

## 마크다운 포맷

### 오늘의 AI 트렌드 브리핑

#### 지금 배우는 기술, 업계에서는 이렇게 씁니다
- 현재 학습 주제가 실제 산업에서 어떻게 활용되는지 2~3가지 사례

#### 알아두면 좋은 최신 동향
- 관련 분야의 주목할 만한 트렌드 2~3개
- 각각 왜 중요한지 한 줄 설명

#### 비전공자가 알면 경쟁력이 되는 포인트
- 이 기술을 알면 어디에 쓸 수 있는지 구체적 직무/역할 연결
- "이 기술 + ○○ 도메인 = 이런 커리어/비즈니스 가능" 형태

#### 추천 키워드
- 더 알아보면 좋을 검색 키워드 3~5개 (영어+한국어)

한국어로 작성하세요.`,
      },
      {
        role: "user",
        content: `현재 학습 상황:
- 모듈: ${currentModule?.name || "AI/ML 학습"}
- 오늘 주제: ${today?.topic || "일반 AI 학습"}
- Day: ${today?.dayNumber || "?"}
- 모듈 설명: ${currentModule?.description || ""}
- 최근 학습 용어: ${termsContext || "없음"}

이 학습자를 위한 AI 트렌드 브리핑을 작성해주세요.`,
      },
    ],
  });

  const briefing = completion.choices[0].message.content ?? "";
  return NextResponse.json({
    briefing,
    topic: today?.topic || "AI/ML",
    module: currentModule?.name || "",
    dayNumber: today?.dayNumber || null,
  });
}

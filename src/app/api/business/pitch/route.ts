import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await request.json();
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const { data: idea } = await supabase
    .from("business_ideas")
    .select("title, canvas")
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .single();

  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  // Get related insights
  const { data: insights } = await supabase
    .from("business_insights")
    .select("skill_learned, insight")
    .eq("idea_id", ideaId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ pitch: "API 키가 설정되지 않았습니다." });
  }

  const canvas = idea.canvas || {};
  const insightsSummary = (insights || []).map((i) => `- ${i.skill_learned}: ${i.insight}`).join("\n");

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.businessChat,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `당신은 스타트업 피치 전문가입니다. 비즈니스 캔버스 정보를 바탕으로 피치덱 초안을 작성해주세요.

## 피치덱 구조 (마크다운 형식)
각 슬라이드를 ### 제목으로 구분하세요.

### 슬라이드 1: 한 줄 소개
### 슬라이드 2: 문제 정의
### 슬라이드 3: 솔루션
### 슬라이드 4: 핵심 기술 & AI 활용
### 슬라이드 5: 타겟 시장
### 슬라이드 6: 비즈니스 모델 (수익)
### 슬라이드 7: 경쟁 우위
### 슬라이드 8: MVP & 로드맵
### 슬라이드 9: 팀 (학습 중인 기술 기반)
### 슬라이드 10: Ask (필요한 것)

각 슬라이드는 2~4줄로 핵심만 작성하세요. 한국어로 답변하세요.
비어있는 캔버스 항목은 "[작성 필요]"로 표시하세요.`,
      },
      {
        role: "user",
        content: `비즈니스: ${idea.title}

캔버스:
- 해결 문제: ${canvas.problem || "미작성"}
- 타겟 고객: ${canvas.target || "미작성"}
- 솔루션: ${canvas.solution || "미작성"}
- 기술 스택: ${canvas.tech_stack || "미작성"}
- 필요 데이터: ${canvas.data || "미작성"}
- 수익 모델: ${canvas.revenue || "미작성"}
- 경쟁 우위: ${canvas.advantage || "미작성"}
- MVP 범위: ${canvas.mvp || "미작성"}

학습 연결 인사이트:
${insightsSummary || "없음"}

이 정보를 바탕으로 10장 피치덱 초안을 작성해주세요.`,
      },
    ],
  });

  const pitch = completion.choices[0].message.content ?? "";
  return NextResponse.json({ pitch });
}

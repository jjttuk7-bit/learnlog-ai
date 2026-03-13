import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurriculumByDay } from "@/lib/curriculum";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .select("id, title, content, ai_comment, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요" }, { status: 400 });
    }

    // AI 고도화 코멘트 생성
    let aiComment: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();

        // 오늘의 캡처와 용어 데이터 수집
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [capturesRes, glossaryRes] = await Promise.all([
          supabase
            .from("captures")
            .select("content, ai_category, ai_tags")
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .gte("created_at", todayStart.toISOString())
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("glossary_terms")
            .select("term, module")
            .eq("user_id", user.id)
            .gte("created_at", todayStart.toISOString()),
        ]);

        const todayCaptures = capturesRes.data || [];
        const todayTerms = glossaryRes.data || [];

        // 커리큘럼 컨텍스트
        const today = getTodayCurriculum();
        const tomorrow = today ? getCurriculumByDay(today.dayNumber + 1) : null;

        const capturesSummary = todayCaptures.length > 0
          ? todayCaptures.map((c) => `[${c.ai_category}] ${c.content.slice(0, 80)}`).join("\n")
          : "오늘 캡처 없음";

        const termsSummary = todayTerms.length > 0
          ? todayTerms.map((t) => t.term).join(", ")
          : "오늘 학습한 용어 없음";

        const completion = await openai.chat.completions.create({
          model: AI_MODELS.diaryComment,
          max_tokens: 800,
          messages: [
            {
              role: "system",
              content: `당신은 AI/ML 부트캠프 학습자를 위한 전문 학습 멘토입니다.
학습자는 **비전공자**입니다. 일기뿐 아니라 오늘 하루의 전체 학습 활동을 종합 분석하여 깊이 있는 피드백을 제공합니다.

## 분석 포맷 (마크다운)

### 오늘의 핵심 키워드
- 일기와 캡처에서 추출한 핵심 학습 키워드 3~5개를 **볼드**로 나열

### 학습 깊이 분석
- 일기 내용에서 학습자가 얼마나 깊이 이해하고 있는지 평가
- 표면적 이해 vs 구조적 이해 vs 응용 수준 중 어디인지 진단
- 구체적 근거를 들어 설명

### 놓치고 있는 포인트
- 일기에서 언급하지 않았지만 오늘 학습에서 중요했을 개념 1~2개
- 왜 중요한지 비전공자 눈높이에서 설명

### 내일 학습과의 연결
- 내일 배울 내용과 오늘 학습의 연결고리
- "내일 ○○를 배울 때, 오늘 이해한 ○○가 기초가 됩니다" 형태

### 멘토의 한마디
- 따뜻하면서도 날카로운 피드백 2~3문장
- 구체적 액션 아이템 하나 제안

한국어로 작성하세요.`,
            },
            {
              role: "user",
              content: `## 학습 일기
제목: ${title}

${content}

## 오늘의 학습 컨텍스트
- 커리큘럼: ${today ? `Day ${today.dayNumber} · ${today.module} · ${today.topic}` : "정보 없음"}
- 내일 주제: ${tomorrow ? `${tomorrow.topic}` : "정보 없음"}

## 오늘의 캡처 기록
${capturesSummary}

## 오늘 학습한 용어
${termsSummary}`,
            },
          ],
        });
        aiComment = completion.choices[0].message.content ?? null;
      } catch {
        // AI 실패해도 일기는 저장
      }
    }

    const { data, error } = await supabase
      .from("diary_entries")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        ai_comment: aiComment,
      })
      .select("id, title, content, ai_comment, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create diary entry" }, { status: 500 });
  }
}

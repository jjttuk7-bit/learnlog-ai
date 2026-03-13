import { NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get this week's date range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString();

  const weekNum = getCurrentWeekNumber();

  // Fetch this week's data in parallel
  const [capturesRes, glossaryRes, diaryRes] = await Promise.all([
    supabase
      .from("captures")
      .select("content, ai_category, ai_tags, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("created_at", weekStart)
      .order("created_at", { ascending: false }),
    supabase
      .from("glossary_terms")
      .select("term, module")
      .eq("user_id", user.id)
      .gte("created_at", weekStart),
    supabase
      .from("diary_entries")
      .select("title, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("created_at", weekStart),
  ]);

  const captures = capturesRes.data || [];
  const glossaryTerms = glossaryRes.data || [];
  const diaryEntries = diaryRes.data || [];

  // Category breakdown
  const categories: Record<string, number> = {};
  for (const c of captures) {
    const cat = c.ai_category || "concept";
    categories[cat] = (categories[cat] || 0) + 1;
  }

  // Active days
  const activeDays = new Set(captures.map((c) => new Date(c.created_at).toISOString().slice(0, 10))).size;

  // Tags frequency
  const tagFreq: Record<string, number> = {};
  for (const c of captures) {
    for (const tag of (c.ai_tags || [])) {
      tagFreq[tag] = (tagFreq[tag] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      week_number: weekNum,
      summary: `이번 주 캡처 ${captures.length}건, 용어 ${glossaryTerms.length}건, 일기 ${diaryEntries.length}건`,
      achievements: captures.length > 0 ? [`${captures.length}건의 학습 캡처 완료`] : ["아직 이번 주 활동이 없습니다"],
      improvements: ["더 꾸준한 일일 학습 기록을 목표로 하세요"],
      next_week_goals: ["매일 최소 1건 캡처하기"],
      score: Math.min(100, Math.round((captures.length / 10) * 50 + activeDays * 10)),
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.weeklyReport,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `당신은 AI 학습 코치입니다. 학습자의 실제 주간 활동 데이터를 분석하여 주간 리포트를 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "한 줄 요약",
  "achievements": ["성과1", "성과2", "성과3"],
  "improvements": ["개선점1", "개선점2"],
  "next_week_goals": ["목표1", "목표2", "목표3"],
  "score": 75
}

score 기준 (0~100): 캡처 수, 다양성(카테고리), 꾸준함(활동일), 용어 학습, 일기 작성 등 종합 평가.
데이터가 없거나 적으면 솔직하게 반영하세요.`,
        },
        {
          role: "user",
          content: `${weekNum}주차 학습 데이터:
- 총 캡처: ${captures.length}건
- 카테고리별: ${JSON.stringify(categories)}
- 활동 일수: ${activeDays}일 / 7일
- 주요 태그: ${topTags.join(", ") || "없음"}
- 용어 학습: ${glossaryTerms.length}건 (${glossaryTerms.map((t) => t.term).join(", ") || "없음"})
- 학습 일기: ${diaryEntries.length}건
- 캡처 내용 요약: ${captures.slice(0, 5).map((c) => c.content.slice(0, 50)).join(" / ") || "없음"}

이 실제 데이터를 기반으로 주간 리포트를 작성해주세요.`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      week_number: weekNum,
      summary: parsed.summary || "",
      achievements: parsed.achievements || [],
      improvements: parsed.improvements || [],
      next_week_goals: parsed.next_week_goals || [],
      score: parsed.score || 50,
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

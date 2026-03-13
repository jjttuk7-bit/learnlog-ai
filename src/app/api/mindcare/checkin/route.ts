import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("mindcare_checkins")
      .select("id, mood_level, ai_message, created_at")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ checkin: data ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch checkin" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mood_level } = await request.json();
    if (typeof mood_level !== "number" || mood_level < 1 || mood_level > 5) {
      return NextResponse.json({ error: "mood_level must be 1-5" }, { status: 400 });
    }

    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();
    const todayStr = new Date().toISOString().slice(0, 10);

    const [captureRes, streakRes] = await Promise.all([
      supabase
        .from("captures")
        .select("content")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .gte("created_at", `${todayStr}T00:00:00`)
        .limit(5),
      supabase
        .from("confidence_records")
        .select("streak_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const captureCount = captureRes.data?.length ?? 0;
    const streak = streakRes.data?.streak_count ?? 0;

    const moodLabels: Record<number, string> = {
      1: "매우 힘든 상태",
      2: "좀 힘든 상태",
      3: "보통 상태",
      4: "좋은 상태",
      5: "최고 상태",
    };

    let aiMessage = "오늘도 함께해요! 당신은 이미 충분히 잘하고 있어요.";
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: AI_MODELS.mindcareCheckin,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: `당신은 비전공자 AI/ML 학습자의 따뜻한 멘탈 케어 멘토입니다.
학습자의 오늘 마음 상태를 보고 맞춤형 격려 메시지를 작성합니다.

## 원칙
- 감정을 먼저 인정하고 공감
- 학습 진도와 연결된 구체적 격려 (추상적 응원 X)
- 짧고 따뜻하게 (3-4문장)
- 힘들 때: 위로 + "지금까지 온 길" 상기
- 좋을 때: 응원 + 오늘 할 수 있는 구체적 제안
- 한국어, 반말(친근한 선배 톤)`,
            },
            {
              role: "user",
              content: `마음 상태: ${moodLabels[mood_level]}
학습 진도: Day ${today?.dayNumber ?? "?"}/${119} (${today ? Math.round((today.dayNumber / 119) * 100) : "?"}% 완료)
현재 모듈: ${currentModule?.name ?? "알 수 없음"}
오늘 주제: ${today?.topic ?? "알 수 없음"}
연속 학습: ${streak}일
오늘 캡처: ${captureCount}개`,
            },
          ],
        });
        aiMessage = completion.choices[0].message.content ?? aiMessage;
      } catch {
        // AI 실패해도 기본 메시지 사용
      }
    }

    const { data, error } = await supabase
      .from("mindcare_checkins")
      .insert({
        user_id: user.id,
        mood_level,
        ai_message: aiMessage,
      })
      .select("id, mood_level, ai_message, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ checkin: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create checkin" }, { status: 500 });
  }
}

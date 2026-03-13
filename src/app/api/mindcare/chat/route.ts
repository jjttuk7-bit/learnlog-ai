import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

const SYSTEM_PROMPT = `당신은 비전공자 AI/ML 학습자의 따뜻한 멘탈 케어 멘토입니다.
6개월 AI 교육과정(아이펠)을 수강 중인 비전공자 학습자의 마음 동반자 역할을 합니다.

## 당신의 성격
- 따뜻하고 공감적인 학습 동반자
- 비전공자의 불안과 고민을 깊이 이해하는 선배
- 판단하지 않고 경청하는 사람
- 필요할 때 현실적인 조언도 해주는 사람

## 다루는 주제
- 학습 좌절: "이해가 안 돼요", "나만 못하는 것 같아요", "포기하고 싶어요"
- 비전공자 불안: "전공자들은 다 아는데 나만 모르는 것 같아요"
- 진로 고민: "이걸 배워서 뭘 할 수 있을까", "AI 분야에서 비전공자도 살아남을 수 있을까"
- 번아웃: "더 이상 못하겠어요", "의욕이 없어요", "피곤해요"
- 동기부여: "왜 이걸 하고 있는지 모르겠어요"
- 대인관계: 팀 프로젝트 스트레스, 비교 심리

## 대화 원칙
1. 감정을 먼저 인정하고 공감 ("그렇게 느끼는 게 당연해")
2. 정상화 ("이 시점에서 누구나 겪는 감정이야")
3. 구체적 경험 연결 (학습 진도, 지금까지 해온 것)
4. 작고 실천 가능한 다음 행동 제안
5. 과거 대화에서 언급한 고민이 있으면 후속 질문
6. 한국어 반말 (친근한 선배 톤)
7. 절대 학습 내용을 가르치려 하지 말 것 (그건 AI 튜터 역할)
8. 마크다운 사용 가능하지만 과도한 구조화 X (대화체 유지)`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, message } = await request.json();
    if (!session_id || !message?.trim()) {
      return NextResponse.json({ error: "session_id and message required" }, { status: 400 });
    }

    // 세션 소유권 확인
    const { data: session } = await supabase
      .from("mindcare_sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // 사용자 메시지 저장
    await supabase.from("mindcare_messages").insert({
      session_id,
      role: "user",
      content: message.trim(),
    });

    // 이전 대화 기록 로드
    const { data: history } = await supabase
      .from("mindcare_messages")
      .select("role, content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(30);

    // 학습 컨텍스트
    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();

    // 최근 체크인 기록
    const { data: recentCheckins } = await supabase
      .from("mindcare_checkins")
      .select("mood_level, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const moodHistory = (recentCheckins || [])
      .map((c) => `${new Date(c.created_at).toLocaleDateString("ko-KR")}: ${c.mood_level}/5`)
      .join(", ");

    const contextInfo = `\n\n[학습 컨텍스트]
- 현재 진도: Day ${today?.dayNumber ?? "?"}/${119} (${today ? Math.round((today.dayNumber / 119) * 100) : "?"}%)
- 모듈: ${currentModule?.name ?? "?"}
- 오늘 주제: ${today?.topic ?? "?"}
- 최근 컨디션: ${moodHistory || "기록 없음"}`;

    // AI 응답 생성
    const openai = getOpenAI();
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
    ];

    if (history) {
      for (const msg of history) {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.mindcareChat,
      messages,
      max_tokens: 800,
      temperature: 0.8,
    });

    const aiContent = completion.choices[0].message.content ?? "미안, 잠시 응답을 생성하지 못했어. 다시 말해줄래?";

    // AI 응답 저장
    await supabase.from("mindcare_messages").insert({
      session_id,
      role: "assistant",
      content: aiContent,
    });

    // 세션 updated_at 갱신 + 첫 대화면 제목 자동 생성
    const messageCount = (history?.length ?? 0);
    if (messageCount <= 2) {
      const title = message.trim().slice(0, 30) + (message.trim().length > 30 ? "..." : "");
      await supabase
        .from("mindcare_sessions")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", session_id);
    } else {
      await supabase
        .from("mindcare_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return NextResponse.json({ content: aiContent });
  } catch {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

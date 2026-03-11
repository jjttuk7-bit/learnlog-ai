import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

const defaultWins = [
  {
    title: "오늘도 기록했다",
    description: "학습을 기록하는 것 자체가 메타인지의 시작입니다",
    evidence: "LearnLog AI 접속",
  },
  {
    title: "꾸준함이 실력",
    description: "매일 조금씩 쌓이는 기록이 6개월 후 포트폴리오가 됩니다",
    evidence: "일일 학습 기록",
  },
  {
    title: "성장 중",
    description: "어제보다 한 걸음 더 나아갔습니다",
    evidence: "학습 진행",
  },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ wins: defaultWins });
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from("confidence_records")
      .select("id, win_cards")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .not("win_cards", "eq", "[]")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.win_cards?.length) {
      return Response.json({ wins: data.win_cards, from_cache: true, record_id: data.id });
    }

    return Response.json({ wins: null });
  } catch {
    return Response.json({ wins: null });
  }
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { captures, coachingMessages, module, topic } = await request.json();

  let wins = defaultWins;

  if (
    process.env.OPENAI_API_KEY &&
    (captures?.length || coachingMessages?.length)
  ) {
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODELS.winCards,
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
        if (parsed.wins?.length) wins = parsed.wins;
      }
    } catch {
      // fall through to default wins
    }
  }

  // Persist to Supabase
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const today = new Date().toISOString().slice(0, 10);

      // Check if a record exists today to upsert into
      const { data: existing } = await supabase
        .from("confidence_records")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("confidence_records")
          .update({ win_cards: wins })
          .eq("id", existing.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("confidence_records").insert({
          user_id: user.id,
          win_cards: wins,
          streak_count: 0,
        });
      }
    }
  } catch {
    // Persistence failure is non-fatal
  }

  return Response.json({ wins });
}

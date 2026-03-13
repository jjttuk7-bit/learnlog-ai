import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

const hintInstructions: Record<number, string> = {
  1: "개념의 방향만 제시하세요. 어떤 개념을 살펴봐야 하는지만 알려주세요. 정답을 주지 마세요.",
  2: "접근 방법을 제시하세요. 문제를 어떤 단계로 나눠서 생각해야 하는지 안내하세요.",
  3: "유사한 문제의 코드 예시를 제공하세요. 퀘스트의 직접 정답이 아닌 비슷한 패턴의 예시 코드를 보여주세요.",
};

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { questTitle, questId, stuckPoint, hintLevel, module } = await request.json();
  const level = Math.min(Math.max(hintLevel || 1, 1), 3);

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content: `힌트 Level ${level}: API 키를 설정하면 AI 힌트를 받을 수 있습니다.`,
        level,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const completion = await openai.chat.completions.create({
    model: level <= 2 ? AI_MODELS.questHintBasic : AI_MODELS.questHintAdvanced,
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content: `당신은 학습 힌트 제공자입니다.
[핵심 철학] 정답을 주지 말고 스스로 도달하게 안내합니다.
${hintInstructions[level]}
한국어로 답변하세요.`,
      },
      {
        role: "user",
        content: `퀘스트: ${questTitle}\n모듈: ${module}\n막힌 지점: ${stuckPoint}\n\nLevel ${level} 힌트를 주세요.`,
      },
    ],
  });

  const text = completion.choices[0].message.content ?? "";

  // 힌트 사용 기록 저장
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const qId = questId || questTitle;
      const { data: existing } = await supabase
        .from("quest_logs")
        .select("id, hints_used, hint_log")
        .eq("user_id", user.id)
        .eq("quest_id", qId)
        .limit(1)
        .single();

      const hintEntry = { level, stuckPoint, timestamp: new Date().toISOString() };

      if (existing) {
        const currentLog = Array.isArray(existing.hint_log) ? existing.hint_log : [];
        await supabase
          .from("quest_logs")
          .update({
            hints_used: (existing.hints_used || 0) + 1,
            hint_log: [...currentLog, hintEntry],
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("quest_logs").insert({
          user_id: user.id,
          quest_id: qId,
          status: "in_progress",
          hints_used: 1,
          hint_log: [hintEntry],
        });
      }
    }
  } catch {
    // 기록 실패해도 힌트 응답은 정상 반환
  }

  return new Response(JSON.stringify({ content: text, level }), {
    headers: { "Content-Type": "application/json" },
  });
}

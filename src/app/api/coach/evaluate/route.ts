import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { question, answer, module, topic, history } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        content:
          "좋은 답변이에요! (API 키 미설정 — 실제 평가를 받으려면 .env.local에 OPENAI_API_KEY를 추가하세요)",
        understanding_level: 3,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const systemPrompt = `당신은 LearnLog AI의 학습 평가 코치입니다.

## 역할
- 학습자의 답변을 평가하고, 후속 질문으로 더 깊은 사고를 유도합니다
- 대화를 이어가며 학습자의 이해를 점진적으로 끌어올립니다
- 한 번의 평가로 끝내지 말고, 새로운 관점의 질문을 던져주세요

## 평가 기준 (5점 척도)
1점: 개념 자체를 설명하지 못함
2점: 표면적 이해
3점: 기본 이해
4점: 응용 가능
5점: 전문가 수준

현재 모듈: ${module || "미정"}, 주제: ${topic || "미정"}

답변 형식 (JSON):
{"understanding_level": 1-5, "feedback": "피드백 내용", "follow_up": "반드시 후속 질문을 포함하세요. 학습자가 더 깊이 생각하도록 유도하는 질문이어야 합니다."}

잘한 점을 먼저 언급하세요. 점수 3 이하 시 실생활 예시 + 코드 예시 보충. 한국어로 답변하세요.
follow_up은 반드시 포함해야 합니다. 대화가 자연스럽게 이어지도록 질문을 던져주세요.`;

  // 이전 대화 히스토리를 포함하여 맥락 유지
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  // 이전 대화 기록이 있으면 추가
  if (history && Array.isArray(history)) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // 현재 답변 추가
  messages.push({
    role: "user",
    content: `질문: ${question}\n\n학습자의 답변: ${answer}\n\n위 답변을 평가하고, 후속 질문을 던져주세요. JSON 형식으로 응답해주세요.`,
  });

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.coachEvaluate,
    max_tokens: 1024,
    messages,
  });

  const text = completion.choices[0].message.content ?? "";

  // Try to parse JSON, fallback to text response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 약점 개념 추적: 이해도 3 이하면 저장, 4 이상이면 해결 처리
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && topic) {
          if (parsed.understanding_level <= 3) {
            const { data: existing } = await supabase
              .from("weakness_concepts")
              .select("id, fail_count")
              .eq("user_id", user.id)
              .eq("concept", topic)
              .eq("resolved", false)
              .limit(1)
              .single();

            if (existing) {
              await supabase
                .from("weakness_concepts")
                .update({ fail_count: existing.fail_count + 1, last_asked: new Date().toISOString() })
                .eq("id", existing.id);
            } else {
              await supabase.from("weakness_concepts").insert({
                user_id: user.id,
                concept: topic,
                module: module || "",
                topic: question || "",
              });
            }
          } else if (parsed.understanding_level >= 4) {
            await supabase
              .from("weakness_concepts")
              .update({ resolved: true })
              .eq("user_id", user.id)
              .eq("concept", topic)
              .eq("resolved", false);
          }
        }
      } catch {
        // 약점 추적 실패해도 평가 응답은 정상 반환
      }

      return new Response(
        JSON.stringify({
          content:
            parsed.feedback +
            (parsed.follow_up ? `\n\n💡 ${parsed.follow_up}` : ""),
          understanding_level: parsed.understanding_level,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
  } catch {
    // fallback below
  }

  return new Response(
    JSON.stringify({ content: text, understanding_level: 3 }),
    { headers: { "Content-Type": "application/json" } },
  );
}

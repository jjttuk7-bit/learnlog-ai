import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId, message, history } = await request.json();

  // Get idea + insights for context
  const { data: idea } = await supabase
    .from("business_ideas")
    .select("title, canvas")
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .single();

  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const { data: insights } = await supabase
    .from("business_insights")
    .select("skill_learned, insight")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ content: "API 키를 설정하면 AI 비즈니스 멘토와 대화할 수 있습니다." });
  }

  const insightContext = insights?.length
    ? `\n\n[학습-비즈니스 연결 인사이트]\n${insights.map((i) => `- ${i.skill_learned}: ${i.insight}`).join("\n")}`
    : "";

  const canvasContext = Object.keys(idea.canvas || {}).length > 0
    ? `\n\n[현재 캔버스]\n${JSON.stringify(idea.canvas, null, 2)}`
    : "";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `당신은 AI 비즈니스 멘토입니다. 학생의 비즈니스 아이디어를 함께 발전시켜주세요.

비즈니스 아이디어: "${idea.title}"${canvasContext}${insightContext}

## 역할
- 아이디어의 실현 가능성을 학생이 배운 기술 기반으로 평가
- 비즈니스 모델 캔버스 항목(문제, 타겟, 솔루션, 기술 스택, 데이터, 수익 모델, 경쟁 우위, MVP)을 대화 중 자연스럽게 제안
- 구체적이고 실행 가능한 조언 제공
- 한국어로 답변

## 캔버스 업데이트 제안
대화 중 캔버스 항목을 채울 수 있는 내용이 나오면, 응답 마지막에 아래 형식으로 제안하세요:
<!-- CANVAS_UPDATE: {"key": "problem", "value": "제안 내용"} -->

사용 가능한 키: problem, target, solution, tech_stack, data, revenue, advantage, mvp`,
    },
  ];

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content: message });

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.businessChat,
    messages,
    max_tokens: 1500,
    temperature: 0.7,
  });

  let content = completion.choices[0].message.content ?? "";

  // Parse canvas update suggestion
  let canvasUpdate: { key: string; value: string } | null = null;
  const canvasMatch = content.match(/<!-- CANVAS_UPDATE: ({.*?}) -->/);
  if (canvasMatch) {
    try {
      canvasUpdate = JSON.parse(canvasMatch[1]);
      content = content.replace(/\n*<!-- CANVAS_UPDATE:.*?-->\n*/g, "").trim();
    } catch { /* ignore parse error */ }
  }

  return NextResponse.json({ content, canvasUpdate });
}

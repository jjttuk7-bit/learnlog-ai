import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId, dayNumber, skillLearned, topic, module } = await request.json();

  if (!ideaId || !skillLearned) {
    return NextResponse.json({ error: "ideaId and skillLearned required" }, { status: 400 });
  }

  // Get the idea
  const { data: idea } = await supabase
    .from("business_ideas")
    .select("title, canvas")
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .single();

  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  if (!process.env.OPENAI_API_KEY) {
    const fallback = `${skillLearned} 기술은 "${idea.title}" 비즈니스에 활용될 수 있습니다.`;
    await supabase.from("business_insights").insert({
      idea_id: ideaId,
      user_id: user.id,
      day_number: dayNumber || null,
      skill_learned: skillLearned,
      insight: fallback,
    });
    return NextResponse.json({ insight: fallback });
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.businessInsight,
    max_tokens: 256,
    messages: [
      {
        role: "system",
        content: `당신은 AI 비즈니스 멘토입니다. 학생이 배운 기술이 비즈니스 아이디어에 어떻게 활용될 수 있는지 구체적으로 연결해주세요.
한 줄~두 줄로 간결하게, 구체적 활용 예시를 포함하세요. 한국어로 답변하세요.`,
      },
      {
        role: "user",
        content: `비즈니스 아이디어: ${idea.title}\n현재 캔버스: ${JSON.stringify(idea.canvas)}\n오늘 배운 기술: ${skillLearned}${topic ? ` (${topic})` : ""}${module ? ` [${module}]` : ""}\n\n이 기술이 이 비즈니스에 어떻게 활용될 수 있나요?`,
      },
    ],
  });

  const insightText = completion.choices[0].message.content ?? "";

  await supabase.from("business_insights").insert({
    idea_id: ideaId,
    user_id: user.id,
    day_number: dayNumber || null,
    skill_learned: skillLearned,
    insight: insightText,
  });

  return NextResponse.json({ insight: insightText });
}

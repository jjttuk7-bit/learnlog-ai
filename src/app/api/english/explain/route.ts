import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum } from "@/lib/curriculum";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { explanation, concept } = await request.json();

    const today = getTodayCurriculum();
    const topicToUse = concept || today?.topic || "machine learning";

    const openai = getOpenAI();

    if (!explanation) {
      // 개념 제시 모드: 설명할 개념을 알려줌
      const completion = await openai.chat.completions.create({
        model: AI_MODELS.englishExplain,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are an English coach for a Korean AI/ML student preparing for a joint program with American students.
Give them a concept to explain in English. Be encouraging and specific.
Respond in this format:

🎯 **Today's Challenge**
Explain **[concept]** in English as if you're talking to a teammate.

💡 **Hint**: Think about [helpful hint in Korean]

Keep it short and motivating.`,
          },
          {
            role: "user",
            content: `Today's study topic: ${topicToUse}`,
          },
        ],
      });

      return NextResponse.json({
        type: "challenge",
        content: completion.choices[0].message.content ?? "",
        concept: topicToUse,
      });
    }

    // 교정 모드: 학생의 영어 설명을 평가
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.englishExplain,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are an encouraging English coach for a Korean AI/ML student.
They tried to explain "${topicToUse}" in English. Evaluate and help them improve.

## Response format:

### ✅ 잘한 점
- What they got right (be specific and encouraging)

### 📝 교정
- Show corrections: ❌ "their text" → ✅ "better version"
- Explain why in Korean for clarity

### 🌟 모범 답안
- Provide a natural, clear explanation of the concept (2-3 sentences)
- This is what a native speaker might say in a casual team discussion

### 💪 한 줄 응원
- Short encouraging message in Korean

Keep it warm and constructive. They're brave for trying!`,
        },
        {
          role: "user",
          content: `Concept: ${topicToUse}\n\nStudent's explanation:\n${explanation}`,
        },
      ],
    });

    return NextResponse.json({
      type: "feedback",
      content: completion.choices[0].message.content ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}

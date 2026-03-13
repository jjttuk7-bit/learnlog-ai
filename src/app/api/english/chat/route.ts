import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

const SCENARIO_PROMPTS: Record<string, string> = {
  "first-meeting": "You're meeting this Korean student for the first time at the Jeju program orientation. Introduce yourself naturally and ask about their background.",
  "code-review": "You're pair-programming with this student. Ask about their code or discuss a coding approach together.",
  "lunch": "You're having lunch together at the cafeteria in Jeju. Make casual conversation about food, hobbies, or life in Korea.",
  "project-intro": "You're curious about the student's AI project. Ask them to explain what they're working on.",
  "team-discussion": "You're in a team meeting discussing how to approach a machine learning problem together.",
  "presentation": "The student is practicing their presentation. Listen and give encouraging feedback, ask follow-up questions.",
  "asking-help": "The student is asking you for help with something. Be friendly and helpful.",
  "free": "Have a natural, friendly conversation about anything.",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history, scenario, correctionMode } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();

    const scenarioPrompt = SCENARIO_PROMPTS[scenario] || SCENARIO_PROMPTS["free"];

    const correctionInstruction = correctionMode
      ? `\n\nAFTER your conversational response, add a correction section in this EXACT format:
---
📝 **Expression Check**
- If there are grammar errors, show: ❌ "their text" → ✅ "corrected text" + brief explanation in Korean
- If the expression is correct but could be more natural: 💡 "more natural way to say it"
- If perfect: ✅ 완벽한 표현이에요!
- Keep corrections concise (Korean explanations for clarity)`
      : "\n\nDo NOT correct their English. Just respond naturally. Only if their message is completely unintelligible, gently ask for clarification.";

    const openai = getOpenAI();
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `You are Alex, a friendly American college student (junior, studying CS at UC Berkeley) participating in a 3-week joint AI/ML program in Jeju Island, Korea.

## Your personality
- Friendly, casual, encouraging
- Genuinely interested in learning about Korea and Korean culture
- Patient with non-native English speakers
- Knowledgeable about AI/ML but explains things simply
- Uses casual American English (contractions, slang is OK but not too much)

## Current scenario
${scenarioPrompt}

## Context
- The Korean student is studying: ${currentModule?.name ?? "AI/ML"} (Day ${today?.dayNumber ?? "?"}/119)
- Today's topic: ${today?.topic ?? "general AI"}
- They haven't used English in a long time, so be patient and encouraging
- Keep your responses conversational and not too long (3-5 sentences usually)
- If they mix Korean and English, that's OK — respond in English but show you understand
${correctionInstruction}`,
      },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }
    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.englishChat,
      messages,
      max_tokens: 600,
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content ?? "Sorry, I couldn't generate a response. Could you try again?";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}

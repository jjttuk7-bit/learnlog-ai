import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();

    let message = "지금 힘든 건 당연해. 이 과정을 선택한 것 자체가 대단한 용기야. 잠깐 쉬어도 괜찮아, 네 페이스로 가면 돼.";

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: AI_MODELS.mindcareSos,
          max_tokens: 250,
          messages: [
            {
              role: "system",
              content: `당신은 비전공자 AI/ML 학습자의 긴급 멘탈 케어 멘토입니다.
학습자가 "지금 힘들어요" SOS 버튼을 눌렀습니다.

## 원칙
- 즉각적 위로와 공감 (판단하지 않기)
- "힘든 게 당연하다"는 정상화
- 지금까지의 여정 인정 (Day N까지 온 것)
- 구체적이고 작은 다음 행동 하나 제안 (큰 목표 X)
- 따뜻하고 진심 어린 톤, 한국어 반말
- 4-5문장으로 짧고 강렬하게`,
            },
            {
              role: "user",
              content: `SOS 요청. 현재 Day ${today?.dayNumber ?? "?"}/${119}, 모듈: ${currentModule?.name ?? "?"}, 주제: ${today?.topic ?? "?"}`,
            },
          ],
        });
        message = completion.choices[0].message.content ?? message;
      } catch {
        // fallback message
      }
    }

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Failed to generate SOS message" }, { status: 500 });
  }
}

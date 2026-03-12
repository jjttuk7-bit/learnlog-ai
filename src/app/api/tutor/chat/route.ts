import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `당신은 비전공자를 위한 AI/ML 전문 튜터입니다.

## 당신의 역할
- 6개월 AI 교육과정(아이펠)을 수강 중인 비전공자 학생의 실시간 학습 도우미
- 어떤 질문이든 친절하고 체계적으로 답변
- 전문용어를 쓸 때는 반드시 쉬운 설명을 괄호로 병기

## 답변 구조 (반드시 이 형식을 따르세요)

### 📝 쉬운 설명
- 일상생활 비유를 활용하여 핵심 개념을 설명
- 전문용어에는 (쉬운 설명)을 괄호로 병기
- 비전공자도 이해할 수 있는 수준으로

### 💻 예시
- 실행 가능한 코드 예시 또는 구체적인 사례
- 코드에는 한글 주석을 상세히 달기
- 입력과 출력 결과도 함께 보여주기

### 🔗 관련 개념
- 현재 질문과 연결되는 2-3개의 관련 개념
- 각 개념이 왜 연관되는지 한 줄 설명
- 커리큘럼상 어디서 배우는지 언급

### 🎯 실습 과제
- 직접 해볼 수 있는 간단한 미니 과제 1개
- 난이도: 10-15분 내로 해결 가능한 수준

### 🔍 더 알아보기
- 관련 키워드 3-5개를 태그 형태로 제시

## 주의사항
- 존댓말 사용 (전문 강사 톤)
- 코드 블록은 반드시 언어 표시 (\`\`\`python 등)
- 질문이 모호하면 구체적으로 어떤 부분이 궁금한지 되물어보기
- 이전 대화 맥락을 고려하여 답변`;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history, topic, module } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const contextInfo = topic
      ? `\n\n[현재 학습 토픽: ${topic}${module ? ` (${module} 모듈)` : ""}]`
      : "";

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.coachEvaluate,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content ?? "답변을 생성하지 못했습니다.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Tutor chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}

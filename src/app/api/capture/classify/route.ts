import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const { content, module, topic } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // If no API key, return default classification
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ category: "concept", tags: [] });
    }

    const prompt = `당신은 AI 엔지니어링 학습 기록 분류기입니다.

현재 학습 모듈: ${module || "미정"}
오늘의 주제: ${topic || "미정"}

사용자가 입력한 학습 기록을 다음 4가지 카테고리 중 하나로 분류하세요:
- concept: 개념 설명, 이론, 정의
- code: 코드 스니펫, 구현 관련
- question: 의문점, 질문, 이해 안 되는 부분
- insight: 발견, 깨달음, 연결된 아이디어

또한 관련 키워드 태그를 3~5개 추출하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{"category": "concept|code|question|insight", "tags": ["태그1", "태그2"]}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.captureClassify,
      max_tokens: 200,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `다음 학습 기록을 분류해주세요:\n\n${content}` },
      ],
    });

    const text = completion.choices[0].message.content ?? "";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      category: parsed.category,
      tags: parsed.tags,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json({ category: "concept", tags: [] });
  }
}

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
      return NextResponse.json({ category: "concept", tags: [], coaching: null, suggestedTerms: [] });
    }

    const classifyPrompt = `당신은 AI 엔지니어링 학습 기록 분류기입니다.

현재 학습 모듈: ${module || "미정"}
오늘의 주제: ${topic || "미정"}

사용자가 입력한 학습 기록을 다음 4가지 카테고리 중 하나로 분류하세요:
- concept: 개념 설명, 이론, 정의
- code: 코드 스니펫, 구현 관련
- question: 의문점, 질문, 이해 안 되는 부분
- insight: 발견, 깨달음, 연결된 아이디어

또한 관련 키워드 태그를 3~5개 추출하세요.

추가로, 학습 기록에서 비전공자가 용어 사전에 추가하면 좋을 핵심 AI/ML/프로그래밍 전문 용어를 0~3개 추출하세요.
- 일반적인 한국어 단어는 제외하고, 기술 전문 용어만 추출
- 영어 용어는 영어 그대로, 한국어 용어는 한국어 그대로
- 예: "Transformer", "역전파", "CNN", "학습률", "과적합"

반드시 아래 JSON 형식으로만 응답하세요:
{"category": "concept|code|question|insight", "tags": ["태그1", "태그2"], "suggestedTerms": ["용어1"]}`;

    const coachingPrompt = `당신은 메타인지 학습 코치입니다. 학습자가 기록한 내용을 보고 짧은 코칭 피드백을 제공합니다.

현재 학습 모듈: ${module || "미정"}
오늘의 주제: ${topic || "미정"}

## 코칭 원칙
1. 학습자의 이해도를 칭찬하되 구체적 근거를 들어주세요
2. 더 깊이 생각해볼 포인트 1가지를 제시하세요
3. 관련된 실무 적용 팁이나 연결 개념을 1가지 알려주세요

## 형식
- 3~4문장으로 간결하게 작성
- 한국어로 답변
- 이모지 사용 가능`;

    // 분류와 코칭을 병렬로 요청
    const [classifyResult, coachingResult] = await Promise.all([
      openai.chat.completions.create({
        model: AI_MODELS.captureClassify,
        max_tokens: 200,
        messages: [
          { role: "system", content: classifyPrompt },
          { role: "user", content: `다음 학습 기록을 분류해주세요:\n\n${content}` },
        ],
      }),
      openai.chat.completions.create({
        model: AI_MODELS.captureClassify,
        max_tokens: 300,
        messages: [
          { role: "system", content: coachingPrompt },
          { role: "user", content: `학습자의 기록:\n\n${content}` },
        ],
      }),
    ]);

    const classifyText = classifyResult.choices[0].message.content ?? "";
    const parsed = JSON.parse(classifyText);
    const coaching = coachingResult.choices[0].message.content ?? "";

    return NextResponse.json({
      category: parsed.category,
      tags: parsed.tags,
      coaching: coaching || null,
      suggestedTerms: parsed.suggestedTerms ?? [],
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json({ category: "concept", tags: [], coaching: null, suggestedTerms: [] });
  }
}

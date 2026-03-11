import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { user_id, modules_data } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "API 키가 설정되지 않았습니다. .env.local에 OPENAI_API_KEY를 추가해주세요.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!modules_data || modules_data.length === 0) {
    return new Response(
      JSON.stringify({ error: "모듈 데이터가 없습니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const moduleSummaries = await Promise.all(
    modules_data.map(async (mod: { name: string; period: string; captures: string[]; quests: string[]; coaching_notes: string[] }) => {
      const completion = await openai.chat.completions.create({
        model: AI_MODELS.portfolioSummary,
        max_tokens: 512,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `당신은 학습 포트폴리오 작성 전문가입니다. 주어진 학습 데이터를 분석하여 모듈별 핵심 요약을 JSON으로 반환합니다.
한국어로 작성하세요.`,
          },
          {
            role: "user",
            content: `모듈명: ${mod.name}
학습 기간: ${mod.period}
캡처된 학습 내용: ${mod.captures?.join(", ") || "없음"}
완료한 퀘스트: ${mod.quests?.join(", ") || "없음"}
코칭 노트: ${mod.coaching_notes?.join(", ") || "없음"}

다음 JSON 형식으로 반환해주세요:
{
  "key_concepts": ["핵심 개념 3~5개"],
  "achievements": ["주요 성취 2~3개"],
  "growth_score": 1~10 사이 숫자,
  "summary": "2~3문장 요약"
}`,
          },
        ],
      });

      const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
      return { module_name: mod.name, period: mod.period, ...parsed };
    })
  );

  const portfolioCompletion = await openai.chat.completions.create({
    model: AI_MODELS.portfolioGenerate,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `당신은 학습 포트폴리오 스토리텔러입니다. 학습자의 6개월 성장 스토리를 포트폴리오로 작성합니다.
단순한 이력서가 아닌, 학습 과정과 성장의 증거를 담은 스토리를 만드세요.
한국어로 작성하세요.`,
      },
      {
        role: "user",
        content: `학습자 ID: ${user_id}
모듈별 요약: ${JSON.stringify(moduleSummaries, null, 2)}

다음 JSON 형식으로 전체 포트폴리오를 작성해주세요:
{
  "title": "포트폴리오 제목",
  "intro": "학습 여정 소개 (3~4문장, 성장 스토리 중심)",
  "tagline": "한 줄 요약",
  "projects": [
    {
      "name": "프로젝트명",
      "description": "설명",
      "skills": ["사용 기술"],
      "outcome": "결과"
    }
  ],
  "growth_story": "성장 스토리 (5~6문장, 시작-중간-현재 구조)",
  "conclusion": "마무리 메시지 (2~3문장, 앞으로의 방향)",
  "total_growth_score": 1~10 사이 숫자
}`,
      },
    ],
  });

  const portfolioData = JSON.parse(portfolioCompletion.choices[0].message.content ?? "{}");

  return new Response(
    JSON.stringify({
      portfolio: portfolioData,
      modules: moduleSummaries,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

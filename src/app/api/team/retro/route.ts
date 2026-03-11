import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { team_id, members_data } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "API 키가 설정되지 않았습니다. .env.local에 OPENAI_API_KEY를 추가해주세요.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!members_data || members_data.length === 0) {
    return new Response(
      JSON.stringify({ error: "팀 멤버 데이터가 없습니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.teamRetro,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `당신은 AIFFELthon 팀 회고 퍼실리테이터입니다. 팀원들의 학습 데이터를 분석하여 팀 전체를 위한 회고 질문과 토론 주제를 생성합니다.
회고는 Keep-Problem-Try(KPT) 방식과 팀 협업 개선에 초점을 맞춥니다.
한국어로 작성하세요.`,
      },
      {
        role: "user",
        content: `팀 ID: ${team_id}
팀원 데이터:
${JSON.stringify(members_data, null, 2)}

다음 JSON 형식으로 팀 회고 세션을 작성해주세요:
{
  "summary": "팀 전체 학습 현황 요약 (3~4문장)",
  "keep_questions": ["잘 되고 있는 점 관련 질문 3개"],
  "problem_questions": ["개선이 필요한 점 관련 질문 3개"],
  "try_questions": ["다음에 시도할 것 관련 질문 3개"],
  "collaboration_prompts": ["팀 협업 강화를 위한 토론 주제 2개"],
  "individual_highlights": [
    {
      "member_name": "멤버 이름",
      "highlight": "이 멤버가 팀에 기여한 학습 성과 한 줄",
      "suggestion": "이 멤버를 위한 격려 또는 제안"
    }
  ],
  "team_challenge": "다음 스프린트를 위한 팀 챌린지 제안"
}`,
      },
    ],
  });

  const retroData = JSON.parse(completion.choices[0].message.content ?? "{}");

  return new Response(
    JSON.stringify({ retro: retroData }),
    { headers: { "Content-Type": "application/json" } }
  );
}

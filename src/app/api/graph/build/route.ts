import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_MODELS } from "@/lib/ai/models";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { concepts, curriculum_day } = await request.json();

    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
      return NextResponse.json({ error: "concepts array required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildFallback(concepts, curriculum_day));
    }

    const prompt = `당신은 AI/ML 학습 개념 간의 관계를 분석하는 전문가입니다.

주어진 개념 목록을 분석하여 지식 그래프의 노드와 엣지를 생성하세요.

규칙:
- 각 노드는 개념 하나를 나타냅니다
- studyAmount: 개념의 중요도/학습량 (1~10 정수)
- 엣지는 두 개념 간의 관계를 나타냅니다
- weight: 관계 강도 (1~10 정수, 높을수록 강한 관계)
- relationLabel: 관계를 한 단어로 설명 (예: "기반", "포함", "발전", "응용")
- curriculum_day: ${curriculum_day || 1} (해당 노드가 등장한 날짜)

다음 JSON 형식으로만 응답하세요:
{
  "nodes": [
    { "id": "개념ID", "label": "개념명", "studyAmount": 5, "day": 1 }
  ],
  "edges": [
    { "source": "소스ID", "target": "타겟ID", "weight": 7, "relationLabel": "기반" }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.graphBuild,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `다음 개념들의 관계를 분석해주세요 (학습 ${curriculum_day || 1}일차):\n\n${concepts.join(", ")}`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      nodes: parsed.nodes ?? [],
      edges: parsed.edges ?? [],
    });
  } catch (error) {
    console.error("Graph build error:", error);
    return NextResponse.json({ error: "Failed to build graph" }, { status: 500 });
  }
}

function buildFallback(concepts: string[], day: number) {
  const nodes = concepts.map((c, i) => ({
    id: `node-${i}`,
    label: c,
    studyAmount: Math.floor(Math.random() * 5) + 3,
    day: day || 1,
  }));
  const edges = nodes.slice(1).map((n, i) => ({
    source: nodes[i].id,
    target: n.id,
    weight: Math.floor(Math.random() * 5) + 4,
    relationLabel: "연관",
  }));
  return { nodes, edges };
}

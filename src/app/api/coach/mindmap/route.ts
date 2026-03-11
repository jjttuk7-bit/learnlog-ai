import { NextRequest } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { topic, nodes, edges, curriculum_day } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      analysis: "API 키를 설정하면 AI 마인드맵 분석을 받을 수 있습니다.",
      suggestedNodes: [],
      suggestedEdges: [],
      issues: [],
    });
  }

  const nodeList = nodes
    .map((n: { id: string; data: { label: string; category?: string } }) =>
      `- [${n.id}] "${n.data.label}" (${n.data.category ?? "sub"})`
    )
    .join("\n");

  const edgeList = edges
    .map((e: { source: string; target: string; label?: string }) =>
      `- ${e.source} → ${e.target}${e.label ? ` (${e.label})` : ""}`
    )
    .join("\n");

  const analysisPrompt = `당신은 학습 마인드맵 분석 전문가입니다. 학습자가 만든 마인드맵을 분석하고 피드백을 제공하세요.

주제: ${topic}
${curriculum_day ? `커리큘럼 일차: ${curriculum_day}` : ""}

노드 목록:
${nodeList || "(없음)"}

연결 목록:
${edgeList || "(없음)"}

다음 JSON 형식으로만 응답하세요:
{
  "analysis": "전체적인 마인드맵 분석 (2-3문장)",
  "issues": [
    { "type": "incorrect_connection" | "missing_link" | "unclear_concept", "description": "문제 설명" }
  ],
  "suggestions": ["추가 브랜치 제안 1", "추가 브랜치 제안 2"],
  "score": 0-100
}`;

  const generatePrompt = `당신은 학습 전문가입니다. 주어진 주제에 대한 이상적인 마인드맵 구조를 생성하세요.

주제: ${topic}
${curriculum_day ? `커리큘럼 일차: ${curriculum_day}` : ""}

다음 JSON 형식으로만 응답하세요:
{
  "nodes": [
    { "id": "root", "label": "${topic}", "category": "root", "x": 400, "y": 300 },
    { "id": "n1", "label": "핵심 개념 1", "category": "main", "x": 700, "y": 150 },
    { "id": "n2", "label": "핵심 개념 2", "category": "main", "x": 700, "y": 300 },
    { "id": "n3", "label": "핵심 개념 3", "category": "main", "x": 700, "y": 450 },
    { "id": "n1-1", "label": "세부 항목", "category": "sub", "x": 950, "y": 100 }
  ],
  "edges": [
    { "id": "e-root-n1", "source": "root", "target": "n1" },
    { "id": "e-root-n2", "source": "root", "target": "n2" },
    { "id": "e-root-n3", "source": "root", "target": "n3" },
    { "id": "e-n1-n1-1", "source": "n1", "target": "n1-1" }
  ]
}

실제 주제에 맞는 내용으로 8-15개 노드를 생성하세요.`;

  const [analysisRes, generateRes] = await Promise.all([
    openai.chat.completions.create({
      model: AI_MODELS.mindmapAnalyze,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: analysisPrompt }],
    }),
    openai.chat.completions.create({
      model: AI_MODELS.mindmapGenerate,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: generatePrompt }],
    }),
  ]);

  const analysis = JSON.parse(analysisRes.choices[0].message.content ?? "{}");
  const generated = JSON.parse(generateRes.choices[0].message.content ?? "{}");

  return Response.json({
    analysis: analysis.analysis ?? "",
    issues: analysis.issues ?? [],
    suggestions: analysis.suggestions ?? [],
    score: analysis.score ?? 0,
    suggestedNodes: generated.nodes ?? [],
    suggestedEdges: generated.edges ?? [],
  });
}

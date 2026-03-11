import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { MODULES } from "@/data/curriculum";

// Module color mapping for curriculum graph nodes
const MODULE_COLORS: Record<string, string> = {
  "아이펠 적응": "#6366f1",
  "파이썬 마스터": "#3b82f6",
  "데이터 처리·분석": "#06b6d4",
  "딥러닝 기초": "#10b981",
  "CV 기초": "#84cc16",
  "DLthon 1": "#f59e0b",
  "자연어처리 기초": "#f97316",
  "LLM 기초": "#ef4444",
  "LLM 활용": "#ec4899",
  "DLthon 2": "#f59e0b",
  "모델 배포 기초": "#8b5cf6",
  MLOps: "#14b8a6",
  "파이널 프로젝트": "#f43f5e",
};

// Key concepts per module for the curriculum graph
const MODULE_CONCEPTS: Record<string, string[]> = {
  "아이펠 적응": ["아이펠 시스템", "Computational Thinking", "학습 방법론"],
  "파이썬 마스터": ["Python 기초", "자료구조", "객체지향", "고급 문법"],
  "데이터 처리·분석": ["Pandas", "Numpy", "데이터 탐색", "데이터 시각화"],
  "딥러닝 기초": ["PyTorch", "퍼셉트론", "역전파", "최적화 (Adam/SGD)"],
  "CV 기초": ["CNN", "이미지 분류", "OpenCV", "CNN 아키텍처"],
  "DLthon 1": ["DLthon 해커톤 1"],
  "자연어처리 기초": ["텍스트 전처리", "Word2Vec", "Attention 메커니즘", "Seq2Seq"],
  "LLM 기초": ["언어 모델", "Transformer", "GPT 구조", "Data Augmentation"],
  "LLM 활용": ["LangChain", "RAG", "Fine-tuning (LoRA)", "RLHF", "Function Calling", "AI Agent", "LangGraph"],
  "DLthon 2": ["DLthon 해커톤 2"],
  "모델 배포 기초": ["FastAPI", "Streamlit", "RESTful API", "모델 서빙", "JWT 인증"],
  MLOps: ["Docker", "GCP", "Airflow", "CI/CD", "MLflow", "모델 모니터링"],
  "파이널 프로젝트": ["AIFFELthon", "End-to-End AI 시스템"],
};

function buildCurriculumFallback() {
  const nodes: Array<{ id: string; label: string; studyAmount: number; day: number; color?: string; module?: string }> = [];
  const edges: Array<{ source: string; target: string; weight: number; relationLabel: string }> = [];

  let dayCounter = 1;
  const moduleNodeIds: Record<string, string[]> = {};

  for (const mod of MODULES) {
    const concepts = MODULE_CONCEPTS[mod.name] ?? [mod.name];
    const color = MODULE_COLORS[mod.name] ?? "#6366f1";
    const nodeIds: string[] = [];

    for (const concept of concepts) {
      const id = concept.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-");
      nodes.push({
        id,
        label: concept,
        studyAmount: Math.min(10, Math.max(1, mod.difficulty * 2)),
        day: dayCounter,
        color,
        module: mod.name,
      });
      nodeIds.push(id);
      dayCounter++;
    }

    moduleNodeIds[mod.name] = nodeIds;

    // Chain concepts within the module
    for (let i = 1; i < nodeIds.length; i++) {
      edges.push({ source: nodeIds[i - 1], target: nodeIds[i], weight: 7, relationLabel: "학습" });
    }
  }

  // Cross-module edges (key dependency relationships)
  const crossEdges: Array<[string, string, number, string]> = [
    ["python 기초", "pandas", 9, "기반"],
    ["python 기초", "pytorch", 9, "기반"],
    ["numpy", "pytorch", 8, "기반"],
    ["pandas", "데이터 탐색", 8, "활용"],
    ["pytorch", "퍼셉트론", 9, "구현"],
    ["역전파", "cnn", 8, "적용"],
    ["cnn", "이미지 분류", 9, "구현"],
    ["attention-메커니즘", "transformer", 10, "핵심"],
    ["word2vec", "언어-모델", 7, "발전"],
    ["transformer", "gpt-구조", 9, "기반"],
    ["gpt-구조", "langchain", 8, "활용"],
    ["langchain", "rag", 9, "구현"],
    ["rag", "ai-agent", 8, "발전"],
    ["ai-agent", "langgraph", 9, "확장"],
    ["fine-tuning--lora-", "모델-서빙", 7, "배포"],
    ["fastapi", "docker", 8, "컨테이너화"],
    ["docker", "gcp", 8, "클라우드"],
    ["gcp", "airflow", 7, "파이프라인"],
    ["mlflow", "aiffelthon", 7, "활용"],
    ["ai-agent", "aiffelthon", 8, "응용"],
  ];

  const nodeIdSet = new Set(nodes.map((n) => n.id));
  for (const [src, tgt, weight, label] of crossEdges) {
    if (nodeIdSet.has(src) && nodeIdSet.has(tgt)) {
      edges.push({ source: src, target: tgt, weight, relationLabel: label });
    }
  }

  return { nodes, edges };
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const body = await request.json();
    const { concepts, curriculum_day, mode } = body;

    // Curriculum auto-build mode
    if (mode === "curriculum") {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(buildCurriculumFallback());
      }

      const modulesSummary = MODULES.map((m) => {
        const concepts = MODULE_CONCEPTS[m.name] ?? [m.name];
        return `모듈: ${m.name} (${m.totalDays}일, 난이도 ${m.difficulty}/5)\n핵심 개념: ${concepts.join(", ")}`;
      }).join("\n\n");

      const curriculumPrompt = `당신은 AI/ML 교육 커리큘럼 전문가입니다.
아래는 6개월 AI 교육 커리큘럼의 모듈별 핵심 개념 목록입니다.

${modulesSummary}

각 모듈의 핵심 개념들을 노드로, 모듈 간/내 학습 선후관계를 엣지로 만들어 지식 그래프를 생성하세요.

규칙:
- 각 노드: id(영문/숫자 하이픈만), label(한글 개념명), studyAmount(1~10), day(커리큘럼 일차 순서), module(모듈명), color(모듈별 색상)
- 각 엣지: source/target(노드 id), weight(1~10), relationLabel(한 단어: "기반"/"포함"/"발전"/"응용"/"구현"/"확장")
- 모듈 순서대로 day를 증가시키되 같은 모듈 내 개념은 연속 번호 사용
- 모듈별 color: ${JSON.stringify(MODULE_COLORS)}
- 모듈 내 개념 간 순차 연결 + 모듈 간 핵심 의존성 엣지 추가
- 총 노드 수: 30~50개, 엣지 수: 40~70개

JSON 형식으로만 응답:
{
  "nodes": [{ "id": "python-basics", "label": "Python 기초", "studyAmount": 5, "day": 1, "module": "파이썬 마스터", "color": "#3b82f6" }],
  "edges": [{ "source": "python-basics", "target": "pandas", "weight": 9, "relationLabel": "기반" }]
}`;

      const completion = await openai.chat.completions.create({
        model: AI_MODELS.graphBuild,
        max_tokens: 6000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: curriculumPrompt },
          { role: "user", content: "위 커리큘럼 전체의 지식 그래프를 생성해주세요. 파이썬→딥러닝→LLM→MLOps 학습 경로가 명확히 드러나도록 해주세요." },
        ],
      });

      const text = completion.choices[0].message.content ?? "{}";
      const parsed = JSON.parse(text);
      return NextResponse.json({
        nodes: parsed.nodes ?? [],
        edges: parsed.edges ?? [],
      });
    }

    // Manual mode (existing behavior)
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

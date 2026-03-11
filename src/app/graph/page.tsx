"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Network, Sparkles, X } from "lucide-react";
import { KnowledgeGraph, type GraphNode, type GraphEdge } from "@/components/graph/knowledge-graph";

const EXAMPLE_CONCEPTS = [
  "Python", "PyTorch", "CNN", "Transformer", "LLM", "RAG", "Agent",
  "Attention", "BERT", "GPT", "Fine-tuning", "Embedding",
];

const SAMPLE_NODES: GraphNode[] = [
  { id: "python", label: "Python", studyAmount: 9, day: 1 },
  { id: "pytorch", label: "PyTorch", studyAmount: 8, day: 2 },
  { id: "cnn", label: "CNN", studyAmount: 7, day: 3 },
  { id: "attention", label: "Attention", studyAmount: 6, day: 4 },
  { id: "transformer", label: "Transformer", studyAmount: 8, day: 5 },
  { id: "bert", label: "BERT", studyAmount: 6, day: 6 },
  { id: "gpt", label: "GPT", studyAmount: 7, day: 7 },
  { id: "llm", label: "LLM", studyAmount: 9, day: 8 },
  { id: "embedding", label: "Embedding", studyAmount: 5, day: 8 },
  { id: "finetuning", label: "Fine-tuning", studyAmount: 6, day: 9 },
  { id: "rag", label: "RAG", studyAmount: 7, day: 10 },
  { id: "agent", label: "Agent", studyAmount: 8, day: 11 },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { source: "python", target: "pytorch", weight: 9, relationLabel: "기반" },
  { source: "pytorch", target: "cnn", weight: 8, relationLabel: "구현" },
  { source: "pytorch", target: "attention", weight: 7, relationLabel: "구현" },
  { source: "attention", target: "transformer", weight: 10, relationLabel: "핵심" },
  { source: "cnn", target: "transformer", weight: 5, relationLabel: "발전" },
  { source: "transformer", target: "bert", weight: 9, relationLabel: "기반" },
  { source: "transformer", target: "gpt", weight: 9, relationLabel: "기반" },
  { source: "bert", target: "llm", weight: 7, relationLabel: "포함" },
  { source: "gpt", target: "llm", weight: 8, relationLabel: "포함" },
  { source: "llm", target: "embedding", weight: 6, relationLabel: "활용" },
  { source: "llm", target: "finetuning", weight: 7, relationLabel: "학습" },
  { source: "llm", target: "rag", weight: 8, relationLabel: "응용" },
  { source: "embedding", target: "rag", weight: 8, relationLabel: "핵심" },
  { source: "rag", target: "agent", weight: 9, relationLabel: "발전" },
  { source: "finetuning", target: "agent", weight: 5, relationLabel: "응용" },
];

export default function GraphPage() {
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(SAMPLE_NODES);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(SAMPLE_EDGES);
  const [conceptInput, setConceptInput] = useState("");
  const [curriculumDay, setCurriculumDay] = useState(1);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleBuildGraph = useCallback(async () => {
    const concepts = conceptInput
      .split(/[,\n]/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (concepts.length < 2) {
      toast.error("개념을 2개 이상 입력해주세요");
      return;
    }

    setIsBuilding(true);
    try {
      const res = await fetch("/api/graph/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts, curriculum_day: curriculumDay }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      if (data.nodes?.length) {
        setGraphNodes((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNodes = data.nodes.filter((n: GraphNode) => !existingIds.has(n.id));
          return [...prev, ...newNodes];
        });
        setGraphEdges((prev) => [...prev, ...data.edges]);
        toast.success(`${data.nodes.length}개 개념 그래프에 추가됨`);
        setConceptInput("");
      }
    } catch {
      toast.error("그래프 생성 실패");
    } finally {
      setIsBuilding(false);
    }
  }, [conceptInput, curriculumDay]);

  const handleLoadExample = useCallback(() => {
    setConceptInput(EXAMPLE_CONCEPTS.join(", "));
    setCurriculumDay(12);
  }, []);

  const handleReset = useCallback(() => {
    setGraphNodes(SAMPLE_NODES);
    setGraphEdges(SAMPLE_EDGES);
    setSelectedNode(null);
    toast.success("기본 그래프로 초기화됨");
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen gap-4 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">개념 지식 그래프</h1>
            <p className="text-xs text-slate-400">학습 개념들의 관계를 시각화합니다</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          초기화
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <textarea
              value={conceptInput}
              onChange={(e) => setConceptInput(e.target.value)}
              placeholder="개념을 쉼표로 구분하여 입력하세요 (예: Python, PyTorch, CNN)"
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-48">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 whitespace-nowrap">학습 일차</label>
              <input
                type="number"
                min={1}
                max={365}
                value={curriculumDay}
                onChange={(e) => setCurriculumDay(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleBuildGraph}
              disabled={isBuilding || !conceptInput.trim()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isBuilding ? "분석 중..." : "AI 그래프 생성"}
            </button>
            <button
              onClick={handleLoadExample}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors text-center"
            >
              예시 불러오기
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <KnowledgeGraph
          graphNodes={graphNodes}
          graphEdges={graphEdges}
          onNodeClick={setSelectedNode}
        />

        {selectedNode && (
          <div className="absolute top-4 right-4 w-64 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{selectedNode.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedNode.day}일차 학습</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">학습량</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-sm ${
                        i < selectedNode.studyAmount ? "bg-blue-500" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                연결된 개념:{" "}
                {graphEdges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .length}개
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MindmapCanvas } from "@/components/mindmap/canvas";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, GitBranch, Lightbulb } from "lucide-react";
import { toast } from "sonner";

type Issue = {
  type: "incorrect_connection" | "missing_link" | "unclear_concept";
  description: string;
};

type AnalysisResult = {
  analysis: string;
  issues: Issue[];
  suggestions: string[];
  score: number;
  suggestedNodes: Array<{ id: string; label: string; category: string; x: number; y: number }>;
  suggestedEdges: Array<{ id: string; source: string; target: string; label?: string }>;
};

const issueTypeLabel: Record<string, string> = {
  incorrect_connection: "잘못된 연결",
  missing_link: "누락된 연결",
  unclear_concept: "불명확한 개념",
};

const issueTypeColor: Record<string, string> = {
  incorrect_connection: "text-red-400 bg-red-500/10 border-red-500/20",
  missing_link: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  unclear_concept: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

let nodeIdCounter = 1;

function makeNode(label: string, x: number, y: number, category: string): Node {
  const id = `node-${nodeIdCounter++}`;
  return {
    id,
    type: "mindmap",
    position: { x, y },
    data: { label, category },
  };
}

function buildFlowNodes(
  rawNodes: Array<{ id: string; label: string; category: string; x: number; y: number }>
): Node[] {
  return rawNodes.map((n) => ({
    id: n.id,
    type: "mindmap",
    position: { x: n.x, y: n.y },
    data: { label: n.label, category: n.category },
  }));
}

function buildFlowEdges(
  rawEdges: Array<{ id: string; source: string; target: string; label?: string }>
): Edge[] {
  return rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "mindmap",
    label: e.label,
  }));
}

export default function MindmapPage() {
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [view, setView] = useState<"user" | "ai">("user");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [aiNodes, setAiNodes] = useState<Node[]>([]);
  const [aiEdges, setAiEdges] = useState<Edge[]>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "mindmap" }, eds));
    },
    [setEdges]
  );

  function startMindmap() {
    if (!topic.trim()) {
      toast.error("중심 개념을 입력해주세요.");
      return;
    }
    const rootNode = makeNode(topic.trim(), 400, 300, "root");
    setNodes([rootNode]);
    setEdges([]);
    setStarted(true);
    setAnalysis(null);
  }

  function addNode() {
    if (!newNodeLabel.trim()) return;
    const x = 200 + Math.random() * 400;
    const y = 100 + Math.random() * 400;
    const node = makeNode(newNodeLabel.trim(), x, y, "sub");
    setNodes((nds) => [...nds, node]);
    setNewNodeLabel("");
  }

  function clearCanvas() {
    const rootNode = makeNode(topic.trim(), 400, 300, "root");
    nodeIdCounter = 1;
    setNodes([rootNode]);
    setEdges([]);
    setAnalysis(null);
  }

  async function runAnalysis() {
    if (nodes.length < 2) {
      toast.error("노드를 2개 이상 추가한 후 분석해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/coach/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, nodes, edges }),
      });
      if (!res.ok) throw new Error("API 오류");
      const data: AnalysisResult = await res.json();
      setAnalysis(data);
      setAiNodes(buildFlowNodes(data.suggestedNodes));
      setAiEdges(buildFlowEdges(data.suggestedEdges));
      toast.success("AI 분석 완료!");
    } catch {
      toast.error("분석 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">마인드맵 모드</h1>
          <p className="text-slate-400 mt-1">개념 간 연결을 시각화하고 AI 피드백으로 보완하세요</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4 max-w-lg">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">중심 개념 입력</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startMindmap()}
              placeholder="예: 머신러닝, TCP/IP, 리액트 훅스..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <Button onClick={startMindmap} className="w-full" size="lg">
            <GitBranch className="w-4 h-4 mr-2" />
            마인드맵 시작
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">마인드맵 모드</h1>
          <p className="text-slate-400 mt-0.5 text-sm">중심 개념: <span className="text-blue-400 font-medium">{topic}</span></p>
        </div>
        <button
          onClick={() => { setStarted(false); setAnalysis(null); setNodes([]); setEdges([]); }}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← 돌아가기
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={newNodeLabel}
          onChange={(e) => setNewNodeLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNode()}
          placeholder="새 노드 이름..."
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-48"
        />
        <Button onClick={addNode} size="sm" variant="outline" disabled={!newNodeLabel.trim()}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          노드 추가
        </Button>
        <Button onClick={clearCanvas} size="sm" variant="ghost">
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          초기화
        </Button>
        <div className="flex-1" />
        <Button
          onClick={runAnalysis}
          disabled={loading || nodes.length < 2}
          size="sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          AI 분석
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        노드를 드래그해 위치를 조정하고, 노드의 오른쪽 핸들에서 다른 노드로 드래그해 연결하세요.
      </p>

      {analysis ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setView("user")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              내 마인드맵
            </button>
            <button
              onClick={() => setView("ai")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === "ai"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              AI 제안 맵
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className={`space-y-3 ${view === "ai" ? "lg:block hidden" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">내 마인드맵</h3>
                <span className="text-xs text-slate-500">{nodes.length}개 노드 · {edges.length}개 연결</span>
              </div>
              <div className="h-80">
                <MindmapCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                />
              </div>
            </div>

            <div className={`space-y-3 ${view === "user" ? "lg:block hidden" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">AI 제안 마인드맵</h3>
                <span className="text-xs text-slate-500">{aiNodes.length}개 노드 · {aiEdges.length}개 연결</span>
              </div>
              <div className="h-80">
                <MindmapCanvas
                  nodes={aiNodes}
                  edges={aiEdges}
                  onNodesChange={() => {}}
                  onEdgesChange={() => {}}
                  onConnect={() => {}}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">AI 분석 결과</h3>
                <span className="text-sm font-bold text-blue-400">{analysis.score}점</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.analysis}</p>

              {analysis.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">발견된 문제</p>
                  {analysis.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border px-3 py-2 text-xs ${issueTypeColor[issue.type] ?? "text-slate-400 bg-slate-700/50 border-slate-600"}`}
                    >
                      <span className="font-semibold">{issueTypeLabel[issue.type] ?? issue.type}: </span>
                      {issue.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {analysis.suggestions.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-semibold">추가 브랜치 제안</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[500px]">
          <MindmapCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />
        </div>
      )}
    </div>
  );
}

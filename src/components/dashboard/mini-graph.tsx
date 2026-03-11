"use client";

import { Network } from "lucide-react";
import Link from "next/link";

const PREVIEW_NODES = [
  { id: "a", label: "신경망", x: 50, y: 30 },
  { id: "b", label: "역전파", x: 20, y: 65 },
  { id: "c", label: "경사하강법", x: 50, y: 65 },
  { id: "d", label: "활성화함수", x: 80, y: 65 },
  { id: "e", label: "손실함수", x: 35, y: 90 },
];

const PREVIEW_EDGES = [
  { source: "a", target: "b" },
  { source: "a", target: "c" },
  { source: "a", target: "d" },
  { source: "b", target: "c" },
  { source: "c", target: "e" },
];

function getNode(id: string) {
  return PREVIEW_NODES.find((n) => n.id === id);
}

export function MiniGraph() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold">지식 그래프</span>
        </div>
        <Link
          href="/graph"
          className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="relative h-28 w-full">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {PREVIEW_EDGES.map((edge, i) => {
            const src = getNode(edge.source);
            const tgt = getNode(edge.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#334155"
                strokeWidth="1.5"
              />
            );
          })}
          {PREVIEW_NODES.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill="#10b981"
                fillOpacity="0.2"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y + 11}
                textAnchor="middle"
                fontSize="4"
                fill="#94a3b8"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-xs text-slate-500">학습한 개념들의 연결 관계를 시각화합니다</p>
    </div>
  );
}

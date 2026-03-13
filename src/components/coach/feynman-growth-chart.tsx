"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface ScorePoint {
  date: string;
  concept: string;
  score: number;
}

export function FeynmanGrowthChart() {
  const [scores, setScores] = useState<ScorePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/coach/feynman-scores");
        const data = await res.json();
        if (data.scores) setScores(data.scores);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || scores.length < 2) return null;

  const width = 400;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = scores.map((s, i) => ({
    x: padding.left + (i / (scores.length - 1)) * chartW,
    y: padding.top + chartH - ((s.score - 1) / 4) * chartH,
    ...s,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // 평균 점수 계산
  const avgScore = (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold">파인만 설명 품질 추이</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{scores.length}회 기록</span>
          <span>평균 {avgScore}/5</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        {/* Y축 가이드 */}
        {[1, 2, 3, 4, 5].map((v) => {
          const y = padding.top + chartH - ((v - 1) / 4) * chartH;
          return (
            <g key={v}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end"
                className="fill-slate-500" fontSize="10">{v}</text>
            </g>
          );
        })}
        {/* 라인 */}
        <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* 포인트 */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" className="fill-green-400" />
            {/* 마지막 포인트에 개념 레이블 */}
            {i === points.length - 1 && (
              <text x={p.x} y={p.y - 10} textAnchor="end" className="fill-slate-400" fontSize="9">
                {p.concept.slice(0, 10)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export function CompletionGauge() {
  const [percentage, setPercentage] = useState<number | null>(null);
  const [details, setDetails] = useState<{
    recordRate: number;
    coachRate: number;
    avgLevel: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/confidence/completion");
        const data = await res.json();
        setPercentage(data.percentage);
        if (data.details) setDetails(data.details);
      } catch {
        setPercentage(0);
      }
    }
    load();
  }, []);

  const pct = percentage ?? 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 80 ? "text-green-400" : pct >= 50 ? "text-blue-400" : "text-yellow-400";

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className={color}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {percentage === null ? (
            <span className="text-sm text-slate-500">...</span>
          ) : (
            <span className="text-lg font-bold">{pct}%</span>
          )}
        </div>
      </div>
      <div>
        <div className="font-medium text-sm">완주 예측</div>
        <p className="text-xs text-slate-400 mt-0.5">
          현재 페이스 기반 실시간 산출
        </p>
        {details && (
          <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
            <span>기록 {details.recordRate}%</span>
            <span>코칭 {details.coachRate}%</span>
            <span>이해도 {details.avgLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2, BarChart2 } from "lucide-react";
import type { MetricsResult } from "@/lib/metrics";

interface MetricCardProps {
  label: string;
  value: string;
  progress: number; // 0–100
  color: string; // Tailwind color token e.g. "blue"
  sub?: string;
}

function MetricCard({ label, value, progress, color, sub }: MetricCardProps) {
  const clamp = Math.min(Math.max(progress, 0), 100);
  const barColor: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    violet: "bg-violet-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
  };
  const textColor: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    violet: "text-violet-400",
    orange: "text-orange-400",
    yellow: "text-yellow-400",
    pink: "text-pink-400",
  };

  return (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-sm font-semibold ${textColor[color] ?? "text-white"}`}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor[color] ?? "bg-slate-500"}`}
          style={{ width: `${clamp}%` }}
        />
      </div>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function MetricsPanel() {
  const [data, setData] = useState<MetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json: MetricsResult) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        <span className="font-semibold">성공 메트릭</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-500 ml-auto" />}
      </div>

      {error && (
        <p className="text-sm text-slate-500">
          메트릭을 불러오려면 로그인이 필요합니다.
        </p>
      )}

      {loading && !error && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700 animate-pulse space-y-2">
              <div className="h-3 bg-slate-700 rounded w-3/4" />
              <div className="h-1.5 bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="일일 기록률"
            value={`${data.dailyRecordRate.value}%`}
            progress={data.dailyRecordRate.value}
            color="blue"
            sub={`목표 ${data.dailyRecordRate.target}% · ${data.dailyRecordRate.days}/${data.dailyRecordRate.elapsed}일`}
          />
          <MetricCard
            label="AI 코칭 완료율"
            value={`${data.coachCompletionRate.value}%`}
            progress={data.coachCompletionRate.value}
            color="violet"
            sub={`목표 ${data.coachCompletionRate.target}% · ${data.coachCompletionRate.completed}/${data.coachCompletionRate.total}회`}
          />
          <MetricCard
            label="이해도 향상"
            value={`+${data.understandingTrend.value}%`}
            progress={Math.min((data.understandingTrend.value / data.understandingTrend.target) * 100, 100)}
            color="green"
            sub={`목표 +${data.understandingTrend.target}% · ${data.understandingTrend.firstMonth} → ${data.understandingTrend.latestMonth}`}
          />
          <MetricCard
            label="Main Quest 제출"
            value={`${data.mainQuestRate.submitted}/5`}
            progress={(data.mainQuestRate.submitted / 5) * 100}
            color="orange"
            sub={`목표 5/5`}
          />
          <MetricCard
            label="연속 기록 스트릭"
            value={`${data.streak.current}일`}
            progress={Math.min((data.streak.current / 30) * 100, 100)}
            color="yellow"
            sub="최대화 목표"
          />
          <MetricCard
            label="WIN 카드 누적"
            value={`${data.winCards.total}`}
            progress={Math.min((data.winCards.total / data.winCards.target) * 100, 100)}
            color="pink"
            sub={`목표 ${data.winCards.target}개 (119×3)`}
          />
        </div>
      )}

      {data && !loading && (
        <div className="flex items-center gap-1.5 pt-1">
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">커리큘럼 119일 기준 실시간 집계</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface Milestone {
  week: number;
  avg_understanding: number;
  sample_capture: string;
  topic: string;
}

interface Comparison {
  early: Milestone;
  recent: Milestone;
}

interface GrowthData {
  milestones: Milestone[];
  comparison: Comparison | null;
}

function understandingColor(level: number): string {
  if (level < 3) return "bg-red-500";
  if (level < 5) return "bg-yellow-500";
  return "bg-green-500";
}

function understandingLabel(level: number): string {
  if (level < 3) return "초급";
  if (level < 5) return "중급";
  return "숙련";
}

function understandingBarColor(level: number): string {
  if (level < 3) return "bg-red-500";
  if (level < 5) return "bg-yellow-500";
  return "bg-green-500";
}

export function GrowthTimeline() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrowth() {
      try {
        const res = await fetch("/api/confidence/growth");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silent fail
      }
      setLoading(false);
    }
    fetchGrowth();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          성장 타임라인
        </h2>
        <div className="text-sm text-slate-500">성장 기록을 분석하고 있어요...</div>
      </div>
    );
  }

  if (!data || data.milestones.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          성장 타임라인
        </h2>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-sm text-slate-400">
            코칭 세션을 진행하면 주차별 성장 기록이 여기에 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        성장 타임라인
      </h2>

      {/* Week 1 vs Current comparison */}
      {data.comparison && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {data.comparison.early.week}주차 시작
            </div>
            <div className="text-sm font-medium text-slate-200">
              {data.comparison.early.topic}
            </div>
            <p className="text-xs text-slate-400 line-clamp-3">
              {data.comparison.early.sample_capture}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${understandingBarColor(data.comparison.early.avg_understanding)}`}
                  style={{ width: `${(data.comparison.early.avg_understanding / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {data.comparison.early.avg_understanding.toFixed(1)}/5
              </span>
            </div>
          </div>

          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              {data.comparison.recent.week}주차 현재
            </div>
            <div className="text-sm font-medium text-slate-200">
              {data.comparison.recent.topic}
            </div>
            <p className="text-xs text-slate-400 line-clamp-3">
              {data.comparison.recent.sample_capture}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${understandingBarColor(data.comparison.recent.avg_understanding)}`}
                  style={{ width: `${(data.comparison.recent.avg_understanding / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {data.comparison.recent.avg_understanding.toFixed(1)}/5
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Vertical milestone timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div
          className="overflow-y-auto space-y-0"
          style={{ maxHeight: "300px" }}
        >
          {data.milestones.map((milestone, i) => (
            <div key={milestone.week} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${understandingColor(milestone.avg_understanding)}`}
                />
                {i < data.milestones.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-300">
                    {milestone.week}주차
                  </span>
                  <span className="text-xs text-slate-500">{milestone.topic}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      milestone.avg_understanding < 3
                        ? "bg-red-500/15 text-red-400"
                        : milestone.avg_understanding < 5
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-green-500/15 text-green-400"
                    }`}
                  >
                    {understandingLabel(milestone.avg_understanding)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {milestone.sample_capture}
                </p>
                {/* Understanding bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${understandingBarColor(milestone.avg_understanding)}`}
                      style={{ width: `${(milestone.avg_understanding / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {milestone.avg_understanding.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

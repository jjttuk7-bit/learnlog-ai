"use client";

import { useState } from "react";
import { BarChart3, CheckCircle, TrendingUp, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WeeklyReportData {
  week_number: number;
  summary: string;
  achievements: string[];
  improvements: string[];
  next_week_goals: string[];
  score: number;
}

export function WeeklyReport() {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/report/weekly", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReport(data);
      toast.success("주간 리포트가 생성되었습니다");
    } catch {
      toast.error("리포트 생성에 실패했습니다");
    }
    setLoading(false);
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <span className="font-semibold">주간 리포트</span>
        </div>
        {report && (
          <span className="text-xs text-slate-400">{report.week_number}주차</span>
        )}
      </div>

      {!report ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">이번 주 학습을 AI가 분석하고 요약합니다</p>
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-lg text-sm hover:bg-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                리포트 생성
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">완성도</span>
                <span className="text-xs font-semibold text-violet-400">{report.score}점</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${report.score}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300">{report.summary}</p>

          {report.achievements.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                이번 주 성과
              </div>
              <ul className="space-y-1">
                {report.achievements.map((item, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.improvements.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-400">
                <TrendingUp className="w-3.5 h-3.5" />
                개선 포인트
              </div>
              <ul className="space-y-1">
                {report.improvements.map((item, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-yellow-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.next_week_goals.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
                <Target className="w-3.5 h-3.5" />
                다음 주 목표
              </div>
              <ul className="space-y-1">
                {report.next_week_goals.map((item, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            {loading ? "생성 중..." : "다시 생성"}
          </button>
        </div>
      )}
    </div>
  );
}

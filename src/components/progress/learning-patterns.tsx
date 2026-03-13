"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, Tag, TrendingUp } from "lucide-react";

interface PatternData {
  hourly: number[];
  categories: Record<string, number>;
  daily: Record<string, number>;
  totalCaptures: number;
  captureTypes: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  concept: { label: "개념", color: "#60a5fa" },
  code: { label: "코드", color: "#34d399" },
  question: { label: "질문", color: "#fbbf24" },
  insight: { label: "인사이트", color: "#a78bfa" },
};

export function LearningPatterns() {
  const [data, setData] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/patterns");
        const json = await res.json();
        setData(json);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500 text-sm">패턴 분석 중...</div>;
  if (!data || data.totalCaptures === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.06] text-center text-slate-500 text-sm">
        캡처 데이터가 없습니다. 학습 캡처를 시작하면 패턴이 분석됩니다.
      </div>
    );
  }

  const maxHourly = Math.max(...data.hourly, 1);
  const peakHour = data.hourly.indexOf(Math.max(...data.hourly));

  const categoryEntries = Object.entries(data.categories).sort((a, b) => b[1] - a[1]);
  const totalCat = categoryEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const dailyValues = Object.values(data.daily);
  const avgDaily = dailyValues.length > 0 ? (dailyValues.reduce((s, v) => s + v, 0) / dailyValues.length).toFixed(1) : "0";
  const activeDays = dailyValues.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold">학습 패턴 분석</h2>
        <span className="text-xs text-slate-500">최근 30일</span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06] text-center">
          <p className="text-2xl font-bold text-cyan-400">{data.totalCaptures}</p>
          <p className="text-xs text-slate-400 mt-1">총 캡처</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06] text-center">
          <p className="text-2xl font-bold text-green-400">{activeDays}</p>
          <p className="text-xs text-slate-400 mt-1">활동 일수</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06] text-center">
          <p className="text-2xl font-bold text-amber-400">{avgDaily}</p>
          <p className="text-xs text-slate-400 mt-1">일 평균</p>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-5 border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">시간대별 학습 활동</span>
          <span className="text-xs text-slate-500 ml-auto">피크: {peakHour}시</span>
        </div>
        <div className="flex items-end gap-[2px] h-20">
          {data.hourly.map((count, hour) => (
            <div key={hour} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-blue-500/70 transition-all min-h-[2px]"
                style={{ height: `${(count / maxHourly) * 100}%` }}
                title={`${hour}시: ${count}건`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>0시</span>
          <span>6시</span>
          <span>12시</span>
          <span>18시</span>
          <span>23시</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-5 border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">카테고리 분포</span>
        </div>
        <div className="flex h-6 rounded-full overflow-hidden">
          {categoryEntries.map(([cat, count]) => {
            const config = CATEGORY_LABELS[cat] || { label: cat, color: "#64748b" };
            const pct = (count / totalCat) * 100;
            return (
              <div
                key={cat}
                className="transition-all"
                style={{ width: `${pct}%`, backgroundColor: config.color }}
                title={`${config.label}: ${count}건 (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          {categoryEntries.map(([cat, count]) => {
            const config = CATEGORY_LABELS[cat] || { label: cat, color: "#64748b" };
            const pct = ((count / totalCat) * 100).toFixed(0);
            return (
              <div key={cat} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-slate-300">{config.label}</span>
                <span className="text-slate-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Activity */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-5 border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">일별 캡처 추이</span>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {(() => {
            const days: { date: string; count: number }[] = [];
            for (let i = 29; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const key = d.toISOString().slice(0, 10);
              days.push({ date: key, count: data.daily[key] || 0 });
            }
            const maxD = Math.max(...days.map((d) => d.count), 1);
            return days.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: d.count > 0 ? `${Math.max((d.count / maxD) * 100, 8)}%` : "3px",
                  backgroundColor: d.count > 0 ? `rgba(52, 211, 153, ${0.3 + (d.count / maxD) * 0.7})` : "rgba(100, 116, 139, 0.2)",
                }}
                title={`${d.date}: ${d.count}건`}
              />
            ));
          })()}
        </div>
        <div className="flex justify-between text-[9px] text-slate-600">
          <span>30일 전</span>
          <span>오늘</span>
        </div>
      </div>
    </div>
  );
}

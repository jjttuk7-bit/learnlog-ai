"use client";

import { useState } from "react";
import { CURRICULUM, type CurriculumDay } from "@/data/curriculum";
import { BookOpen, ChevronDown, ChevronUp, Loader2, Sparkles, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";

function getUpcomingDays(count: number): CurriculumDay[] {
  const today = new Date().toISOString().slice(0, 10);
  return CURRICULUM.filter((d) => d.date >= today).slice(0, count);
}

const difficultyLabel = ["", "입문", "기초", "중급", "고급", "심화"];
const difficultyColor = ["", "text-green-400", "text-blue-400", "text-yellow-400", "text-orange-400", "text-red-400"];

export function UpcomingPreview() {
  const upcoming = getUpcomingDays(7);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [guides, setGuides] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);

  async function loadGuide(day: CurriculumDay) {
    if (guides[day.dayNumber]) {
      setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber);
      return;
    }

    setExpandedDay(day.dayNumber);
    setLoading(day.dayNumber);

    try {
      const res = await fetch("/api/progress/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: day.topic,
          module: day.module,
          dayNumber: day.dayNumber,
          difficulty: day.difficulty,
        }),
      });
      const data = await res.json();
      if (data.guide) {
        setGuides((prev) => ({ ...prev, [day.dayNumber]: data.guide }));
      }
    } catch {
      setGuides((prev) => ({ ...prev, [day.dayNumber]: "예습 가이드를 불러올 수 없습니다." }));
    }
    setLoading(null);
  }

  if (upcoming.length === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold">다가오는 학습 예습</h2>
        <span className="text-xs text-slate-500">클릭하면 AI 예습 가이드 생성</span>
      </div>

      <div className="space-y-2">
        {upcoming.map((day) => {
          const isToday = day.date === today;
          const isExpanded = expandedDay === day.dayNumber;
          const isLoading = loading === day.dayNumber;
          const guide = guides[day.dayNumber];

          return (
            <div
              key={day.dayNumber}
              className={`rounded-xl border overflow-hidden transition-colors ${
                isToday
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <button
                onClick={() => loadGuide(day)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-750 transition-colors"
              >
                <div className="text-center shrink-0 w-12">
                  <div className="text-xs text-slate-500">Day</div>
                  <div className={`text-lg font-bold ${isToday ? "text-amber-400" : "text-white"}`}>
                    {day.dayNumber}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-medium">오늘</span>
                    )}
                    <span className="text-xs text-slate-500">{day.module}</span>
                    {day.questId && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        {day.questType === "main" ? "Main" : "Sub"} Quest
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{day.topic}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: day.difficulty }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${difficultyColor[day.difficulty]} fill-current`} />
                    ))}
                  </div>
                  <span className={`text-[10px] ${difficultyColor[day.difficulty]}`}>
                    {difficultyLabel[day.difficulty]}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-700">
                  {isLoading ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-sm text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      AI 예습 가이드 생성 중...
                    </div>
                  ) : guide ? (
                    <div className="pt-3 prose prose-invert prose-sm max-w-none [&_h3]:text-amber-300 [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5 [&_strong]:text-white [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_code]:text-emerald-400">
                      <ReactMarkdown>{guide}</ReactMarkdown>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

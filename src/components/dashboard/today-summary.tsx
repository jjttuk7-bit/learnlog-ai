"use client";

import { getCourseProgress, getCurrentModule } from "@/lib/curriculum";
import { Calendar } from "lucide-react";

export function TodaySummary() {
  const progress = getCourseProgress();
  const module = getCurrentModule();

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Calendar className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-400">
          Day {progress.currentDay ?? "-"} / {progress.totalDays}
        </div>
        <div className="font-medium">{module?.name ?? "과정 시작 전"}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-blue-400">{progress.percentage}%</div>
        <div className="text-xs text-slate-500">{progress.daysRemaining}일 남음</div>
      </div>
    </div>
  );
}

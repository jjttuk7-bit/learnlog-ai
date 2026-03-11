"use client";

import { getCourseProgress, getCurrentModule } from "@/lib/curriculum";

export function TodayPosition() {
  const progress = getCourseProgress();
  const currentModule = getCurrentModule();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="text-sm text-slate-400">현재 위치</div>
      <div className="text-4xl font-bold mt-1">
        Day {progress.currentDay ?? "-"}
        <span className="text-lg text-slate-400"> / {progress.totalDays}</span>
      </div>
      <div className="text-blue-400 mt-2 font-medium">
        {currentModule?.name ?? "과정 시작 전"}
      </div>
      <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span>{progress.percentage}% 완료</span>
        <span>{progress.daysRemaining}일 남음</span>
      </div>
    </div>
  );
}

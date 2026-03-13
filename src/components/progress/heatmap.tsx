"use client";

import { CURRICULUM } from "@/data/curriculum";

export function Heatmap() {
  const startDate = new Date("2026-03-09");
  const weeks: { date: string; level: number }[][] = [];

  for (let w = 0; w < 27; w++) {
    const week: { date: string; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const current = new Date(startDate);
      current.setDate(current.getDate() + w * 7 + d);
      const dateStr = current.toISOString().split("T")[0];
      const currDay = CURRICULUM.find((c) => c.date === dateStr);
      const today = new Date().toISOString().split("T")[0];
      const level = dateStr === today ? 3 : currDay ? 1 : 0;
      week.push({ date: dateStr, level });
    }
    weeks.push(week);
  }

  const colors = ["bg-slate-800/50", "bg-green-900/50", "bg-green-700/60", "bg-green-500", "bg-green-400"];
  const dayLabels = ["", "\uC6D4", "", "\uC218", "", "\uAE08", ""];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">학습 히트맵</h2>
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-5 border border-white/[0.06] ring-1 ring-white/[0.06]">
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="w-3 h-3 text-[8px] text-slate-500 flex items-center">
                  {label}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${colors[day.level]} border border-white/[0.04]`}
                    title={`${day.date} (활동: ${day.level})`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
          <span>적음</span>
          {colors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c} border border-white/[0.04]`} />
          ))}
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}

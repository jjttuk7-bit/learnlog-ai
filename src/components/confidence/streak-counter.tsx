"use client";

import { Flame } from "lucide-react";

interface Props {
  streakDays: number;
}

const MILESTONES = [
  { days: 7, label: "1주", emoji: "🔥" },
  { days: 30, label: "1개월", emoji: "⭐" },
  { days: 60, label: "2개월", emoji: "💪" },
  { days: 100, label: "100일", emoji: "🏆" },
  { days: 119, label: "완주!", emoji: "👑" },
];

export function StreakCounter({ streakDays }: Props) {
  const nextMilestone = MILESTONES.find((m) => m.days > streakDays);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{streakDays}일</div>
            <div className="text-xs text-slate-400">연속 기록</div>
          </div>
        </div>
        {nextMilestone && (
          <div className="text-right">
            <div className="text-xs text-slate-500">다음 마일스톤</div>
            <div className="text-sm text-slate-300">
              {nextMilestone.emoji} {nextMilestone.label} (
              {nextMilestone.days - streakDays}일 남음)
            </div>
          </div>
        )}
      </div>

      {/* Milestone badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {MILESTONES.map((m) => (
          <div
            key={m.days}
            className={`text-xs px-2 py-1 rounded-full ${
              streakDays >= m.days
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-slate-700/50 text-slate-500 border border-slate-700"
            }`}
          >
            {m.emoji} {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { getMainQuests } from "@/lib/curriculum";
import { Trophy } from "lucide-react";

export function QuestBadges() {
  const mainQuests = getMainQuests();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Main Quest 배지</h2>
      <div className="flex gap-3 flex-wrap">
        {mainQuests.map((mq) => {
          const isPast = new Date(mq.date) < new Date();
          return (
            <div
              key={mq.questId}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border w-20 transition-all duration-200 ${
                isPast
                  ? "bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/10"
                  : "bg-white/[0.03] border-white/[0.06] opacity-50"
              }`}
            >
              <Trophy className={`w-8 h-8 ${isPast ? "text-yellow-400" : "text-slate-600"}`} />
              <span className="text-[10px] font-medium text-center leading-tight">
                {mq.questId?.replace("MQ_", "MQ ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

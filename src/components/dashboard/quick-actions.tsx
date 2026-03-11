"use client";

import Link from "next/link";
import { PenLine, Brain, Swords } from "lucide-react";
import { getTodayCurriculum } from "@/lib/curriculum";

export function QuickActions() {
  const today = getTodayCurriculum();
  const hasQuest = !!today?.questId;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Link
        href="/capture"
        className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors"
      >
        <PenLine className="w-6 h-6 text-blue-400" />
        <span className="text-xs font-medium text-blue-300">빠른 캡처</span>
      </Link>

      <Link
        href="/coach"
        className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
      >
        <Brain className="w-6 h-6 text-green-400" />
        <span className="text-xs font-medium text-green-300">AI 코치</span>
      </Link>

      <Link
        href={hasQuest ? `/quest/${today?.questId}` : "/quest"}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
          hasQuest
            ? "bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20"
            : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
        }`}
      >
        <Swords className={`w-6 h-6 ${hasQuest ? "text-orange-400" : "text-slate-500"}`} />
        <span className={`text-xs font-medium ${hasQuest ? "text-orange-300" : "text-slate-500"}`}>
          {hasQuest ? "오늘 퀘스트" : "퀘스트"}
        </span>
      </Link>
    </div>
  );
}

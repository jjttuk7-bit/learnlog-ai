"use client";

import { useState, useEffect } from "react";
import { getTodayCurriculum } from "@/lib/curriculum";
import { getQuestById } from "@/data/quests";
import { Trophy, BookOpen, Brain, ChevronRight } from "lucide-react";
import Link from "next/link";

export function MainQuestRetro() {
  const today = getTodayCurriculum();
  const quest = today?.questId ? getQuestById(today.questId) : null;
  const [hintsUsed, setHintsUsed] = useState<number | null>(null);

  const isMainQuest = quest?.type === "main";

  useEffect(() => {
    if (!isMainQuest || !quest) return;
    async function loadStats() {
      try {
        const res = await fetch(`/api/quest/hint-stats?questId=${quest!.id}`);
        const data = await res.json();
        setHintsUsed(data.hintsUsed || 0);
      } catch { /* ignore */ }
    }
    loadStats();
  }, [isMainQuest, quest]);

  if (!isMainQuest || !quest) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        <span className="font-semibold text-amber-300">Main Quest Day</span>
        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
          {quest.id}
        </span>
      </div>

      <div>
        <div className="text-lg font-semibold">{quest.title}</div>
        <p className="text-sm text-slate-400 mt-0.5">{quest.description}</p>
      </div>

      {hintsUsed !== null && hintsUsed > 0 && (
        <p className="text-xs text-slate-500">
          현재까지 힌트 {hintsUsed}회 사용
        </p>
      )}

      <div className="text-sm text-slate-300 space-y-1">
        <p>Main Quest는 특별 회고가 필요합니다. 완료 후 아래 단계를 진행하세요:</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Link
          href={`/coach/feynman?concept=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
          className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors group"
        >
          <Brain className="w-4 h-4 text-blue-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">파인만 설명</div>
            <div className="text-xs text-slate-500">핵심 개념 설명하기</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </Link>

        <Link
          href={`/coach/blank-recall?topic=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
          className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors group"
        >
          <BookOpen className="w-4 h-4 text-green-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">빈칸 회상</div>
            <div className="text-xs text-slate-500">기억 점검하기</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-green-400 transition-colors" />
        </Link>

        <Link
          href="/diary"
          className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-colors group"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">회고 일기</div>
            <div className="text-xs text-slate-500">배운 점 기록하기</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

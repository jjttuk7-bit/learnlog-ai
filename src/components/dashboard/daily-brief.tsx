"use client";

import { useState, useEffect } from "react";
import { getTodayCurriculum, getCurrentModule, getDaysUntilNextQuest, isHighIntensityPeriod } from "@/lib/curriculum";
import { getQuestById } from "@/data/quests";
import { Sun, Target, AlertTriangle, Swords } from "lucide-react";

export function DailyBrief() {
  const today = getTodayCurriculum();
  const currentModule = getCurrentModule();
  const nextQuest = getDaysUntilNextQuest();
  const isHighIntensity = isHighIntensityPeriod();
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const quest = today?.questId ? getQuestById(today.questId) : null;

  useEffect(() => {
    async function fetchBrief() {
      if (!today) return;
      setLoading(true);
      try {
        const res = await fetch("/api/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module: today.module, topic: today.topic, difficulty: today.difficulty }),
        });
        const data = await res.json();
        if (data.goals) setGoals(data.goals);
      } catch {
        setGoals([
          `${today.topic}의 핵심 개념을 이해한다`,
          "학습 내용을 최소 3개 캡처한다",
          "AI 코치 체크인을 완료한다",
        ]);
      }
      setLoading(false);
    }
    fetchBrief();
  }, []);

  if (!today) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <Sun className="w-5 h-5" />
          <span className="font-medium">오늘은 수업일이 아닙니다</span>
        </div>
        <p className="text-sm text-slate-500 mt-2">주말이거나 과정 기간 외입니다. 복습해보는 건 어떨까요?</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
      <div className="flex items-center gap-2">
        <Sun className="w-5 h-5 text-yellow-400" />
        <span className="font-semibold">Daily Brief</span>
        <span className="text-sm text-slate-400">Day {today.dayNumber}</span>
      </div>

      <div>
        <div className="text-blue-400 font-medium">{today.module}</div>
        <div className="text-lg font-semibold mt-0.5">{today.topic}</div>
      </div>

      {/* Learning Goals */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Target className="w-4 h-4" /> 오늘의 학습 목표
        </div>
        {loading ? (
          <div className="text-sm text-slate-500">AI가 목표를 생성 중...</div>
        ) : (
          <ul className="space-y-1">
            {goals.map((goal, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span> {goal}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Today's Quest */}
      {quest && (
        <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
          <Swords className="w-4 h-4 text-orange-400" />
          <div className="text-sm">
            <span className="text-orange-400 font-medium">{quest.id}</span>
            <span className="text-slate-400"> — {quest.title}</span>
          </div>
        </div>
      )}

      {/* High Intensity Warning */}
      {isHighIntensity && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">
            고난이도 구간입니다. 이 시기는 원래 모두가 어려워합니다. 완벽하지 않아도 괜찮아요!
          </p>
        </div>
      )}

      {/* Next Quest */}
      {nextQuest && !quest && (
        <div className="text-xs text-slate-500">
          다음 퀘스트까지 {nextQuest.days}일 ({nextQuest.quest.questId})
        </div>
      )}
    </div>
  );
}

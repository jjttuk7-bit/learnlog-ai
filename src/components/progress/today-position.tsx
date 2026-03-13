"use client";

import { getCourseProgress, getCurrentModule, getTodayCurriculum, getDaysUntilNextQuest } from "@/lib/curriculum";
import { MODULE_DETAILS } from "@/data/module-details";
import { MapPin, Target, Calendar, Wrench } from "lucide-react";

export function TodayPosition() {
  const progress = getCourseProgress();
  const currentModule = getCurrentModule();
  const today = getTodayCurriculum();
  const nextQuest = getDaysUntilNextQuest();
  const detail = currentModule ? MODULE_DETAILS[currentModule.name] : null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/[0.06] ring-1 ring-white/[0.06] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4" />
            현재 위치
          </div>
          <div className="text-4xl font-bold mt-1">
            Day {progress.currentDay ?? "-"}
            <span className="text-lg text-slate-400"> / {progress.totalDays}</span>
          </div>
        </div>
        {nextQuest && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Target className="w-3 h-3" />
              다음 퀘스트까지
            </div>
            <div className="text-lg font-bold text-yellow-400">{nextQuest.days}일</div>
            <div className="text-xs text-slate-500">{nextQuest.quest.questId}</div>
          </div>
        )}
      </div>

      {currentModule && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
          <div className="text-blue-400 font-semibold">{currentModule.name}</div>
          <p className="text-xs text-slate-400">{currentModule.description}</p>
          {detail && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Wrench className="w-3 h-3 text-cyan-400/60" />
              {detail.tools.slice(0, 4).map((tool) => (
                <span key={tool} className="text-[10px] bg-cyan-500/10 text-cyan-400/70 px-1.5 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {detail.tools.length > 4 && (
                <span className="text-[10px] text-slate-600">+{detail.tools.length - 4}</span>
              )}
            </div>
          )}
        </div>
      )}

      {today && (
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
          <Calendar className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <div className="text-xs text-slate-400">오늘의 학습</div>
            <div className="text-sm font-medium text-slate-200">{today.topic}</div>
          </div>
          {today.questId && (
            <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">
              {today.questId}
            </span>
          )}
        </div>
      )}

      <div className="w-full bg-white/[0.06] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{progress.percentage}% 완료</span>
        <span>{progress.daysRemaining}일 남음</span>
      </div>
    </div>
  );
}

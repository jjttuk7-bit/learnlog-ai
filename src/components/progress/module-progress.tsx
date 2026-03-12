"use client";

import { useState } from "react";
import { MODULES, CURRICULUM } from "@/data/curriculum";
import { KEY_POINTS } from "@/data/key-points";
import { getCurrentModule } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, BookOpen, Swords, Target, Tag, X } from "lucide-react";

export function ModuleProgress() {
  const current = getCurrentModule();
  const todayStr = new Date().toISOString().split("T")[0];
  const [expanded, setExpanded] = useState<string | null>(current?.name ?? null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function toggle(name: string) {
    setExpanded(expanded === name ? null : name);
    setSelectedDay(null);
  }

  const selectedCurriculum = selectedDay
    ? CURRICULUM.find((d) => d.dayNumber === selectedDay)
    : null;
  const selectedKeyPoints = selectedCurriculum
    ? KEY_POINTS[selectedCurriculum.topic]
    : null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">모듈 타임라인</h2>

      {/* 핵심 학습 내용 패널 */}
      {selectedCurriculum && (
        <div className="bg-slate-800 rounded-xl border border-blue-500/30 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-slate-500">Day {selectedCurriculum.dayNumber} · {selectedCurriculum.date}</div>
              <h3 className="text-lg font-semibold text-slate-100 mt-1">{selectedCurriculum.topic}</h3>
              <div className="text-sm text-blue-400 mt-0.5">{selectedCurriculum.module}</div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedKeyPoints ? (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">학습 목표</span>
                </div>
                <ul className="space-y-1.5">
                  {selectedKeyPoints.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">핵심 키워드</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedKeyPoints.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-md"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">이 토픽의 상세 학습 내용은 준비 중입니다.</p>
          )}

          {selectedCurriculum.questId && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <Swords className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">
                {selectedCurriculum.questId} ({selectedCurriculum.questType === "main" ? "Main Quest" : "Sub Quest"})
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {MODULES.map((mod) => {
          const isCurrent = current?.name === mod.name;
          const isPast = new Date(mod.endDate) < new Date();
          const isFuture = new Date(mod.startDate) > new Date();
          const isExpanded = expanded === mod.name;
          const moduleDays = CURRICULUM.filter((d) => d.module === mod.name);
          const difficultyStars = "⭐".repeat(mod.difficulty);

          return (
            <div
              key={mod.name}
              className={`rounded-xl border transition-colors ${
                isCurrent
                  ? "bg-blue-500/10 border-blue-500/30"
                  : isPast
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <button
                onClick={() => toggle(mod.name)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    {isCurrent && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                        진행중
                      </Badge>
                    )}
                    {isPast && (
                      <Badge variant="outline" className="text-green-400 border-green-500/30 text-[10px]">
                        완료
                      </Badge>
                    )}
                    {isFuture && (
                      <Badge variant="outline" className="text-slate-500 border-slate-600 text-[10px]">
                        예정
                      </Badge>
                    )}
                    <span className={`text-sm font-medium ${isPast ? "text-slate-500" : "text-slate-200"}`}>
                      {mod.name}
                    </span>
                  </div>
                  <span className="text-xs">{difficultyStars}</span>
                </div>
                <div className="ml-6 mt-1">
                  <p className="text-xs text-slate-400">{mod.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{mod.totalDays}일</span>
                    <span>{mod.startDate} ~ {mod.endDate}</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="ml-6 space-y-1 border-l-2 border-slate-700 pl-4">
                    {moduleDays.map((day) => {
                      const isToday = day.date === todayStr;
                      const isDayPast = new Date(day.date) < new Date() && !isToday;
                      const isSelected = selectedDay === day.dayNumber;
                      const hasKeyPoints = !!KEY_POINTS[day.topic];

                      return (
                        <button
                          key={day.dayNumber}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(isSelected ? null : day.dayNumber);
                          }}
                          className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm text-left transition-colors ${
                            isSelected
                              ? "bg-blue-500/20 border border-blue-500/30"
                              : isToday
                              ? "bg-blue-500/10 border border-blue-500/20"
                              : isDayPast
                              ? "text-slate-500 hover:bg-slate-700/50"
                              : "text-slate-300 hover:bg-slate-700/50"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected
                              ? "bg-blue-400"
                              : isToday
                              ? "bg-blue-400"
                              : isDayPast
                              ? "bg-green-500/50"
                              : "bg-slate-600"
                          }`} />
                          <span className="text-xs text-slate-500 w-14 shrink-0">
                            Day {day.dayNumber}
                          </span>
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <BookOpen className={`w-3 h-3 shrink-0 ${
                              isSelected || isToday ? "text-blue-400" : "text-slate-600"
                            }`} />
                            <span className={`truncate ${
                              isSelected ? "text-blue-300 font-medium" : isToday ? "text-blue-300 font-medium" : ""
                            }`}>
                              {day.topic}
                            </span>
                          </div>
                          {hasKeyPoints && (
                            <span className="text-[10px] text-slate-600 shrink-0">📋</span>
                          )}
                          {day.questId && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                              day.questType === "main"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-slate-700 text-slate-400"
                            }`}>
                              <Swords className="w-3 h-3 inline mr-0.5" />
                              {day.questId}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MODULES, CURRICULUM } from "@/data/curriculum";
import { KEY_POINTS } from "@/data/key-points";
import { MODULE_DETAILS } from "@/data/module-details";
import { getCurrentModule } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, BookOpen, Swords, Target, Tag, X, Wrench, FlaskConical, Table2, Users, ClipboardCheck } from "lucide-react";

export function ModuleProgress() {
  const current = getCurrentModule();
  const todayStr = new Date().toISOString().split("T")[0];
  const [expanded, setExpanded] = useState<string | null>(current?.name ?? null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);

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

  const detailModule = showDetail ? MODULE_DETAILS[showDetail] : null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">모듈 타임라인</h2>

      {/* 모듈 상세 정보 패널 */}
      {detailModule && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 space-y-4 ring-1 ring-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{detailModule.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">커리큘럼 상세 정보</p>
            </div>
            <button
              onClick={() => setShowDetail(null)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 학습 목표 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">학습 목표</span>
            </div>
            <ul className="space-y-1">
              {detailModule.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-500 mt-0.5 shrink-0">•</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* 도구/기술 스택 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">도구 & 기술 스택</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detailModule.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded-md"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* 실습 프로젝트 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">실습 프로젝트</span>
            </div>
            <ul className="space-y-1">
              {detailModule.practiceProjects.map((proj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-500 mt-0.5 shrink-0">{i + 1}.</span>
                  {proj}
                </li>
              ))}
            </ul>
          </div>

          {/* 핵심 개념 테이블 */}
          {detailModule.keyConceptTable && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Table2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">핵심 개념</span>
              </div>
              <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                {detailModule.keyConceptTable.map((row, i) => (
                  <div key={i} className={`flex text-xs ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                    <div className="w-28 shrink-0 px-3 py-2 font-medium text-slate-300 border-r border-white/[0.06]">
                      {row.area}
                    </div>
                    <div className="flex-1 px-3 py-2 text-slate-400">{row.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 팀 역할 (DLthon) */}
          {detailModule.teamRoles && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">팀 역할</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detailModule.teamRoles.map((role) => (
                  <span key={role} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-md">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 평가 기준 */}
          {detailModule.evaluationCriteria && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ClipboardCheck className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-rose-400">평가 기준</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detailModule.evaluationCriteria.map((c) => (
                  <span key={c} className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-1 rounded-md">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 스프린트 계획 (파이널 프로젝트) */}
          {detailModule.sprintPlan && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Table2 className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">스프린트 계획</span>
              </div>
              <div className="space-y-2">
                {detailModule.sprintPlan.map((sp, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.06]">
                    <div className="text-xs font-medium text-orange-300">{sp.sprint}</div>
                    <div className="text-xs text-slate-400 mt-1">{sp.tasks}</div>
                    <div className="text-[10px] text-slate-500 mt-1">산출물: {sp.deliverables}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 핵심 학습 내용 패널 (일별) */}
      {selectedCurriculum && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-blue-500/30 p-5 space-y-4">
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
          const detail = MODULE_DETAILS[mod.name];

          return (
            <div
              key={mod.name}
              className={`rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/10"
                  : isPast
                  ? "bg-white/[0.02] border-white/[0.04]"
                  : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]"
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
                  {/* 도구 태그 미리보기 */}
                  {detail && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {detail.tools.slice(0, 5).map((tool) => (
                        <span key={tool} className="text-[10px] bg-cyan-500/10 text-cyan-400/70 px-1.5 py-0.5 rounded">
                          {tool}
                        </span>
                      ))}
                      {detail.tools.length > 5 && (
                        <span className="text-[10px] text-slate-600">+{detail.tools.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  {/* 모듈 상세 보기 버튼 */}
                  {detail && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetail(showDetail === mod.name ? null : mod.name);
                      }}
                      className="mb-3 ml-6 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/15 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {showDetail === mod.name ? "상세 정보 닫기" : "모듈 상세 정보 보기"}
                    </button>
                  )}

                  <div className="ml-6 space-y-1 border-l-2 border-white/[0.06] pl-4">
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
                              ? "text-slate-500 hover:bg-white/[0.03]"
                              : "text-slate-300 hover:bg-white/[0.03]"
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
                                : "bg-white/[0.04] text-slate-400"
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

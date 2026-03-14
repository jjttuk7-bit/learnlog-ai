"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { STAGES, STAGE1_EXERCISES, AI_TRAINING_TIPS } from "@/data/question-training";
import {
  Brain, ChevronLeft, ChevronRight, CheckCircle2, Lock,
  Lightbulb, ClipboardList, MessageCircle, Sparkles, BookOpen,
  PenLine, Star, Save, Loader2,
} from "lucide-react";

interface DayRecord {
  record: string;
  best_question: string;
  reflection: string;
  completed: boolean;
}

const emptyRecord: DayRecord = { record: "", best_question: "", reflection: "", completed: false };

export default function QuestionTrainingPage() {
  const [currentStage, setCurrentStage] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [records, setRecords] = useState<Record<number, DayRecord>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stage = STAGES.find((s) => s.id === currentStage)!;
  const exercise = STAGE1_EXERCISES.find((e) => e.day === currentDay);
  const currentRecord = records[currentDay] || emptyRecord;
  const completedDays = Object.entries(records).filter(([, r]) => r.completed).map(([d]) => parseInt(d));

  // 전체 기록 로드
  useEffect(() => {
    async function loadAll() {
      try {
        const res = await fetch("/api/question-training");
        const data = await res.json();
        if (data.records) {
          const map: Record<number, DayRecord> = {};
          for (const r of data.records) {
            map[r.day_number] = {
              record: r.record || "",
              best_question: r.best_question || "",
              reflection: r.reflection || "",
              completed: r.completed || false,
            };
          }
          setRecords(map);
        }
      } catch { /* 로그인 안 된 경우 등 무시 */ }
      setLoadingRecords(false);
    }
    loadAll();
  }, []);

  // 저장 함수
  const saveRecord = useCallback(async (day: number, data: DayRecord) => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/question-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_number: day,
          record: data.record,
          best_question: data.best_question,
          reflection: data.reflection,
          completed: data.completed,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  }, []);

  // 필드 업데이트 + 자동 저장 (2초 디바운스)
  function updateField(field: keyof DayRecord, value: string | boolean) {
    const updated = { ...currentRecord, [field]: value };
    setRecords((prev) => ({ ...prev, [currentDay]: updated }));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveRecord(currentDay, updated);
    }, 2000);
  }

  // 완료 토글
  function toggleComplete() {
    const updated = { ...currentRecord, completed: !currentRecord.completed };
    setRecords((prev) => ({ ...prev, [currentDay]: updated }));
    saveRecord(currentDay, updated);
  }

  // 즉시 저장
  function handleSaveNow() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveRecord(currentDay, currentRecord);
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Brain className="w-4 h-4" />
          질문근육 트레이닝
        </div>
        <h1 className="text-2xl font-bold">질문하는 사람이 AI 시대의 승자다</h1>
        <p className="text-slate-400 mt-1 text-sm">질문의 깊이 = 결과의 깊이. 8단계로 질문근육을 키우세요.</p>
      </div>

      {/* 8단계 로드맵 */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">전체 로드맵</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAGES.map((s) => {
            const isActive = s.id === currentStage;
            const stageCompleted = s.id === 1 && completedDays.length >= 12;
            return (
              <button
                key={s.id}
                onClick={() => s.available && setCurrentStage(s.id)}
                disabled={!s.available}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/10"
                    : s.available
                    ? "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                    : "bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-xs font-medium text-slate-200">{s.id}단계</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.name}</div>
                {!s.available && <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-600" />}
                {stageCompleted && <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-green-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 현재 단계 정보 */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{stage.emoji}</div>
          <div>
            <h2 className="text-lg font-semibold">{stage.id}단계: {stage.name}</h2>
            <p className="text-sm text-slate-400">{stage.coreSkill}</p>
          </div>
          <span className="ml-auto text-xs text-slate-500 bg-white/[0.04] px-2 py-1 rounded">{stage.duration}</span>
        </div>

        {stage.id === 1 && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{completedDays.length}/14일 완료</span>
              <span>{Math.round((completedDays.length / 14) * 100)}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all"
                style={{ width: `${(completedDays.length / 14) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 데일리 네비게이터 (1단계) */}
      {stage.id === 1 && (
        <>
          {/* Day 선택 */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300">Week {currentDay <= 7 ? 1 : 2}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay <= 1}
                  className="p-1 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold w-16 text-center">Day {currentDay}</span>
                <button
                  onClick={() => setCurrentDay(Math.min(14, currentDay + 1))}
                  disabled={currentDay >= 14}
                  className="p-1 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {STAGE1_EXERCISES.map((ex) => {
                const done = completedDays.includes(ex.day);
                const hasRecord = !!(records[ex.day]?.record || records[ex.day]?.best_question);
                const active = ex.day === currentDay;
                return (
                  <button
                    key={ex.day}
                    onClick={() => setCurrentDay(ex.day)}
                    className={`relative flex flex-col items-center py-2 rounded-lg text-xs transition-all ${
                      active
                        ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                        : done
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : hasRecord
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                        : "bg-white/[0.02] border border-white/[0.06] text-slate-500 hover:border-white/[0.1]"
                    }`}
                  >
                    <span className="font-medium">{ex.day}</span>
                    {done ? <CheckCircle2 className="w-3 h-3 mt-0.5" /> : hasRecord ? <PenLine className="w-3 h-3 mt-0.5" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 오늘의 훈련 */}
          {exercise && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Day {exercise.day} · Week {exercise.week}</div>
                    <h3 className="text-lg font-semibold text-slate-100 mt-1">{exercise.title}</h3>
                  </div>
                  <button
                    onClick={toggleComplete}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      currentRecord.completed
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/[0.15]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentRecord.completed ? "완료!" : "완료 체크"}
                  </button>
                </div>

                {/* 개념 */}
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">오늘의 개념</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{exercise.concept}</p>
                </div>

                {/* 훈련 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ClipboardList className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">오늘의 훈련</span>
                  </div>
                  <ol className="space-y-2">
                    {exercise.training.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-green-500 font-medium shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 기록 양식 */}
                {exercise.recordTemplate && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">기록 양식</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{exercise.recordTemplate}</p>
                  </div>
                )}

                {/* 예시 */}
                {exercise.example && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400">예시</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-line">{exercise.example}</p>
                  </div>
                )}

                {/* 팁 */}
                {exercise.tip && (
                  <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.02] rounded-lg p-3">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p>{exercise.tip}</p>
                  </div>
                )}
              </div>

              {/* 나의 기록 */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-slate-300">나의 기록</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {saving && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> 저장 중...
                      </span>
                    )}
                    {saved && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> 저장됨
                      </span>
                    )}
                    <button
                      onClick={handleSaveNow}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1.5 rounded-lg border border-white/[0.08] transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> 저장
                    </button>
                  </div>
                </div>

                {loadingRecords ? (
                  <div className="text-center py-4 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                    기록 불러오는 중...
                  </div>
                ) : (
                  <>
                    {/* 훈련 기록 */}
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">훈련 기록</label>
                      <textarea
                        value={currentRecord.record}
                        onChange={(e) => updateField("record", e.target.value)}
                        placeholder={exercise.recordTemplate || "오늘의 훈련 내용을 자유롭게 기록하세요..."}
                        rows={5}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 resize-y transition-all"
                      />
                    </div>

                    {/* 오늘의 베스트 질문 */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <Star className="w-3 h-3 text-yellow-400" />
                        오늘의 베스트 질문
                      </label>
                      <textarea
                        value={currentRecord.best_question}
                        onChange={(e) => updateField("best_question", e.target.value)}
                        placeholder="오늘 만든 질문 중 가장 마음에 드는 질문을 적어보세요..."
                        rows={2}
                        className="w-full bg-yellow-500/[0.03] border border-yellow-500/10 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/30 focus:ring-1 focus:ring-yellow-500/20 resize-y transition-all"
                      />
                    </div>

                    {/* 회고 */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <Lightbulb className="w-3 h-3 text-purple-400" />
                        오늘의 발견 / 회고
                      </label>
                      <textarea
                        value={currentRecord.reflection}
                        onChange={(e) => updateField("reflection", e.target.value)}
                        placeholder="훈련을 하며 느낀 점, 발견한 것, 어려웠던 점을 적어보세요..."
                        rows={3}
                        className="w-full bg-purple-500/[0.03] border border-purple-500/10 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 resize-y transition-all"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 네비게이션 */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay <= 1}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전 Day
                </button>
                <button
                  onClick={() => setCurrentDay(Math.min(14, currentDay + 1))}
                  disabled={currentDay >= 14}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  다음 Day <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* AI 활용 팁 */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-300">AI와 함께하는 질문근육 훈련법</h3>
            </div>
            <div className="space-y-2">
              {AI_TRAINING_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-3 border border-white/[0.06]">
                  <span className="text-xs font-medium text-cyan-400 shrink-0 w-24">{tip.method}</span>
                  <p className="text-xs text-slate-400">&ldquo;{tip.prompt}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* 졸업 체크리스트 */}
          {stage.graduationCriteria && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">1단계 졸업 기준 (8개 중 6개 이상)</h3>
              <div className="space-y-2">
                {stage.graduationCriteria.map((criteria, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-green-500 shrink-0" />
                    <span>{criteria}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 미개방 단계 안내 */}
      {stage.id > 1 && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06] p-8 text-center space-y-3">
          <Lock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-400">{stage.id}단계: {stage.name}</p>
          <p className="text-sm text-slate-500">{stage.coreSkill}</p>
          <p className="text-xs text-slate-600">이전 단계를 완료하면 열립니다</p>
        </div>
      )}
    </div>
  );
}

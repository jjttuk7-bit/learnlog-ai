"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, ChevronLeft, ChevronRight, Save, Loader2, CheckCircle } from "lucide-react";
import { getTodayCurriculum, getCurriculumByDay } from "@/lib/curriculum";
import { toast } from "sonner";

type Tab = "daily" | "weekly";

interface DailyPlan {
  morning_concepts: string;
  morning_points: string;
  afternoon_concepts: string;
  afternoon_points: string;
  error_situation: string;
  error_cause: string;
  error_solution: string;
  code_memo: string;
  summary_1: string;
  summary_2: string;
  summary_3: string;
  understanding: string;
  mood: string;
  note: string;
  tomorrow_plan: string;
}

interface WeeklyReview {
  daily_summaries: { day: string; content: string; error: string; understanding: string; mood: string }[];
  key_code: string;
  reflection_good: string;
  reflection_bad: string;
  reflection_improve: string;
  next_week_goals: string;
  github_commits: number;
  blog_posts: number;
  til_count: number;
}

const emptyDaily: DailyPlan = {
  morning_concepts: "", morning_points: "",
  afternoon_concepts: "", afternoon_points: "",
  error_situation: "", error_cause: "", error_solution: "",
  code_memo: "",
  summary_1: "", summary_2: "", summary_3: "",
  understanding: "", mood: "", note: "", tomorrow_plan: "",
};

const DAYS_LABEL = ["MON", "TUE", "WED", "THU", "FRI"];

function emptyWeekly(): WeeklyReview {
  return {
    daily_summaries: DAYS_LABEL.map((d) => ({ day: d, content: "", error: "", understanding: "", mood: "" })),
    key_code: "",
    reflection_good: "", reflection_bad: "", reflection_improve: "",
    next_week_goals: "",
    github_commits: 0, blog_posts: 0, til_count: 0,
  };
}

export default function PlannerPage() {
  const today = getTodayCurriculum();
  const [tab, setTab] = useState<Tab>("daily");

  // Daily state
  const [dayNumber, setDayNumber] = useState(today?.dayNumber ?? 1);
  const [daily, setDaily] = useState<DailyPlan>(emptyDaily);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailySaving, setDailySaving] = useState(false);
  const [dailySaved, setDailySaved] = useState(false);

  // Weekly state
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekly, setWeekly] = useState<WeeklyReview>(emptyWeekly());
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklySaving, setWeeklySaving] = useState(false);
  const [weeklySaved, setWeeklySaved] = useState(false);

  const currentDay = getCurriculumByDay(dayNumber);

  // Calculate initial week from today
  useEffect(() => {
    if (today) {
      setWeekNumber(Math.ceil(today.dayNumber / 5));
    }
  }, [today]);

  // Load daily plan
  const loadDaily = useCallback(async (day: number) => {
    setDailyLoading(true);
    setDailySaved(false);
    try {
      const res = await fetch(`/api/planner/daily?day=${day}`);
      const data = await res.json();
      if (data.plan) {
        setDaily({
          morning_concepts: data.plan.morning_concepts || "",
          morning_points: data.plan.morning_points || "",
          afternoon_concepts: data.plan.afternoon_concepts || "",
          afternoon_points: data.plan.afternoon_points || "",
          error_situation: data.plan.error_situation || "",
          error_cause: data.plan.error_cause || "",
          error_solution: data.plan.error_solution || "",
          code_memo: data.plan.code_memo || "",
          summary_1: data.plan.summary_1 || "",
          summary_2: data.plan.summary_2 || "",
          summary_3: data.plan.summary_3 || "",
          understanding: data.plan.understanding || "",
          mood: data.plan.mood || "",
          note: data.plan.note || "",
          tomorrow_plan: data.plan.tomorrow_plan || "",
        });
      } else {
        setDaily(emptyDaily);
      }
    } catch { setDaily(emptyDaily); }
    setDailyLoading(false);
  }, []);

  // Load weekly review
  const loadWeekly = useCallback(async (week: number) => {
    setWeeklyLoading(true);
    setWeeklySaved(false);
    try {
      const res = await fetch(`/api/planner/weekly?week=${week}`);
      const data = await res.json();
      if (data.review) {
        setWeekly({
          daily_summaries: data.review.daily_summaries || emptyWeekly().daily_summaries,
          key_code: data.review.key_code || "",
          reflection_good: data.review.reflection_good || "",
          reflection_bad: data.review.reflection_bad || "",
          reflection_improve: data.review.reflection_improve || "",
          next_week_goals: data.review.next_week_goals || "",
          github_commits: data.review.github_commits || 0,
          blog_posts: data.review.blog_posts || 0,
          til_count: data.review.til_count || 0,
        });
      } else {
        setWeekly(emptyWeekly());
      }
    } catch { setWeekly(emptyWeekly()); }
    setWeeklyLoading(false);
  }, []);

  useEffect(() => { loadDaily(dayNumber); }, [dayNumber, loadDaily]);
  useEffect(() => { loadWeekly(weekNumber); }, [weekNumber, loadWeekly]);

  // Save daily
  async function saveDaily() {
    setDailySaving(true);
    try {
      const res = await fetch("/api/planner/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_number: dayNumber,
          plan_date: currentDay?.date || new Date().toISOString().slice(0, 10),
          module: currentDay?.module || "",
          topic: currentDay?.topic || "",
          ...daily,
        }),
      });
      if (res.ok) {
        setDailySaved(true);
        toast.success("저장되었습니다!");
      } else {
        toast.error("저장 실패");
      }
    } catch { toast.error("저장 실패"); }
    setDailySaving(false);
  }

  // Save weekly
  async function saveWeekly() {
    setWeeklySaving(true);
    try {
      const startDay = (weekNumber - 1) * 5 + 1;
      const weekDayCurriculum = getCurriculumByDay(startDay);
      const res = await fetch("/api/planner/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_number: weekNumber,
          module: weekDayCurriculum?.module || "",
          ...weekly,
        }),
      });
      if (res.ok) {
        setWeeklySaved(true);
        toast.success("저장되었습니다!");
      } else {
        toast.error("저장 실패");
      }
    } catch { toast.error("저장 실패"); }
    setWeeklySaving(false);
  }

  const dayLabel = currentDay
    ? `${currentDay.date.replace(/-/g, ".")} (${["일","월","화","수","목","금","토"][new Date(currentDay.date).getDay()]})`
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">학습 플래너</h1>
        </div>
        <p className="text-slate-400 mt-1">매일의 기록이 6개월 후 나의 실력이 됩니다</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "daily"
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
              : "bg-white/[0.02] text-slate-400 border border-white/[0.06] hover:text-white"
          }`}
        >
          데일리 플래너
        </button>
        <button
          onClick={() => setTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "weekly"
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
              : "bg-white/[0.02] text-slate-400 border border-white/[0.06] hover:text-white"
          }`}
        >
          위클리 리뷰
        </button>
      </div>

      {/* ===== DAILY PLANNER ===== */}
      {tab === "daily" && (
        <div className="space-y-5">
          {/* Day Navigator */}
          <div className="flex items-center justify-between bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
            <button
              onClick={() => setDayNumber(Math.max(1, dayNumber - 1))}
              disabled={dayNumber <= 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                DAY <span className="text-teal-400">{dayNumber}</span> / 130
              </div>
              <div className="text-sm text-slate-400 mt-0.5">{dayLabel}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentDay?.module && `${currentDay.module}`}
                {currentDay?.topic && ` · ${currentDay.topic}`}
              </div>
            </div>
            <button
              onClick={() => setDayNumber(Math.min(130, dayNumber + 1))}
              disabled={dayNumber >= 130}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {dailyLoading ? (
            <div className="text-center py-12 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
          ) : (
            <>
              {/* Morning Class */}
              <Section emoji="☀️" title="오전 수업 (10:00~13:00)">
                <Field label="핵심 개념" value={daily.morning_concepts} onChange={(v) => setDaily({ ...daily, morning_concepts: v })} />
                <Field label="중요 포인트" value={daily.morning_points} onChange={(v) => setDaily({ ...daily, morning_points: v })} />
              </Section>

              {/* Afternoon Class */}
              <Section emoji="🌙" title="오후 수업 (14:00~18:00)">
                <Field label="핵심 개념" value={daily.afternoon_concepts} onChange={(v) => setDaily({ ...daily, afternoon_concepts: v })} />
                <Field label="중요 포인트" value={daily.afternoon_points} onChange={(v) => setDaily({ ...daily, afternoon_points: v })} />
              </Section>

              {/* Error */}
              <Section emoji="🐛" title="에러 / 막힌 부분">
                <Field label="에러 상황" value={daily.error_situation} onChange={(v) => setDaily({ ...daily, error_situation: v })} />
                <Field label="원인" value={daily.error_cause} onChange={(v) => setDaily({ ...daily, error_cause: v })} />
                <Field label="해결 방법" value={daily.error_solution} onChange={(v) => setDaily({ ...daily, error_solution: v })} />
              </Section>

              {/* Code Memo */}
              <Section emoji="💻" title="핵심 코드 메모">
                <textarea
                  value={daily.code_memo}
                  onChange={(e) => setDaily({ ...daily, code_memo: e.target.value })}
                  placeholder="오늘 배운 가장 중요한 코드를 직접 적어보세요..."
                  className="w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono text-sm min-h-[100px] resize-y"
                />
              </Section>

              {/* Summary */}
              <Section emoji="⭐" title="오늘의 핵심 3줄 요약">
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-teal-400 font-bold text-sm w-4">{n}</span>
                      <input
                        type="text"
                        value={daily[`summary_${n}` as keyof DailyPlan]}
                        onChange={(e) => setDaily({ ...daily, [`summary_${n}`]: e.target.value })}
                        placeholder={`핵심 요약 ${n}`}
                        className="flex-1 bg-slate-900/50 border border-white/[0.06] rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </Section>

              {/* Understanding & Mood */}
              <Section emoji="📊" title="이해도 & 컨디션 체크">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block">오늘 수업 이해도</label>
                    <div className="flex gap-2">
                      {[
                        { value: "high", label: "상 (80%↑)", color: "emerald" },
                        { value: "mid", label: "중 (50~80%)", color: "amber" },
                        { value: "low", label: "하 (50%↓)", color: "red" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDaily({ ...daily, understanding: opt.value })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            daily.understanding === opt.value
                              ? opt.color === "emerald" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : opt.color === "amber" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block">오늘의 기분/에너지</label>
                    <div className="flex gap-2">
                      {[
                        { value: "good", emoji: "😊", label: "좋음" },
                        { value: "normal", emoji: "😐", label: "보통" },
                        { value: "tired", emoji: "😫", label: "힘듦" },
                        { value: "fire", emoji: "🔥", label: "의욕충만" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDaily({ ...daily, mood: opt.value })}
                          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-sm border transition-colors ${
                            daily.mood === opt.value
                              ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                              : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
                          }`}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <span className="text-[10px]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="한마디" value={daily.note} onChange={(v) => setDaily({ ...daily, note: v })} placeholder="오늘의 소감..." />
                </div>
              </Section>

              {/* Tomorrow */}
              <Section emoji="📌" title="내일 할 일 / 예습">
                <Field label="" value={daily.tomorrow_plan} onChange={(v) => setDaily({ ...daily, tomorrow_plan: v })} placeholder="내일 예습할 내용, 복습할 부분..." multiline />
              </Section>

              {/* Save */}
              <button
                onClick={saveDaily}
                disabled={dailySaving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-xl px-4 py-3.5 transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]"
              >
                {dailySaving ? <Loader2 className="w-5 h-5 animate-spin" /> : dailySaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {dailySaving ? "저장 중..." : dailySaved ? "저장 완료!" : "저장하기"}
              </button>

              {/* Motivational quote */}
              <p className="text-center text-xs text-slate-600 italic">
                &quot;어제의 나보다 한 줄이라도 더 이해했다면, 오늘은 성공한 날이다.&quot;
              </p>
            </>
          )}
        </div>
      )}

      {/* ===== WEEKLY REVIEW ===== */}
      {tab === "weekly" && (
        <div className="space-y-5">
          {/* Week Navigator */}
          <div className="flex items-center justify-between bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
            <button
              onClick={() => setWeekNumber(Math.max(1, weekNumber - 1))}
              disabled={weekNumber <= 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                WEEK <span className="text-teal-400">{weekNumber}</span> / 26
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {(() => { const d = getCurriculumByDay((weekNumber - 1) * 5 + 1); return d?.module || ""; })()}
              </div>
            </div>
            <button
              onClick={() => setWeekNumber(Math.min(26, weekNumber + 1))}
              disabled={weekNumber >= 26}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {weeklyLoading ? (
            <div className="text-center py-12 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
          ) : (
            <>
              {/* Daily Summaries Table */}
              <Section emoji="📋" title="이번 주 요약">
                <div className="space-y-3">
                  {weekly.daily_summaries.map((ds, i) => (
                    <div key={i} className="bg-slate-900/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400 w-8">{ds.day}</span>
                        <div className="flex gap-1">
                          {["high", "mid", "low"].map((u) => (
                            <button
                              key={u}
                              onClick={() => {
                                const updated = [...weekly.daily_summaries];
                                updated[i] = { ...updated[i], understanding: u };
                                setWeekly({ ...weekly, daily_summaries: updated });
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                ds.understanding === u
                                  ? u === "high" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : u === "mid" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-white/[0.02] text-slate-500 border-white/[0.06]"
                              }`}
                            >
                              {u === "high" ? "상" : u === "mid" ? "중" : "하"}
                            </button>
                          ))}
                          <div className="flex gap-0.5 ml-1">
                            {["😊", "😐", "😫", "🔥"].map((m) => (
                              <button
                                key={m}
                                onClick={() => {
                                  const updated = [...weekly.daily_summaries];
                                  updated[i] = { ...updated[i], mood: m };
                                  setWeekly({ ...weekly, daily_summaries: updated });
                                }}
                                className={`text-sm px-0.5 rounded transition-opacity ${ds.mood === m ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={ds.content}
                        onChange={(e) => {
                          const updated = [...weekly.daily_summaries];
                          updated[i] = { ...updated[i], content: e.target.value };
                          setWeekly({ ...weekly, daily_summaries: updated });
                        }}
                        placeholder="배운 핵심 내용"
                        className="w-full bg-transparent border-b border-white/[0.06] pb-1 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50"
                      />
                      <input
                        type="text"
                        value={ds.error}
                        onChange={(e) => {
                          const updated = [...weekly.daily_summaries];
                          updated[i] = { ...updated[i], error: e.target.value };
                          setWeekly({ ...weekly, daily_summaries: updated });
                        }}
                        placeholder="에러/어려운 점"
                        className="w-full bg-transparent border-b border-white/[0.06] pb-1 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  ))}
                </div>
              </Section>

              {/* Key Code */}
              <Section emoji="💻" title="이번 주 핵심 코드 & 명령어 모음">
                <textarea
                  value={weekly.key_code}
                  onChange={(e) => setWeekly({ ...weekly, key_code: e.target.value })}
                  placeholder="이번 주에 배운 핵심 코드와 명령어를 정리하세요..."
                  className="w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono text-sm min-h-[100px] resize-y"
                />
              </Section>

              {/* Reflection */}
              <Section emoji="🔍" title="주간 회고">
                <Field label="잘한 점" value={weekly.reflection_good} onChange={(v) => setWeekly({ ...weekly, reflection_good: v })} />
                <Field label="부족한 점" value={weekly.reflection_bad} onChange={(v) => setWeekly({ ...weekly, reflection_bad: v })} />
                <Field label="다음 주 개선할 것" value={weekly.reflection_improve} onChange={(v) => setWeekly({ ...weekly, reflection_improve: v })} />
              </Section>

              {/* Next Week */}
              <Section emoji="📌" title="다음 주 목표 & 예습">
                <Field label="" value={weekly.next_week_goals} onChange={(v) => setWeekly({ ...weekly, next_week_goals: v })} placeholder="다음 주 학습 목표..." multiline />
              </Section>

              {/* Stats */}
              <Section emoji="📈" title="이번 주 활동 기록">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">GitHub 커밋</label>
                    <input
                      type="number" min={0}
                      value={weekly.github_commits}
                      onChange={(e) => setWeekly({ ...weekly, github_commits: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">블로그 글</label>
                    <input
                      type="number" min={0}
                      value={weekly.blog_posts}
                      onChange={(e) => setWeekly({ ...weekly, blog_posts: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">TIL 작성</label>
                    <input
                      type="number" min={0}
                      value={weekly.til_count}
                      onChange={(e) => setWeekly({ ...weekly, til_count: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
                    />
                  </div>
                </div>
              </Section>

              {/* Save */}
              <button
                onClick={saveWeekly}
                disabled={weeklySaving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-xl px-4 py-3.5 transition-all hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]"
              >
                {weeklySaving ? <Loader2 className="w-5 h-5 animate-spin" /> : weeklySaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {weeklySaving ? "저장 중..." : weeklySaved ? "저장 완료!" : "저장하기"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable components
function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5 space-y-3">
      <h3 className="flex items-center gap-2 font-semibold text-sm text-slate-200">
        <span>{emoji}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = "w-full bg-slate-900/50 border border-white/[0.06] rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm";
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-slate-500">{label}</label>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || `${label}...`} className={`${cls} min-h-[80px] resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || `${label}...`} className={cls} />
      )}
    </div>
  );
}

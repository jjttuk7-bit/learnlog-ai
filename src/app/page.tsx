import { DailyBrief } from "@/components/dashboard/daily-brief";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StreakCounter } from "@/components/confidence/streak-counter";
import { CompletionGauge } from "@/components/confidence/completion-gauge";
import { WinCards } from "@/components/confidence/win-card";
import { CrisisAlert } from "@/components/confidence/crisis-alert";
import { getTodayCurriculum } from "@/lib/curriculum";

export default function Dashboard() {
  const today = getTodayCurriculum();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">LearnLog AI</h1>
        <p className="text-slate-400 text-sm mt-0.5">AI 메타인지 학습 코칭 대시보드</p>
      </div>

      {/* Daily Brief */}
      <DailyBrief />

      {/* Today Summary + Quick Actions */}
      <TodaySummary />
      <QuickActions />

      {/* Streak + Completion */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCounter streakDays={1} />
        <CompletionGauge percentage={85} />
      </div>

      {/* Crisis Alert (only shown during high-intensity periods) */}
      <CrisisAlert />

      {/* WIN Cards */}
      <WinCards module={today?.module} topic={today?.topic} />
    </div>
  );
}

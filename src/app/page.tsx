import { DailyBrief } from "@/components/dashboard/daily-brief";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StreakCounter } from "@/components/confidence/streak-counter";
import { CompletionGauge } from "@/components/confidence/completion-gauge";
import { SelfRating } from "@/components/confidence/self-rating";
import { WinCards } from "@/components/confidence/win-card";
import { CrisisAlert } from "@/components/confidence/crisis-alert";
import { GrowthTimeline } from "@/components/confidence/growth-timeline";
import { MiniGraph } from "@/components/dashboard/mini-graph";
import { WeeklyReport } from "@/components/dashboard/weekly-report";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { getTodayCurriculum } from "@/lib/curriculum";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

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

      {/* Self Rating */}
      <SelfRating />

      {/* Streak + Completion */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCounter />
        <CompletionGauge percentage={85} />
      </div>

      {/* Crisis Alert (only shown during high-intensity periods) */}
      <CrisisAlert />

      {/* WIN Cards */}
      <WinCards module={today?.module} topic={today?.topic} />

      {/* Growth Evidence Timeline */}
      <GrowthTimeline />

      {/* Mini Knowledge Graph + Portfolio */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MiniGraph />

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">포트폴리오</span>
          </div>
          <p className="text-sm text-slate-400">
            6개월 학습 여정을 AI가 자동으로 정리한 포트폴리오를 만들어보세요
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-sm hover:bg-orange-500/20 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            포트폴리오 만들기
          </Link>
        </div>
      </div>

      {/* Weekly Report */}
      <WeeklyReport />

      {/* Success Metrics */}
      <MetricsPanel />
    </div>
  );
}

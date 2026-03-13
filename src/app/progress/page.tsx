import { TodayPosition } from "@/components/progress/today-position";
import { ModuleProgress } from "@/components/progress/module-progress";
import { Heatmap } from "@/components/progress/heatmap";
import { QuestBadges } from "@/components/progress/quest-badges";
import { LearningPatterns } from "@/components/progress/learning-patterns";
import { UpcomingPreview } from "@/components/progress/upcoming-preview";

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">진도 트래커</h1>
        <p className="text-slate-400 mt-1">6개월 학습 여정을 한눈에</p>
      </div>
      <TodayPosition />
      <UpcomingPreview />
      <LearningPatterns />
      <Heatmap />
      <QuestBadges />
      <ModuleProgress />
    </div>
  );
}

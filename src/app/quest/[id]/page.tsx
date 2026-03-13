"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getQuestById } from "@/data/quests";
import { QuestBriefing } from "@/components/quest/quest-briefing";
import { HintSystem } from "@/components/quest/hint-system";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, FileText, Briefcase, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface GeneratedInsight {
  ideaTitle: string;
  insight: string;
}

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.id as string;
  const quest = getQuestById(questId);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState<GeneratedInsight[]>([]);

  async function generateBusinessInsights() {
    if (!quest || generating) return;
    setGenerating(true);
    try {
      // Fetch active business ideas
      const res = await fetch("/api/business");
      const data = await res.json();
      const activeIdeas = (data.ideas ?? []).filter((i: { status: string }) => i.status !== "paused");

      if (activeIdeas.length === 0) {
        toast.error("활성 비즈니스 아이디어가 없습니다. 먼저 비즈니스 페이지에서 아이디어를 추가하세요.");
        setGenerating(false);
        return;
      }

      // Generate insights for each active idea
      const results: GeneratedInsight[] = [];
      for (const idea of activeIdeas.slice(0, 5)) {
        try {
          const insightRes = await fetch("/api/business/insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ideaId: idea.id,
              skillLearned: quest.title,
              topic: quest.description,
              module: quest.module,
            }),
          });
          const insightData = await insightRes.json();
          if (insightData.insight) {
            results.push({ ideaTitle: idea.title, insight: insightData.insight });
          }
        } catch { /* skip failed */ }
      }

      setInsights(results);
      if (results.length > 0) {
        toast.success(`${results.length}개 비즈니스 인사이트가 생성되었습니다!`);
      }
    } catch {
      toast.error("인사이트 생성에 실패했습니다.");
    }
    setGenerating(false);
  }

  if (!quest) {
    return (
      <div className="text-center py-12 text-slate-400">
        퀘스트를 찾을 수 없습니다.
      </div>
    );
  }

  const typeStyles = {
    sub_b: {
      label: "Sub Quest B",
      className: "bg-slate-600/20 text-slate-300",
    },
    sub_c: {
      label: "Sub Quest C",
      className: "bg-blue-500/20 text-blue-400",
    },
    main: {
      label: "Main Quest",
      className: "bg-yellow-500/20 text-yellow-400",
    },
  };

  const style = typeStyles[quest.type];

  return (
    <div className="space-y-6">
      <Link
        href="/quest"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> 퀘스트 목록
      </Link>

      <div>
        <Badge className={style.className}>{style.label}</Badge>
        <h1 className="text-2xl font-bold mt-2">{quest.title}</h1>
        <p className="text-slate-400 mt-1">
          {quest.module} · {quest.description}
        </p>
      </div>

      <QuestBriefing quest={quest} />

      <div className="border-t border-slate-700 pt-6">
        <HintSystem quest={quest} />
      </div>

      {/* 퀘스트 회고 연결 */}
      <div className="border-t border-slate-700 pt-6 space-y-3">
        <h3 className="font-semibold">퀘스트 회고</h3>
        <p className="text-sm text-slate-400">
          퀘스트에서 다룬 개념을 더 깊이 이해하기 위해 회고해보세요
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/coach/feynman?concept=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            파인만 모드로 회고
          </Link>
          <Link
            href={`/coach/blank-recall?topic=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
          >
            <FileText className="w-4 h-4" />
            백지학습으로 회고
          </Link>
        </div>
      </div>

      {/* 비즈니스 연결 */}
      <div className="border-t border-slate-700 pt-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-violet-400" />
          비즈니스 연결
        </h3>
        <p className="text-sm text-slate-400">
          이 퀘스트에서 다룬 기술이 내 비즈니스 아이디어에 어떻게 활용될 수 있는지 AI가 분석합니다
        </p>
        <Button
          onClick={generateBusinessInsights}
          disabled={generating}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> 인사이트 생성 중...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-1.5" /> 비즈니스 인사이트 생성</>
          )}
        </Button>

        {insights.length > 0 && (
          <div className="space-y-2 mt-3">
            {insights.map((ins, i) => (
              <div key={i} className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 space-y-1">
                <span className="text-xs font-medium text-violet-300">{ins.ideaTitle}</span>
                <p className="text-sm text-slate-300">{ins.insight}</p>
              </div>
            ))}
            <Link
              href="/business"
              className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 mt-2"
            >
              <Briefcase className="w-3.5 h-3.5" />
              비즈니스 페이지에서 자세히 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

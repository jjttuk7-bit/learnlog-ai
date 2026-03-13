"use client";

import { useParams } from "next/navigation";
import { getQuestById } from "@/data/quests";
import { QuestBriefing } from "@/components/quest/quest-briefing";
import { HintSystem } from "@/components/quest/hint-system";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.id as string;
  const quest = getQuestById(questId);

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
    </div>
  );
}

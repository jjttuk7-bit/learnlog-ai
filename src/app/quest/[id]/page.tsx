"use client";

import { useParams } from "next/navigation";
import { getQuestById } from "@/data/quests";
import { QuestBriefing } from "@/components/quest/quest-briefing";
import { HintSystem } from "@/components/quest/hint-system";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
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
    </div>
  );
}

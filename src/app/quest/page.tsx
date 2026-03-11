"use client";

import { useState } from "react";
import { QUESTS } from "@/data/quests";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Code } from "lucide-react";
import Link from "next/link";

type Filter = "all" | "sub_b" | "sub_c" | "main";

export default function QuestPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? QUESTS : QUESTS.filter((q) => q.type === filter);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "전체", count: QUESTS.length },
    {
      value: "sub_b",
      label: "Sub B",
      count: QUESTS.filter((q) => q.type === "sub_b").length,
    },
    {
      value: "sub_c",
      label: "Sub C",
      count: QUESTS.filter((q) => q.type === "sub_c").length,
    },
    {
      value: "main",
      label: "Main",
      count: QUESTS.filter((q) => q.type === "main").length,
    },
  ];

  const typeConfig = {
    sub_b: {
      icon: BookOpen,
      color: "text-slate-400",
      bg: "bg-slate-700/30",
      border: "border-slate-700",
    },
    sub_c: {
      icon: Code,
      color: "text-blue-400",
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
    },
    main: {
      icon: Trophy,
      color: "text-yellow-400",
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/20",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">퀘스트</h1>
        <p className="text-slate-400 mt-1">38개 퀘스트 AI 파트너</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((quest) => {
          const config = typeConfig[quest.type];
          const Icon = config.icon;
          return (
            <Link
              key={quest.id}
              href={`/quest/${quest.id}`}
              className={`flex items-center gap-4 p-4 rounded-xl border ${config.bg} ${config.border} hover:brightness-110 transition-all`}
            >
              <Icon className={`w-5 h-5 ${config.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">
                    {quest.id}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {quest.title}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {quest.module}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

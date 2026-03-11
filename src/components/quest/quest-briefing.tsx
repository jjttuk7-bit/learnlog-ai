"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import type { Quest } from "@/data/quests";

interface Props {
  quest: Quest;
}

export function QuestBriefing({ quest }: Props) {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadBriefing() {
    setLoading(true);
    try {
      const res = await fetch("/api/quest/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          questTitle: quest.title,
          questDescription: quest.description,
          module: quest.module,
        }),
      });
      const data = await res.json();
      setBriefing(data.content);
    } catch {
      setBriefing("브리핑을 불러올 수 없습니다.");
    }
    setLoading(false);
  }

  if (!briefing) {
    return (
      <div className="text-center py-6">
        <Button onClick={loadBriefing} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 브리핑 생성
              중...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" /> AI 브리핑 받기
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 prose prose-invert prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-sm text-slate-200">
        {briefing}
      </div>
    </div>
  );
}

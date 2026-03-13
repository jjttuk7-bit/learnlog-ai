"use client";

import { useState, useEffect } from "react";
import { Briefcase, Sparkles, Loader2 } from "lucide-react";
import { getTodayCurriculum } from "@/lib/curriculum";
import Link from "next/link";

interface Idea {
  id: string;
  title: string;
}

export function BusinessInsightCard() {
  const today = getTodayCurriculum();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedInsights, setGeneratedInsights] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/business");
        const data = await res.json();
        if (data.ideas) {
          const active = data.ideas.filter((i: { status: string }) => i.status !== "paused");
          setIdeas(active.slice(0, 3));
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }
    load();
  }, []);

  if (!loaded || ideas.length === 0 || !today) return null;

  async function generateInsight(ideaId: string) {
    if (!today) return;
    setGenerating(ideaId);
    try {
      const res = await fetch("/api/business/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          dayNumber: today.dayNumber,
          skillLearned: today.topic,
          topic: today.topic,
          module: today.module,
        }),
      });
      const data = await res.json();
      if (data.insight) {
        setGeneratedInsights((prev) => ({ ...prev, [ideaId]: data.insight }));
      }
    } catch { /* ignore */ }
    setGenerating(null);
  }

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-5 border border-violet-500/20 space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-violet-400" />
        <span className="font-semibold text-violet-300">비즈니스 인사이트</span>
        <span className="text-xs text-slate-500">오늘 배운 {today.topic}과 연결</span>
      </div>

      <div className="space-y-2">
        {ideas.map((idea) => {
          const insight = generatedInsights[idea.id];
          const isGenerating = generating === idea.id;

          return (
            <div key={idea.id} className="bg-slate-800/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/business/${idea.id}`}
                  className="text-sm font-medium text-white hover:text-violet-300 transition-colors"
                >
                  {idea.title}
                </Link>
                {!insight && (
                  <button
                    onClick={() => generateInsight(idea.id)}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded hover:bg-violet-500/20 transition-colors"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    연결하기
                  </button>
                )}
              </div>
              {insight && (
                <p className="text-xs text-slate-300">{insight}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

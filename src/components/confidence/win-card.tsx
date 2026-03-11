"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

interface Win {
  title: string;
  description: string;
  evidence: string;
}

interface Props {
  module?: string;
  topic?: string;
}

export function WinCards({ module, topic }: Props) {
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWins() {
      try {
        // 1. Check Supabase cache first (GET)
        const cacheRes = await fetch("/api/confidence/wins");
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          if (cacheData.wins?.length) {
            setWins(cacheData.wins);
            setLoading(false);
            return;
          }
        }

        // 2. No cached cards — generate via AI (POST) and persist
        const res = await fetch("/api/confidence/wins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            captures: [],
            coachingMessages: [],
            module,
            topic,
          }),
        });
        const data = await res.json();
        setWins(data.wins || []);
      } catch {
        setWins([]);
      }
      setLoading(false);
    }
    fetchWins();
  }, [module, topic]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> 오늘의 WIN
        </h2>
        <div className="text-sm text-slate-500">성과를 분석하고 있어요...</div>
      </div>
    );
  }

  if (wins.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" /> 오늘의 WIN
      </h2>
      <div className="grid gap-3">
        {wins.map((win, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl p-4"
          >
            <div className="font-medium text-yellow-300 text-sm">
              {win.title}
            </div>
            <p className="text-sm text-slate-300 mt-1">{win.description}</p>
            <p className="text-xs text-slate-500 mt-1.5">{win.evidence}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

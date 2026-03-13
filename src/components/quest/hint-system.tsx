"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, Lock, Unlock, Loader2 } from "lucide-react";
import type { Quest } from "@/data/quests";

interface Props {
  quest: Quest;
}

interface Hint {
  level: number;
  content: string;
}

export function HintSystem({ quest }: Props) {
  const [stuckPoint, setStuckPoint] = useState("");
  const [hints, setHints] = useState<Hint[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  useEffect(() => {
    async function loadHintHistory() {
      try {
        const res = await fetch(`/api/quest/hint-stats?questId=${quest.id}`);
        const data = await res.json();
        setTotalHintsUsed(data.hintsUsed || 0);
      } catch { /* ignore */ }
    }
    loadHintHistory();
  }, [quest.id]);

  async function requestHint() {
    if (!stuckPoint.trim() && currentLevel === 0) return;
    const nextLevel = currentLevel + 1;
    if (nextLevel > 3) return;

    setLoading(true);
    try {
      const res = await fetch("/api/quest/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questTitle: quest.title,
          questId: quest.id,
          stuckPoint: stuckPoint || "일반적인 도움이 필요합니다",
          hintLevel: nextLevel,
          module: quest.module,
        }),
      });
      const data = await res.json();
      setHints((prev) => [...prev, { level: nextLevel, content: data.content }]);
      setCurrentLevel(nextLevel);
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  const hintLabels = ["", "1차: 방향", "2차: 접근법", "3차: 코드 예시"];
  const hintColors = ["", "text-yellow-400", "text-orange-400", "text-red-400"];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" /> 단계별 힌트
      </h3>

      {currentLevel === 0 && (
        <div className="space-y-3">
          <Input
            value={stuckPoint}
            onChange={(e) => setStuckPoint(e.target.value)}
            placeholder="어디서 막혔는지 설명해주세요..."
            className="bg-slate-800 border-slate-700"
          />
          <Button
            onClick={requestHint}
            disabled={loading || !stuckPoint.trim()}
            size="sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "1차 힌트 요청"
            )}
          </Button>
        </div>
      )}

      {/* Rendered hints */}
      {hints.map((hint) => (
        <div
          key={hint.level}
          className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-1"
        >
          <div className={`text-sm font-medium ${hintColors[hint.level]}`}>
            <Unlock className="w-4 h-4 inline mr-1" />
            {hintLabels[hint.level]}
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">
            {hint.content}
          </p>
        </div>
      ))}

      {/* Next hint button */}
      {currentLevel > 0 && currentLevel < 3 && (
        <Button
          onClick={requestHint}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4 mr-1" /> {hintLabels[currentLevel + 1]}{" "}
              열기
            </>
          )}
        </Button>
      )}

      {/* Hint usage stats */}
      <div className="text-xs text-slate-500">
        이번 세션: {currentLevel}/3 단계
        {totalHintsUsed > 0 && <span> · 누적 힌트: {totalHintsUsed}회</span>}
      </div>
    </div>
  );
}

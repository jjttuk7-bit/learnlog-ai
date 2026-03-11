"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  module: string;
  topic: string;
}

export function FeynmanSession({ module, topic }: Props) {
  const [concept, setConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(false);

  async function selectConcept() {
    setLoading(true);
    try {
      const res = await fetch("/api/coach/feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "select_concept", module, topic }),
      });
      const data = await res.json();
      setConcept(data.concept);
    } catch {
      setConcept(topic);
    }
    setLoading(false);
  }

  async function submitExplanation() {
    if (!explanation.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coach/feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          concept,
          explanation,
          module,
          topic,
          previousFeedback: feedback,
        }),
      });
      const data = await res.json();
      setFeedback(data.content);
      setRound((r) => r + 1);
      setExplanation("");
    } catch {
      setFeedback("평가 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }

  if (!concept) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">파인만 모드</h2>
          <p className="text-slate-400 text-sm">
            AI가 오늘 핵심 개념을 선정하면, 초등학생에게 설명하듯 써보세요
          </p>
        </div>
        <Button onClick={selectConcept} disabled={loading} size="lg">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          개념 선정하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="text-sm text-blue-400 font-medium">오늘의 개념</div>
        <div className="text-lg font-semibold mt-1">{concept}</div>
        <p className="text-sm text-slate-400 mt-2">
          이 개념을 초등학생에게 설명하듯 써보세요. 전문용어 없이, 쉬운 비유로!
        </p>
      </div>

      {feedback && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
            <RefreshCw className="w-4 h-4" /> Round {round} 피드백
          </div>
          <div className="text-sm text-slate-200 whitespace-pre-wrap">
            {feedback}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={
            round === 0
              ? "이 개념을 초등학생에게 설명하듯 써보세요..."
              : "피드백을 반영해서 더 단순하게 다시 설명해보세요..."
          }
          className="min-h-[160px] bg-slate-800 border-slate-700 text-slate-100 resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Round {round + 1}/3</span>
          <Button
            onClick={submitExplanation}
            disabled={loading || !explanation.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {round === 0 ? "설명 제출" : "수정 설명 제출"}
          </Button>
        </div>
      </div>
    </div>
  );
}

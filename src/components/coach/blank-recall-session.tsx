"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface Props {
  module: string;
  topic: string;
}

export function BlankRecallSession({ module, topic }: Props) {
  const [started, setStarted] = useState(false);
  const [recall, setRecall] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitRecall() {
    if (!recall.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coach/blank-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRecall: recall,
          originalCaptures: "",
          module,
          topic,
        }),
      });
      const data = await res.json();
      setFeedback(data.content);
    } catch {
      setFeedback("분석 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">백지학습 모드</h2>
          <p className="text-slate-400 text-sm">
            아무것도 보지 말고, 오늘 배운 것을 처음부터 써보세요
          </p>
          <p className="text-slate-500 text-xs">
            노트, 캡처, 교재 — 아무것도 열지 마세요. 머릿속에서 꺼내는 인출
            훈련입니다.
          </p>
        </div>
        <Button onClick={() => setStarted(true)} size="lg">
          시작하기
        </Button>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold text-green-400 mb-3">
            백지학습 분석 결과
          </h3>
          <div className="text-sm text-slate-200 whitespace-pre-wrap">
            {feedback}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setFeedback(null);
            setRecall("");
            setStarted(false);
          }}
        >
          다시 도전하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="text-sm text-purple-400 font-medium">
          {module} · {topic}
        </div>
        <p className="text-sm text-slate-400 mt-1">
          오늘 배운 것을 처음부터 써보세요. 순서, 개념, 연결 — 기억나는 대로
          자유롭게.
        </p>
      </div>

      <Textarea
        value={recall}
        onChange={(e) => setRecall(e.target.value)}
        placeholder="오늘 배운 내용을 기억나는 대로 적어보세요..."
        className="min-h-[240px] bg-slate-800 border-slate-700 text-slate-100 resize-none"
        autoFocus
      />

      <div className="flex justify-end">
        <Button
          onClick={submitRecall}
          disabled={loading || !recall.trim()}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          제출 + AI 분석
        </Button>
      </div>
    </div>
  );
}

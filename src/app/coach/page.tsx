"use client";

import { useState } from "react";
import { getTodayCurriculum } from "@/lib/curriculum";
import { CheckinSession } from "@/components/coach/checkin-session";
import { MessageSquare, BookOpen, FileText } from "lucide-react";

export default function CoachPage() {
  const today = getTodayCurriculum();
  const [mode, setMode] = useState<"select" | "checkin">("select");

  const module = today?.module ?? "학습 준비";
  const topic = today?.topic ?? "";

  if (mode === "checkin") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI 코치</h1>
          <button
            onClick={() => setMode("select")}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← 돌아가기
          </button>
        </div>
        <CheckinSession module={module} topic={topic} captures={[]} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 코치</h1>
        <p className="text-slate-400 mt-1">메타인지 기반 AI 학습 코칭</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setMode("checkin")}
          className="flex items-center gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors text-left"
        >
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">메타인지 체크인</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              소크라테스식 질문으로 오늘 배운 것 검증하기
            </p>
          </div>
        </button>

        <a
          href="/coach/feynman"
          className="flex items-center gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-green-500/50 transition-colors"
        >
          <div className="p-3 bg-green-500/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold">파인만 모드</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              초등학생에게 설명하듯 개념 정리하기
            </p>
          </div>
        </a>

        <a
          href="/coach/blank-recall"
          className="flex items-center gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors"
        >
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">백지학습 모드</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              아무것도 보지 않고 오늘 배운 것 재구성하기
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}

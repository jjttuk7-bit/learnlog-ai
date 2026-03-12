"use client";

import { useState, useEffect } from "react";
import { getTodayCurriculum } from "@/lib/curriculum";
import { CheckinSession } from "@/components/coach/checkin-session";
import { MessageSquare, BookOpen, FileText, GitBranch, Sparkles, History, ArrowLeft } from "lucide-react";
import { ChatMessage } from "@/components/coach/chat-message";

const DAY_ROUTINES: Record<number, { label: string; mode: string; color: string }> = {
  1: { label: "월", mode: "feynman", color: "green" },
  2: { label: "화", mode: "feynman", color: "green" },
  3: { label: "수", mode: "feynman", color: "green" },
  4: { label: "목", mode: "blank-recall", color: "purple" },
  5: { label: "금", mode: "mindmap", color: "cyan" },
};

const MODE_LABELS: Record<string, string> = {
  feynman: "파인만 모드",
  "blank-recall": "백지학습 모드",
  mindmap: "마인드맵 모드",
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  feynman: "초등학생에게 설명하듯 개념 정리하기",
  "blank-recall": "아무것도 보지 않고 오늘 배운 것 재구성하기",
  mindmap: "개념 간 연결을 시각화하고 AI 피드백으로 보완하기",
};

function getTodayRoutine() {
  const day = new Date().getDay();
  return DAY_ROUTINES[day] ?? null;
}

interface SessionRecord {
  id: string;
  session_type: string;
  messages: { role: string; content: string }[];
  understanding_level: number | null;
  created_at: string;
}

export default function CoachPage() {
  const today = getTodayCurriculum();
  const [mode, setMode] = useState<"select" | "checkin">("select");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingSession, setViewingSession] = useState<SessionRecord | null>(null);

  const module = today?.module ?? "학습 준비";
  const topic = today?.topic ?? "";
  const todayRoutine = getTodayRoutine();

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/coach/session");
        const data = await res.json();
        if (data.sessions) setSessions(data.sessions);
      } catch {
        // ignore
      }
    }
    loadSessions();
  }, []);

  // 이전 세션 대화 보기
  if (viewingSession) {
    const date = new Date(viewingSession.created_at).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">코칭 기록</h1>
            <p className="text-slate-400 text-sm mt-0.5">{date}</p>
          </div>
          <button
            onClick={() => setViewingSession(null)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> 돌아가기
          </button>
        </div>
        {viewingSession.understanding_level && (
          <div className="text-center py-2 text-sm">
            이해도 레벨:{" "}
            <span className="text-blue-400 font-bold">
              {viewingSession.understanding_level}/5
            </span>
          </div>
        )}
        <div className="space-y-4">
          {viewingSession.messages?.map((msg, i) => (
            <ChatMessage key={i} role={msg.role as "user" | "assistant"} content={msg.content} />
          ))}
        </div>
      </div>
    );
  }

  if (mode === "checkin") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI 코치</h1>
          <button
            onClick={() => setMode("select")}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> 돌아가기
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

      {todayRoutine && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">오늘의 추천 학습법</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => {
                const r = DAY_ROUTINES[d];
                const isToday = d === new Date().getDay();
                const colorMap: Record<string, string> = {
                  green: isToday ? "bg-green-500 text-white" : "bg-slate-700 text-slate-400",
                  purple: isToday ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-400",
                  cyan: isToday ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-400",
                };
                return (
                  <span
                    key={d}
                    className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${colorMap[r.color]}`}
                  >
                    {r.label}
                  </span>
                );
              })}
            </div>
            <div>
              <span className="text-sm font-semibold">{MODE_LABELS[todayRoutine.mode]}</span>
              <p className="text-xs text-slate-400 mt-0.5">{MODE_DESCRIPTIONS[todayRoutine.mode]}</p>
            </div>
          </div>
          <a
            href={`/coach/${todayRoutine.mode}`}
            className={`mt-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              todayRoutine.color === "green"
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                : todayRoutine.color === "purple"
                ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
                : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            지금 시작하기
          </a>
        </div>
      )}

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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">파인만 모드</h3>
              <span className="text-xs text-slate-500">월·화·수 추천</span>
            </div>
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">백지학습 모드</h3>
              <span className="text-xs text-slate-500">목 추천</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              아무것도 보지 않고 오늘 배운 것 재구성하기
            </p>
          </div>
        </a>

        <a
          href="/coach/mindmap"
          className="flex items-center gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors"
        >
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <GitBranch className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">마인드맵 모드</h3>
              <span className="text-xs text-slate-500">금 추천</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              개념 간 연결을 시각화하고 AI 피드백으로 보완하기
            </p>
          </div>
        </a>
      </div>

      {/* 세션 기록 */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <History className="w-4 h-4" />
            이전 코칭 기록 ({sessions.length})
            <span className="text-xs">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <div className="space-y-2">
              {sessions.map((session) => {
                const date = new Date(session.created_at).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const msgCount = session.messages?.length ?? 0;
                const preview = session.messages?.[0]?.content?.slice(0, 80) ?? "";

                return (
                  <button
                    key={session.id}
                    onClick={() => setViewingSession(session)}
                    className="w-full text-left p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">{date}</span>
                      <div className="flex items-center gap-2">
                        {session.understanding_level && (
                          <span className="text-xs text-blue-400">
                            이해도 {session.understanding_level}/5
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {msgCount}개 메시지
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {preview}...
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

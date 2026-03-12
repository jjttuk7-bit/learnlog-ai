"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./chat-message";

interface Props {
  module: string;
  topic: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function BlankRecallSession({ module, topic }: Props) {
  const [started, setStarted] = useState(false);
  const [recall, setRecall] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submitRecall() {
    if (!recall.trim()) return;
    setLoading(true);
    setSubmitted(true);

    const userMsg: Message = { role: "user", content: recall.trim() };
    setMessages([userMsg]);

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
      const aiMsg: Message = { role: "assistant", content: data.content };
      setMessages([userMsg, aiMsg]);

      // 세션 저장
      try {
        await fetch("/api/coach/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_type: "blank-recall",
            messages: [userMsg, aiMsg],
          }),
        });
      } catch {
        // 저장 실패해도 계속 진행
      }
    } catch {
      setMessages([userMsg, { role: "assistant", content: "분석 중 오류가 발생했습니다." }]);
    }
    setLoading(false);
  }

  async function sendFollowUp() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const withUser = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(withUser);
    setLoading(true);

    try {
      const lastAiMsg = messages.filter((m) => m.role === "assistant").pop();
      const res = await fetch("/api/coach/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: lastAiMsg?.content || "",
          answer: userMsg,
          module,
          topic,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages([...withUser, { role: "assistant" as const, content: data.content }]);
    } catch {
      setMessages([...withUser, { role: "assistant" as const, content: "응답 중 오류가 발생했습니다." }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendFollowUp();
    }
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

  if (!submitted) {
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

  return (
    <div className="flex flex-col h-[calc(100vh-240px)]">
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {i === 0 && msg.role === "user" && (
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-medium text-purple-400">나의 백지 재구성</span>
              </div>
            )}
            <ChatMessage role={msg.role} content={msg.content} />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 pt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="궁금한 점이나 추가 설명을 이어가세요... (Enter 전송)"
          className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[60px]"
          disabled={loading}
        />
        <Button
          onClick={sendFollowUp}
          disabled={loading || !input.trim()}
          size="sm"
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

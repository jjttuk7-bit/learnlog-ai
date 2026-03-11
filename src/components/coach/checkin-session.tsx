"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "./chat-message";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  module: string;
  topic: string;
  captures: string[];
}

export function CheckinSession({ module, topic, captures }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [understandingLevel, setUnderstandingLevel] = useState<number | null>(
    null,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startCheckin() {
    setStarted(true);
    setLoading(true);

    try {
      const res = await fetch("/api/coach/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captures, module, topic }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.content }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "코칭을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    }
    setLoading(false);
  }

  async function sendAnswer() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
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
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
      if (data.understanding_level) {
        setUnderstandingLevel(data.understanding_level);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "평가 중 오류가 발생했습니다." },
      ]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">메타인지 체크인</h2>
          <p className="text-slate-400 text-sm">
            AI 코치가 오늘 학습한 내용에 대해 소크라테스식 질문을 합니다
          </p>
          {captures.length > 0 && (
            <p className="text-blue-400 text-sm">
              오늘 캡처 {captures.length}개 기반
            </p>
          )}
        </div>
        <Button onClick={startCheckin} size="lg">
          체크인 시작하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-240px)]">
      {understandingLevel && (
        <div className="text-center py-2 text-sm">
          이해도 레벨:{" "}
          <span className="text-blue-400 font-bold">
            {understandingLevel}/5
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-700 pt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="답변을 입력하세요... (Enter 전송)"
          className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[60px]"
          disabled={loading}
        />
        <Button
          onClick={sendAnswer}
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

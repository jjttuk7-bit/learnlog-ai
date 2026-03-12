"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, BookmarkPlus, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  topic: string;
  module: string;
  onBack: () => void;
  onSessionSaved: () => void;
  initialMessages?: Message[];
  initialSessionId?: string;
}

export function TutorChat({ topic, module, onBack, onSessionSaved, initialMessages, initialSessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const sessionIdRef = useRef<string | null>(initialSessionId ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveSession = useCallback(async (msgs: Message[]) => {
    try {
      if (!sessionIdRef.current) {
        const res = await fetch("/api/tutor/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic || "일반 질문", module, messages: msgs }),
        });
        const data = await res.json();
        if (data.id) sessionIdRef.current = data.id;
      } else {
        await fetch("/api/tutor/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sessionIdRef.current, messages: msgs }),
        });
      }
    } catch {
      // continue even if save fails
    }
  }, [topic, module]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const withUser: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(withUser);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          topic,
          module,
        }),
      });
      const data = await res.json();
      const updated: Message[] = [...withUser, { role: "assistant", content: data.content }];
      setMessages(updated);
      await saveSession(updated);
    } catch {
      const updated: Message[] = [...withUser, { role: "assistant", content: "응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요." }];
      setMessages(updated);
    }
    setLoading(false);
  }

  async function handleSummarize() {
    if (messages.length < 2 || summarizing) return;
    setSummarizing(true);
    try {
      await fetch("/api/tutor/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, messages }),
      });
      onSessionSaved();
    } catch {
      // ignore
    }
    setSummarizing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {topic || "자유 질문"}
            </h2>
            {module && <p className="text-xs text-slate-500">{module}</p>}
          </div>
        </div>
        {messages.length >= 2 && (
          <Button
            onClick={handleSummarize}
            disabled={summarizing}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:text-white gap-1.5"
          >
            {summarizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5" />
            )}
            {summarizing ? "정리 중..." : "노트 저장"}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">무엇이든 질문하세요!</p>
              <p className="text-sm text-slate-400 max-w-md">
                개념, 코드, 에러, 수학 공식 등 학습 중 궁금한 것을
                <br />
                쉬운 설명과 예시로 답변해드립니다
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                "이 개념이 뭐예요?",
                "코드가 이해가 안 돼요",
                "에러가 났어요",
                "예시를 보여주세요",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint + " ")}
                  className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_code]:text-emerald-400 [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
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

      {/* Input */}
      <div className="border-t border-slate-700 pt-3 flex gap-2 flex-shrink-0">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요... (Shift+Enter 줄바꿈, Enter 전송)"
          className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[56px] max-h-[120px] placeholder:text-slate-500"
          disabled={loading}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          size="sm"
          className="self-end bg-emerald-600 hover:bg-emerald-500"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

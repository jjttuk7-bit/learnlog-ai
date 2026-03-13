"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Plus, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInputButton } from "@/components/ui/voice-input-button";
import ReactMarkdown from "react-markdown";

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MindcarePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mode, setMode] = useState<"home" | "chat">("home");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/mindcare/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch { /* ignore */ }
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function startNewChat() {
    try {
      const res = await fetch("/api/mindcare/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "새 대화" }),
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session.id);
        setMessages([]);
        setMode("chat");
      }
    } catch { /* ignore */ }
  }

  async function loadSession(sessionId: string) {
    try {
      const res = await fetch(`/api/mindcare/sessions/${sessionId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })));
        setActiveSession(sessionId);
        setMode("chat");
      }
    } catch { /* ignore */ }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !activeSession) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mindcare/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession, message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "응답을 생성하지 못했어. 다시 말해줄래?" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "연결에 문제가 생겼어. 잠시 후 다시 시도해줘." },
      ]);
    }
    setLoading(false);
  }

  // Chat mode
  if (mode === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-purple-500/20 flex-shrink-0">
          <button
            onClick={() => { setMode("home"); fetchSessions(); }}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">멘탈 케어 멘토</h2>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-3xl">💜</span>
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">무슨 이야기든 편하게 해줘</p>
                <p className="text-sm text-slate-400 max-w-md">
                  학습 고민, 진로 불안, 번아웃, 비전공자로서의 걱정...{"\n"}
                  어떤 이야기든 들을 준비가 되어 있어
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "오늘 공부가 너무 어려웠어",
                  "나만 뒤처지는 것 같아",
                  "이걸 배워서 뭘 할 수 있을까",
                  "번아웃이 온 것 같아",
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => setInput(text)}
                    className="text-xs px-3 py-1.5 bg-slate-800 border border-purple-500/20 rounded-full text-slate-400 hover:text-white hover:border-purple-500/50 transition-colors"
                  >
                    {text}
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
                    ? "bg-purple-600 text-white rounded-br-md"
                    : "bg-slate-800 text-slate-200 border border-purple-500/20 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1 [&_ol]:my-1">
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
              <div className="bg-slate-800 border border-purple-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/20 pt-3 flex gap-2 flex-shrink-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="마음속 이야기를 편하게 적어줘..."
            className="bg-slate-800 border-purple-500/20 text-slate-100 resize-none min-h-[56px] max-h-[120px] placeholder:text-slate-500 focus:ring-purple-500/50 focus:border-purple-500/50"
            disabled={loading}
          />
          <div className="flex flex-col gap-1 self-end">
            <VoiceInputButton onTranscript={(text) => setInput((prev) => prev ? prev + " " + text : text)} />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Home — session list
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">멘탈 케어</h1>
        </div>
        <p className="text-slate-400 mt-1">힘들 때, 지칠 때, 언제든 찾아와요</p>
      </div>

      {/* New Chat */}
      <button
        onClick={startNewChat}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-4 py-3.5 transition-colors"
      >
        <Plus className="w-5 h-5" />
        새 대화 시작하기
      </button>

      {/* Session List */}
      {sessionsLoading ? (
        <div className="text-center py-8 text-slate-500 text-sm">불러오는 중...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg mb-1">아직 대화가 없어요</p>
          <p className="text-sm">멘토와 첫 대화를 시작해보세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-400">이전 대화</h2>
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className="w-full text-left bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/30 rounded-xl p-4 transition-colors"
            >
              <div className="font-medium text-sm text-slate-200">{s.title}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(s.updated_at).toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

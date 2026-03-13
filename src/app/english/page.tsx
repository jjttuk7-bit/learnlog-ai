"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, MessageSquare, BookOpen, Sparkles, Send, Loader2, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInputButton } from "@/components/ui/voice-input-button";
import ReactMarkdown from "react-markdown";
import { PHRASE_CATEGORIES, SCENARIOS, type PhraseCategory } from "@/data/english-phrases";

type Tab = "phrases" | "chat" | "explain";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function EnglishPage() {
  const [tab, setTab] = useState<Tab>("phrases");
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState("first-meeting");
  const [correctionMode, setCorrectionMode] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Explain state
  const [challenge, setChallenge] = useState<string | null>(null);
  const [concept, setConcept] = useState("");
  const [explainInput, setExplainInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chat functions
  async function startChat() {
    setChatStarted(true);
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch("/api/english/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "[START CONVERSATION]",
          history: [],
          scenario,
          correctionMode,
        }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.content }]);
    } catch {
      setMessages([{ role: "assistant", content: "Hey! Nice to meet you! So, what brings you to this program?" }]);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const withUser: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(withUser);
    setLoading(true);

    try {
      const res = await fetch("/api/english/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          scenario,
          correctionMode,
        }),
      });
      const data = await res.json();
      setMessages([...withUser, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...withUser, { role: "assistant", content: "Sorry, something went wrong. Could you try again?" }]);
    }
    setLoading(false);
  }

  // Explain functions
  async function loadChallenge() {
    setExplainLoading(true);
    setFeedback(null);
    setExplainInput("");
    try {
      const res = await fetch("/api/english/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      const data = await res.json();
      setChallenge(data.content);
      if (data.concept) setConcept(data.concept);
    } catch { /* ignore */ }
    setExplainLoading(false);
  }

  async function submitExplanation() {
    if (!explainInput.trim() || explainLoading) return;
    setExplainLoading(true);
    try {
      const res = await fetch("/api/english/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation: explainInput, concept }),
      });
      const data = await res.json();
      setFeedback(data.content);
    } catch { /* ignore */ }
    setExplainLoading(false);
  }

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Languages className="w-6 h-6 text-sky-400" />
          <h1 className="text-2xl font-bold text-white">English Prep</h1>
        </div>
        <p className="text-slate-400 mt-1">제주도 합동 교육 영어 준비</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "phrases" as Tab, label: "표현 카드", icon: <BookOpen className="w-4 h-4" />, color: "sky" },
          { key: "chat" as Tab, label: "대화 연습", icon: <MessageSquare className="w-4 h-4" />, color: "sky" },
          { key: "explain" as Tab, label: "기술 영어", icon: <Sparkles className="w-4 h-4" />, color: "sky" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Phrases */}
      {tab === "phrases" && !selectedCategory && (
        <div className="grid gap-3 sm:grid-cols-2">
          {PHRASE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left p-4 rounded-xl border transition-colors hover:scale-[1.01] ${colorMap[cat.color] || colorMap.blue}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-semibold text-slate-200">{cat.title}</span>
              </div>
              <p className="text-xs text-slate-500">{cat.phrases.length}개 상황</p>
            </button>
          ))}
        </div>
      )}

      {tab === "phrases" && selectedCategory && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            전체 카테고리
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>{selectedCategory.icon}</span>
            {selectedCategory.title}
          </h2>
          {selectedCategory.phrases.map((phrase, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
              <div className="text-sm font-medium text-sky-400">{phrase.korean}</div>
              <div className="space-y-1.5">
                {phrase.english.map((expr, j) => (
                  <div key={j} className="text-sm text-slate-200 bg-slate-900/50 rounded-lg px-3 py-2">
                    {expr}
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">예시 대화</div>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans">{phrase.example}</pre>
              </div>
              <button
                onClick={() => { setTab("chat"); setScenario(selectedCategory.id === "greeting" ? "first-meeting" : selectedCategory.id === "technical" ? "code-review" : "free"); }}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                이 표현 연습하기 →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Chat */}
      {tab === "chat" && !chatStarted && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">시나리오 선택</label>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScenario(s.id)}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                      scenario === s.id
                        ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300 font-medium">교정 모드</div>
                <div className="text-xs text-slate-500">ON이면 문법/표현 상세 피드백</div>
              </div>
              <button
                onClick={() => setCorrectionMode(!correctionMode)}
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                {correctionMode ? (
                  <ToggleRight className="w-8 h-8 text-sky-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <button
              onClick={startChat}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg px-4 py-3 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              대화 시작하기
            </button>
          </div>
        </div>
      )}

      {tab === "chat" && chatStarted && (
        <div className="flex flex-col h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setChatStarted(false); setMessages([]); }}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Alex (UC Berkeley, CS)
                </h2>
                <p className="text-xs text-slate-500">
                  {SCENARIOS.find((s) => s.id === scenario)?.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCorrectionMode(!correctionMode)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                correctionMode
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}
            >
              📝 교정 {correctionMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white rounded-br-md"
                      : "bg-slate-800 text-slate-200 border border-sky-500/20 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1 [&_ol]:my-1 [&_hr]:my-3 [&_hr]:border-slate-700">
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
                <div className="bg-slate-800 border border-sky-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-sky-500/20 pt-3 flex gap-2 flex-shrink-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type in English... (한국어 섞어도 OK!)"
              className="bg-slate-800 border-sky-500/20 text-slate-100 resize-none min-h-[56px] max-h-[120px] placeholder:text-slate-500 focus:ring-sky-500/50"
              disabled={loading}
            />
            <div className="flex flex-col gap-1 self-end">
              <VoiceInputButton onTranscript={(text) => setInput((prev) => prev ? prev + " " + text : text)} />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Explain */}
      {tab === "explain" && (
        <div className="space-y-4">
          {!challenge && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">설명할 개념 (선택, 비우면 오늘 주제)</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="예: CNN, Transfer Learning, Overfitting..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
              <button
                onClick={loadChallenge}
                disabled={explainLoading}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg px-4 py-3 transition-colors"
              >
                {explainLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                오늘의 기술 영어 챌린지
              </button>
            </div>
          )}

          {challenge && !feedback && (
            <div className="space-y-4">
              <button
                onClick={() => { setChallenge(null); setFeedback(null); setExplainInput(""); }}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                다시 선택
              </button>
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5">
                  <ReactMarkdown>{challenge}</ReactMarkdown>
                </div>
              </div>
              <div className="space-y-3">
                <Textarea
                  value={explainInput}
                  onChange={(e) => setExplainInput(e.target.value)}
                  placeholder="Try explaining in English..."
                  className="bg-slate-800 border-sky-500/20 text-slate-100 resize-none min-h-[100px] placeholder:text-slate-500 focus:ring-sky-500/50"
                />
                <div className="flex gap-2">
                  <VoiceInputButton onTranscript={(text) => setExplainInput((prev) => prev ? prev + " " + text : text)} />
                  <button
                    onClick={submitExplanation}
                    disabled={!explainInput.trim() || explainLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg px-4 py-3 transition-colors"
                  >
                    {explainLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    제출하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {feedback && (
            <div className="space-y-4">
              <button
                onClick={() => { setChallenge(null); setFeedback(null); setExplainInput(""); setConcept(""); }}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                새 챌린지
              </button>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="prose prose-invert prose-sm max-w-none [&_h3]:text-sky-300 [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:my-1.5 [&_ul]:my-1 [&_strong]:text-white">
                  <ReactMarkdown>{feedback}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

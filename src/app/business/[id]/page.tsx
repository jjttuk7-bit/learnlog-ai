"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Lightbulb, Rocket, Pause, Send, Loader2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { getTodayCurriculum } from "@/lib/curriculum";
import Link from "next/link";

interface BusinessIdea {
  id: string;
  title: string;
  canvas: Record<string, string>;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Insight {
  id: string;
  day_number: number | null;
  skill_learned: string;
  insight: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CANVAS_LABELS: Record<string, { label: string; placeholder: string }> = {
  problem: { label: "해결하는 문제", placeholder: "이 비즈니스가 해결하는 핵심 문제는?" },
  target: { label: "타겟 고객", placeholder: "누가 이 서비스를 사용하나요?" },
  solution: { label: "솔루션", placeholder: "어떻게 문제를 해결하나요?" },
  tech_stack: { label: "기술 스택", placeholder: "어떤 AI/ML 기술이 필요한가요?" },
  data: { label: "필요 데이터", placeholder: "어떤 데이터가 필요한가요?" },
  revenue: { label: "수익 모델", placeholder: "어떻게 수익을 낼 건가요?" },
  advantage: { label: "경쟁 우위", placeholder: "경쟁 서비스 대비 차별점은?" },
  mvp: { label: "MVP 범위", placeholder: "최소 기능 제품의 범위는?" },
};

const statusOptions = [
  { value: "exploring", label: "탐색 중", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "text-yellow-400" },
  { value: "developing", label: "발전 중", icon: <Rocket className="w-3.5 h-3.5" />, color: "text-blue-400" },
  { value: "paused", label: "보류", icon: <Pause className="w-3.5 h-3.5" />, color: "text-slate-400" },
];

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"canvas" | "insights" | "chat">("canvas");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Insight generation
  const [generatingInsight, setGeneratingInsight] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/business/${id}`);
      const data = await res.json();
      if (data.idea) setIdea(data.idea);
      if (data.insights) setInsights(data.insights);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function updateCanvas(key: string, value: string) {
    if (!idea) return;
    const newCanvas = { ...idea.canvas, [key]: value };
    setIdea({ ...idea, canvas: newCanvas });

    await fetch(`/api/business/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canvas: newCanvas }),
    });
  }

  async function updateStatus(status: string) {
    if (!idea) return;
    setIdea({ ...idea, status });
    await fetch(`/api/business/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("상태가 변경되었습니다");
  }

  async function deleteIdea() {
    await fetch(`/api/business/${id}`, { method: "DELETE" });
    toast.success("아이디어가 삭제되었습니다");
    router.push("/business");
  }

  async function generateInsight() {
    if (!idea) return;
    const today = getTodayCurriculum();
    if (!today) {
      toast.error("오늘은 수업일이 아닙니다");
      return;
    }
    setGeneratingInsight(true);
    try {
      const res = await fetch("/api/business/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: id,
          dayNumber: today.dayNumber,
          skillLearned: today.topic,
          topic: today.topic,
          module: today.module,
        }),
      });
      const data = await res.json();
      if (data.insight) {
        setInsights((prev) => [{
          id: crypto.randomUUID(),
          day_number: today.dayNumber,
          skill_learned: today.topic,
          insight: data.insight,
          created_at: new Date().toISOString(),
        }, ...prev]);
        toast.success("인사이트가 생성되었습니다!");
      }
    } catch {
      toast.error("인사이트 생성 실패");
    }
    setGeneratingInsight(false);
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");

    const withUser: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(withUser);
    setChatLoading(true);

    try {
      const res = await fetch("/api/business/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: id, message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages([...withUser, { role: "assistant", content: data.content }]);

      // Auto-apply canvas update if suggested
      if (data.canvasUpdate && idea) {
        const { key, value } = data.canvasUpdate;
        if (CANVAS_LABELS[key]) {
          updateCanvas(key, value);
          toast.success(`캔버스 "${CANVAS_LABELS[key].label}" 항목이 업데이트되었습니다`);
        }
      }
    } catch {
      setMessages([...withUser, { role: "assistant", content: "응답 생성에 실패했습니다." }]);
    }
    setChatLoading(false);
  }

  if (loading) return <div className="text-center py-12 text-slate-500">불러오는 중...</div>;
  if (!idea) return <div className="text-center py-12 text-slate-500">아이디어를 찾을 수 없습니다</div>;

  const canvasKeys = Object.keys(CANVAS_LABELS);
  const filledCount = canvasKeys.filter((k) => idea.canvas[k]?.trim()).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/business" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="w-4 h-4" /> 비즈니스 목록
          </Link>
          <h1 className="text-xl font-bold text-white">{idea.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => updateStatus(s.value)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  idea.status === s.value
                    ? `${s.color} bg-current/10 border-current/30`
                    : "text-slate-500 border-slate-700 hover:text-slate-300"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={deleteIdea} className="text-red-400 hover:text-red-300 p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "canvas" as const, label: `캔버스 (${filledCount}/${canvasKeys.length})` },
          { key: "insights" as const, label: `인사이트 (${insights.length})` },
          { key: "chat" as const, label: "AI 토론" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Canvas Tab */}
      {tab === "canvas" && (
        <div className="space-y-3">
          {canvasKeys.map((key) => {
            const config = CANVAS_LABELS[key];
            const value = idea.canvas[key] || "";
            return (
              <div key={key} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <label className="text-sm font-medium text-violet-300 block mb-2">{config.label}</label>
                <textarea
                  value={value}
                  onChange={(e) => updateCanvas(key, e.target.value)}
                  placeholder={config.placeholder}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 resize-none"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Insights Tab */}
      {tab === "insights" && (
        <div className="space-y-4">
          <Button
            onClick={generateInsight}
            disabled={generatingInsight}
            size="sm"
            className="bg-violet-600 hover:bg-violet-500"
          >
            {generatingInsight ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> 생성 중...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1.5" /> 오늘의 인사이트 생성</>
            )}
          </Button>

          {insights.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              아직 인사이트가 없습니다. 위 버튼으로 오늘 배운 내용과 연결해보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((ins) => (
                <div key={ins.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-blue-400">{ins.skill_learned}</span>
                    {ins.day_number && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">Day {ins.day_number}</span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(ins.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{ins.insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="flex flex-col h-[calc(100vh-20rem)]">
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-white font-medium">AI 비즈니스 멘토와 토론하세요</p>
                <p className="text-sm text-slate-400 max-w-md">
                  아이디어의 실현 가능성, 시장 분석, 기술 적용 등<br />무엇이든 질문하세요
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["이 아이디어의 MVP는 어떻게 만들 수 있을까?", "타겟 고객을 좁혀볼까요?", "경쟁 서비스는 뭐가 있을까?"].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setChatInput(hint)}
                      className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-violet-500/50 transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-md"
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md"
                }`}>
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

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-700 pt-3 flex gap-2 flex-shrink-0">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="비즈니스 아이디어에 대해 질문하세요..."
              className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[56px] max-h-[120px] placeholder:text-slate-500"
              disabled={chatLoading}
            />
            <Button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              size="sm"
              className="self-end bg-violet-600 hover:bg-violet-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

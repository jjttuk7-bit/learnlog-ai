"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, Plus, Lightbulb, Rocket, Pause, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface BusinessIdea {
  id: string;
  title: string;
  canvas: Record<string, string>;
  status: string;
  created_at: string;
  updated_at: string;
  business_insights: [{ count: number }];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  exploring: { label: "탐색 중", icon: <Lightbulb className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  developing: { label: "발전 중", icon: <Rocket className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  paused: { label: "보류", icon: <Pause className="w-3.5 h-3.5" />, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

export default function BusinessPage() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [synergy, setSynergy] = useState<string | null>(null);
  const [analyzingSynergy, setAnalyzingSynergy] = useState(false);

  async function analyzeSynergy() {
    setAnalyzingSynergy(true);
    try {
      const res = await fetch("/api/business/synergy", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else if (data.analysis) {
        setSynergy(data.analysis);
      }
    } catch {
      toast.error("시너지 분석 실패");
    }
    setAnalyzingSynergy(false);
  }

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/business");
      const data = await res.json();
      if (data.ideas) setIdeas(data.ideas);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  async function createIdea() {
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.idea) {
        setIdeas((prev) => [data.idea, ...prev]);
        setNewTitle("");
        toast.success("새 비즈니스 아이디어가 생성되었습니다!");
      }
    } catch {
      toast.error("생성 실패");
    }
    setCreating(false);
  }

  function getCanvasProgress(canvas: Record<string, string>): number {
    const keys = ["problem", "target", "solution", "tech_stack", "data", "revenue", "advantage", "mvp"];
    const filled = keys.filter((k) => canvas[k] && canvas[k].trim().length > 0);
    return Math.round((filled.length / keys.length) * 100);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl font-bold text-white">비즈니스 모델 빌더</h1>
        </div>
        <p className="text-slate-400 mt-1">학습한 AI 기술을 비즈니스로 연결하세요</p>
      </div>

      {/* New Idea Input */}
      <div className="bg-slate-800 rounded-xl border border-violet-500/20 p-5 space-y-3">
        <label className="text-sm text-violet-300 font-medium">새 비즈니스 아이디어</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createIdea()}
            placeholder="예: AI 기반 의료 영상 진단 서비스, 개인 맞춤 학습 추천 플랫폼..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <button
            onClick={createIdea}
            disabled={!newTitle.trim() || creating}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            추가
          </button>
        </div>
        <p className="text-xs text-slate-500">비전 한 줄만 입력하세요. 나머지는 학습하면서 AI와 함께 채워갑니다.</p>
      </div>

      {/* Ideas List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">불러오는 중...</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-white font-medium">아직 비즈니스 아이디어가 없습니다</p>
          <p className="text-sm text-slate-400">위에서 비전 한 줄을 입력해 시작해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => {
            const progress = getCanvasProgress(idea.canvas || {});
            const insightCount = idea.business_insights?.[0]?.count || 0;
            const status = statusConfig[idea.status] || statusConfig.exploring;

            return (
              <Link
                key={idea.id}
                href={`/business/${idea.id}`}
                className="block bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {idea.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      {insightCount > 0 && (
                        <span className="text-xs text-slate-500">인사이트 {insightCount}개</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(idea.updated_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-sm font-bold text-violet-400">{progress}%</div>
                    <div className="text-[10px] text-slate-500">캔버스</div>
                  </div>
                </div>

                {/* Canvas Progress Bar */}
                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Synergy Analysis */}
      {ideas.filter((i) => i.status !== "paused").length >= 2 && (
        <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-xl p-5 border border-violet-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="font-semibold text-violet-300">아이디어 간 시너지 분석</span>
            </div>
            <button
              onClick={analyzeSynergy}
              disabled={analyzingSynergy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {analyzingSynergy ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 분석 중...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> AI 분석</>
              )}
            </button>
          </div>
          {!synergy && !analyzingSynergy && (
            <p className="text-sm text-slate-400">
              활성 아이디어들 간의 시너지, 공유 자원, 통합 가능성을 AI가 분석합니다
            </p>
          )}
          {synergy && (
            <div className="bg-slate-800/50 rounded-lg p-4 prose prose-invert prose-sm max-w-none [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5">
              <ReactMarkdown>{synergy}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Newspaper, Loader2, Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function TrendBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBriefing() {
    setLoading(true);
    try {
      const res = await fetch("/api/news/trend", { method: "POST" });
      const data = await res.json();
      if (data.briefing) {
        setBriefing(data.briefing);
        setTopic(data.topic || "AI/ML");
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-5 border border-cyan-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-cyan-300">AI 트렌드 브리핑</span>
        </div>
        {briefing && (
          <button
            onClick={loadBriefing}
            disabled={loading}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {!briefing && !loading && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            지금 배우는 내용이 AI 업계에서 어떻게 쓰이는지, 관련 트렌드를 AI가 브리핑합니다
          </p>
          <button
            onClick={loadBriefing}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            오늘의 트렌드 브리핑 받기
          </button>
        </div>
      )}

      {loading && !briefing && (
        <div className="flex items-center gap-2 py-6 justify-center text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          AI가 트렌드를 분석 중...
        </div>
      )}

      {briefing && (
        <div className="prose prose-invert prose-sm max-w-none [&_h3]:text-cyan-300 [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:text-slate-200 [&_h4]:mt-3 [&_h4]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5 [&_strong]:text-white">
          {topic && (
            <div className="text-xs text-slate-500 mb-2">
              학습 주제: <span className="text-cyan-400">{topic}</span>
            </div>
          )}
          <ReactMarkdown>{briefing}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

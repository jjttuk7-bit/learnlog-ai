"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";

interface SharedSession {
  topic: string;
  module: string | null;
  messages: { role: string; content: string }[];
  summary: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const token = params.token as string;
  const [session, setSession] = useState<SharedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tutor/share/${token}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setSession(data.session);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function handleDownload() {
    if (!session) return;
    const date = new Date(session.created_at).toLocaleDateString("ko-KR");
    let md = `# ${session.topic}\n\n`;
    md += `> ${date}${session.module ? ` · ${session.module}` : ""}\n\n`;

    if (session.tags?.length) {
      md += `**키워드:** ${session.tags.join(", ")}\n\n`;
    }

    if (session.summary) {
      md += `## 학습 노트\n\n${session.summary}\n\n`;
    }

    md += `## 대화 내용\n\n`;
    for (const msg of session.messages) {
      md += msg.role === "user"
        ? `### 🙋 질문\n${msg.content}\n\n`
        : `### 🎓 답변\n${msg.content}\n\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.topic.replace(/[/\\?%*:|"<>]/g, "-")}_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-white font-medium">노트를 찾을 수 없습니다</p>
          <p className="text-sm text-slate-500">링크가 만료되었거나 삭제되었을 수 있습니다</p>
        </div>
      </div>
    );
  }

  const date = new Date(session.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold text-white">{session.topic}</h1>
              <p className="text-xs text-slate-500">{date}{session.module ? ` · ${session.module}` : ""}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            다운로드
          </button>
        </div>

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {session.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        {session.summary && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <h2 className="text-sm font-medium text-emerald-400 mb-2">학습 노트</h2>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              <ReactMarkdown>{session.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-slate-400">대화 내용</h2>
          {session.messages.map((msg, i) => (
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
                  <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_code]:text-emerald-400">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">LearnLog AI 튜터로 생성된 학습 노트</p>
        </div>
      </div>
    </div>
  );
}

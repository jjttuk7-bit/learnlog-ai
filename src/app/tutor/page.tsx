"use client";

import { useState, useEffect, useCallback } from "react";
import { GraduationCap, Plus, BookOpen, ArrowLeft, Brain, Download, Share2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { getTodayCurriculum } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/client";
import { TopicSelector } from "@/components/tutor/topic-selector";
import { TutorChat } from "@/components/tutor/tutor-chat";
import { NoteList } from "@/components/tutor/note-list";
import { QuizModal } from "@/components/tutor/quiz-modal";
import { ChatMessage } from "@/components/coach/chat-message";

interface Session {
  id: string;
  topic: string;
  module: string | null;
  messages: { role: string; content: string }[];
  summary: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function TutorPage() {
  const today = getTodayCurriculum();
  const [mode, setMode] = useState<"home" | "chat" | "view">("home");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(today?.topic ?? "");
  const [selectedModule, setSelectedModule] = useState(today?.module ?? "");
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [captures, setCaptures] = useState<string[]>([]);
  const [quizSession, setQuizSession] = useState<Session | null>(null);
  const [sharing, setSharing] = useState(false);

  function handleDownload(session: Session) {
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
    toast.success("노트 다운로드 완료");
  }

  async function handleShare(session: Session) {
    setSharing(true);
    try {
      const res = await fetch("/api/tutor/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      if (data.token) {
        const shareUrl = `${window.location.origin}/tutor/share/${data.token}`;
        // Try Web Share API first (mobile)
        if (navigator.share) {
          await navigator.share({
            title: `학습 노트: ${session.topic}`,
            text: session.summary?.slice(0, 100) || session.topic,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("공유 링크가 복사되었습니다!");
        }
      }
    } catch {
      toast.error("공유 링크 생성 실패");
    }
    setSharing(false);
  }

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/tutor/session");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch today's captures for context
  const fetchCaptures = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("captures")
        .select("content")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .gte("created_at", todayStr + "T00:00:00")
        .lte("created_at", todayStr + "T23:59:59")
        .order("created_at", { ascending: false });

      if (data) {
        setCaptures(data.map((c) => c.content));
      }
    } catch {
      // ignore - captures are optional context
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchCaptures();
  }, [fetchSessions, fetchCaptures]);

  function startNewChat() {
    setMode("chat");
    setViewingSession(null);
  }

  function handleViewSession(session: Session) {
    setViewingSession(session);
    setMode("view");
  }

  function handleContinueSession(session: Session) {
    setViewingSession(session);
    setSelectedTopic(session.topic);
    setSelectedModule(session.module ?? "");
    setMode("chat");
  }

  // View past session
  if (mode === "view" && viewingSession) {
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setMode("home"); setViewingSession(null); }}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-white">{viewingSession.topic}</h1>
            </div>
            <p className="text-xs text-slate-500 ml-7">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(viewingSession)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              다운로드
            </button>
            <button
              onClick={() => handleShare(viewingSession)}
              disabled={sharing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
              공유
            </button>
            {viewingSession.summary && (
              <button
                onClick={() => setQuizSession(viewingSession)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                퀴즈
              </button>
            )}
            <button
              onClick={() => handleContinueSession(viewingSession)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              이어가기 →
            </button>
          </div>
        </div>

        {viewingSession.summary && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">학습 노트</span>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap">{viewingSession.summary}</div>
          </div>
        )}

        <div className="space-y-4">
          {viewingSession.messages?.map((msg, i) => (
            <ChatMessage key={i} role={msg.role as "user" | "assistant"} content={msg.content} />
          ))}
        </div>

        {quizSession && (
          <QuizModal
            sessionId={quizSession.id}
            topic={quizSession.topic}
            onClose={() => setQuizSession(null)}
          />
        )}
      </div>
    );
  }

  // Chat mode
  if (mode === "chat") {
    return (
      <TutorChat
        topic={selectedTopic}
        module={selectedModule}
        onBack={() => { setMode("home"); setViewingSession(null); fetchSessions(); }}
        onSessionSaved={fetchSessions}
        initialMessages={viewingSession?.messages?.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
        initialSessionId={viewingSession?.id}
        captures={captures}
      />
    );
  }

  // Home
  const summarizedCount = sessions.filter((s) => s.summary).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">AI 튜터</h1>
        </div>
        <p className="text-slate-400 mt-1">학습 중 궁금한 것을 질문하고, 정리된 노트로 복습하세요</p>
      </div>

      {/* Capture Context Banner */}
      {captures.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-3">
          <span className="text-lg">📋</span>
          <div className="flex-1">
            <p className="text-sm text-yellow-400 font-medium">오늘의 캡처 {captures.length}개 연동됨</p>
            <p className="text-xs text-slate-500">튜터가 오늘 학습한 내용을 참고하여 답변합니다</p>
          </div>
        </div>
      )}

      {/* New Chat Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-300 font-medium">학습 토픽 선택</label>
          <TopicSelector
            value={selectedTopic}
            onChange={(topic, module) => {
              setSelectedTopic(topic);
              setSelectedModule(module);
            }}
          />
        </div>
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-4 py-3 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 질문 시작하기
        </button>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{sessions.length}</div>
            <div className="text-xs text-slate-500">총 대화</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{summarizedCount}</div>
            <div className="text-xs text-slate-500">정리된 노트</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {new Set(sessions.map((s) => s.topic)).size}
            </div>
            <div className="text-xs text-slate-500">학습 토픽</div>
          </div>
        </div>
      )}

      {/* Note List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">불러오는 중...</div>
      ) : (
        <NoteList
          sessions={sessions}
          onViewSession={handleViewSession}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterTopic={filterTopic}
          onFilterTopicChange={setFilterTopic}
        />
      )}

      {quizSession && (
        <QuizModal
          sessionId={quizSession.id}
          topic={quizSession.topic}
          onClose={() => setQuizSession(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTodayCurriculum } from "@/lib/curriculum";
import type { DiaryEntry } from "@/app/diary/page";

interface Props {
  onSubmit: (entry: DiaryEntry) => void;
}

export function DiaryForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  const today = getTodayCurriculum();

  async function generateDraft() {
    setDraftLoading(true);
    try {
      const res = await fetch("/api/coach/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: today?.module || "일반 학습",
          topic: today?.topic || "오늘의 학습",
          captures: [],
          coachingMessages: [],
        }),
      });
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        if (!title.trim() && today?.topic) {
          setTitle(`${today.topic} - 학습 회고`);
        }
        toast.success("AI 초안이 생성되었습니다. 자유롭게 수정하세요!");
      }
    } catch {
      toast.error("AI 초안 생성에 실패했습니다");
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "저장 실패");
        return;
      }

      onSubmit(data.entry);
      setTitle("");
      setContent("");
      toast.success("일기가 저장되었습니다!");
    } catch {
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="오늘의 학습 제목"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 무엇을 배웠나요? 어떤 점이 어려웠고, 어떤 깨달음이 있었나요? 자유롭게 기록해보세요..."
        className="min-h-[180px] bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
      />
      <div className="flex items-center justify-between">
        <Button
          onClick={generateDraft}
          disabled={draftLoading || loading}
          variant="outline"
          size="sm"
          className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
        >
          {draftLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI 초안 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> AI 회고 초안 생성
            </>
          )}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
        >
          {loading ? (
            "AI가 읽고 있어요..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> 일기 저장
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

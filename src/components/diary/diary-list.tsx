"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { DiaryEntry } from "@/app/diary/page";

interface Props {
  entries: DiaryEntry[];
  onRemove: (id: string) => void;
}

function DiaryCard({ entry, onRemove }: { entry: DiaryEntry; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  async function handleDelete() {
    try {
      const res = await fetch(`/api/diary/${entry.id}`, { method: "DELETE" });
      if (res.ok) {
        onRemove(entry.id);
        toast.success("삭제되었습니다");
      }
    } catch {
      toast.error("삭제 실패");
    }
  }

  const isLong = entry.content.length > 200;
  const displayContent = isLong && !expanded
    ? entry.content.slice(0, 200) + "..."
    : entry.content;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">{entry.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{date}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {displayContent}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "접기" : "더 보기"}
          </button>
        )}
      </div>

      {entry.ai_comment && (
        <div className="px-5 py-4 bg-amber-500/5 border-t border-amber-500/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">AI 멘토 분석</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none [&_h3]:text-amber-300 [&_h3]:text-sm [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-1.5 [&_strong]:text-white [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-600 [&_pre]:rounded-lg [&_code]:text-emerald-400">
            <ReactMarkdown>{entry.ai_comment}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiaryList({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg mb-1">아직 작성한 일기가 없어요</p>
        <p className="text-sm">오늘의 학습을 기록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">나의 학습 일기 ({entries.length})</h2>
      {entries.map((entry) => (
        <DiaryCard key={entry.id} entry={entry} onRemove={onRemove} />
      ))}
    </div>
  );
}

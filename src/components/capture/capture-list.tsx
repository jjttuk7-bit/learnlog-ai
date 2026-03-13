"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles, BookA } from "lucide-react";
import Link from "next/link";
import type { CaptureItem } from "@/app/capture/page";

const categoryStyles: Record<string, { label: string; className: string }> = {
  concept: {
    label: "개념",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  code: {
    label: "코드",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  question: {
    label: "질문",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  insight: {
    label: "인사이트",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

interface Props {
  captures: CaptureItem[];
  onRemove: (id: string) => void;
}

export function CaptureList({ captures, onRemove }: Props) {
  if (captures.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        아직 캡처한 내용이 없어요. 위에서 학습 내용을 기록해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">오늘의 캡처 ({captures.length})</h2>
      {captures.map((item) => {
        const cat = categoryStyles[item.ai_category ?? "concept"];
        const time = new Date(item.created_at).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={item.id}
            className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cat.className}>
                  {cat.label}
                </Badge>
                {item.capture_type === "voice" && (
                  <Badge
                    variant="outline"
                    className="bg-slate-700/50 text-slate-400 border-slate-600"
                  >
                    음성
                  </Badge>
                )}
                {item.capture_type === "code" && (
                  <Badge
                    variant="outline"
                    className="bg-slate-700/50 text-slate-400 border-slate-600"
                  >
                    코드
                  </Badge>
                )}
                <span className="text-xs text-slate-500">{time}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                onClick={() => onRemove(item.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p
              className={`text-sm text-slate-200 whitespace-pre-wrap ${item.capture_type === "code" ? "font-mono" : ""}`}
            >
              {item.content}
            </p>
            {item.ai_tags && item.ai_tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {item.ai_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {item.ai_coaching && (
              <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400">AI 코칭</span>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {item.ai_coaching}
                </p>
              </div>
            )}
            {item.ai_suggested_terms && item.ai_suggested_terms.length > 0 && (
              <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookA className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">용어 사전에 추가하기</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.ai_suggested_terms.map((term) => (
                    <Link
                      key={term}
                      href={`/tutor?mode=glossary&term=${encodeURIComponent(term)}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors"
                    >
                      <BookA className="w-3 h-3" />
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

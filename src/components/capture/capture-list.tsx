"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, PenLine, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TrashItem {
  id: string;
  type: "capture" | "diary";
  content: string;
  title?: string;
  capture_type?: string;
  ai_category?: string;
  deleted_at: string;
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trash");
        const data = await res.json();
        if (data.items) setItems(data.items);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRestore(item: TrashItem) {
    try {
      const res = await fetch("/api/trash", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item.type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("복원되었습니다");
      }
    } catch {
      toast.error("복원 실패");
    }
  }

  async function handlePermanentDelete(item: TrashItem) {
    try {
      const res = await fetch("/api/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item.type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("영구 삭제되었습니다");
      }
    } catch {
      toast.error("삭제 실패");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-slate-400" />
          <h1 className="text-2xl font-bold">휴지통</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          삭제된 항목을 복원하거나 영구 삭제할 수 있습니다
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-1">휴지통이 비어있어요</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{items.length}개 항목</p>
          {items.map((item) => {
            const deletedDate = new Date(item.deleted_at).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
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
                    {item.type === "diary" ? (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <BookOpen className="w-3 h-3 mr-1" />
                        일기
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <PenLine className="w-3 h-3 mr-1" />
                        캡처
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">삭제: {deletedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-green-400"
                      onClick={() => handleRestore(item)}
                      title="복원"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-red-400"
                      onClick={() => handlePermanentDelete(item)}
                      title="영구 삭제"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {item.title && (
                  <p className="font-medium text-slate-200">{item.title}</p>
                )}
                <p className="text-sm text-slate-400 line-clamp-2">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

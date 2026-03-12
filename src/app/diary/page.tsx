"use client";

import { useState, useEffect } from "react";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryList } from "@/components/diary/diary-list";
import { BookOpen } from "lucide-react";

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  ai_comment: string | null;
  created_at: string;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/diary");
        const data = await res.json();
        if (data.entries) setEntries(data.entries);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, []);

  function addEntry(entry: DiaryEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold">학습 일기</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          오늘의 학습을 기록하면 AI 멘토가 코멘트를 달아줍니다
        </p>
      </div>

      <DiaryForm onSubmit={addEntry} />

      {loading ? (
        <div className="text-center py-8 text-slate-500">불러오는 중...</div>
      ) : (
        <DiaryList entries={entries} onRemove={removeEntry} />
      )}
    </div>
  );
}

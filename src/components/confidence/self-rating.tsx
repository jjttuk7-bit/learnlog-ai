"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const RATINGS = [
  { value: 1, emoji: "😫", label: "힘들다" },
  { value: 2, emoji: "😟", label: "좀 힘들다" },
  { value: 3, emoji: "😐", label: "보통" },
  { value: 4, emoji: "😊", label: "좋다" },
  { value: 5, emoji: "🤩", label: "최고다" },
];

export function SelfRating() {
  const [rating, setRating] = useState<number | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchRating() {
      try {
        const res = await fetch("/api/confidence/rating");
        if (res.ok) {
          const data = await res.json();
          setRating(data.rating);
          setRecordId(data.record_id);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchRating();
  }, []);

  async function handleRate(value: number) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/confidence/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value, record_id: recordId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRating(value);
      if (data.record_id) setRecordId(data.record_id);
      toast.success("오늘의 컨디션이 기록되었어요!");
    } catch {
      toast.error("저장에 실패했어요. 다시 시도해주세요.");
    }
    setSaving(false);
  }

  const selected = RATINGS.find((r) => r.value === rating);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="text-sm font-medium text-slate-300 mb-3">
        오늘의 컨디션
      </div>
      {loading ? (
        <div className="text-xs text-slate-500">불러오는 중...</div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRate(r.value)}
                disabled={saving}
                title={r.label}
                className={`text-2xl transition-all duration-150 rounded-lg p-1.5 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  rating === r.value
                    ? "bg-slate-600 scale-110 ring-2 ring-blue-500/40"
                    : "hover:bg-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {r.emoji}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-400 min-h-[1rem]">
            {selected
              ? `${selected.emoji} ${selected.label} — 오늘의 컨디션이 기록됐어요`
              : "오늘의 컨디션을 기록해주세요"}
          </div>
        </>
      )}
    </div>
  );
}

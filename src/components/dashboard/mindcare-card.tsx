"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

const MOODS = [
  { value: 1, emoji: "😰", label: "많이 힘들어" },
  { value: 2, emoji: "😟", label: "좀 힘들어" },
  { value: 3, emoji: "😐", label: "그냥 그래" },
  { value: 4, emoji: "😊", label: "괜찮아" },
  { value: 5, emoji: "🤗", label: "아주 좋아!" },
];

export function MindcareCard() {
  const [checkin, setCheckin] = useState<{
    mood_level: number;
    ai_message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sosMessage, setSosMessage] = useState<string | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    async function fetchCheckin() {
      try {
        const res = await fetch("/api/mindcare/checkin");
        const data = await res.json();
        if (data.checkin) setCheckin(data.checkin);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchCheckin();
  }, []);

  async function handleMood(value: number) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mindcare/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood_level: value }),
      });
      const data = await res.json();
      if (data.checkin) setCheckin(data.checkin);
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleSos() {
    if (sosLoading) return;
    setSosLoading(true);
    try {
      const res = await fetch("/api/mindcare/sos", { method: "POST" });
      const data = await res.json();
      if (data.message) setSosMessage(data.message);
    } catch { /* ignore */ }
    setSosLoading(false);
  }

  if (loading) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-5 border border-purple-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-purple-300">멘탈 케어</span>
        </div>
        <Link
          href="/mindcare"
          className="text-xs text-slate-500 hover:text-purple-400 transition-colors"
        >
          멘토와 대화하기 →
        </Link>
      </div>

      {!checkin ? (
        <>
          <p className="text-sm text-slate-300">오늘 마음이 어때요?</p>
          <div className="flex items-center justify-between gap-1">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMood(m.value)}
                disabled={submitting}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-purple-500/10 transition-all hover:scale-105 disabled:opacity-50"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-slate-500">{m.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-lg">
              {MOODS.find((m) => m.value === checkin.mood_level)?.emoji}
            </span>
            <span>
              {MOODS.find((m) => m.value === checkin.mood_level)?.label}
            </span>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            <ReactMarkdown>{checkin.ai_message}</ReactMarkdown>
          </div>

          {/* SOS Button */}
          <div className="pt-1">
            {!sosMessage ? (
              <button
                onClick={handleSos}
                disabled={sosLoading}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                {sosLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                지금 힘들어요
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-2">
                <p className="text-sm text-slate-300 leading-relaxed">{sosMessage}</p>
                <Link
                  href="/mindcare"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  더 이야기하고 싶다면 →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Send, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PostType } from "./share-card";

const POST_TYPES: { value: PostType; label: string; emoji: string }[] = [
  { value: "concept", label: "핵심 개념", emoji: "📖" },
  { value: "struggle", label: "어려웠던 것", emoji: "😤" },
  { value: "tip", label: "발견한 팁", emoji: "💡" },
];

interface ShareFormProps {
  onPostCreated: () => void;
}

export function ShareForm({ onPostCreated }: ShareFormProps) {
  const [postType, setPostType] = useState<PostType>("tip");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("내용을 입력해주세요");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          post_type: postType,
          is_anonymous: isAnonymous,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "오류가 발생했습니다");
      }
      toast.success("학습 내용을 공유했습니다!");
      setContent("");
      onPostCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "공유에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4"
    >
      <div className="flex gap-2">
        {POST_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setPostType(type.value)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
              postType === type.value
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            {type.emoji} {type.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          postType === "concept"
            ? "오늘 배운 핵심 개념을 한 줄로 요약해보세요..."
            : postType === "struggle"
            ? "어떤 부분이 어려웠나요? 공유하면 같이 해결할 수 있어요..."
            : "학습 중 발견한 유용한 팁을 공유해보세요..."
        }
        rows={3}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${
            isAnonymous
              ? "bg-slate-700 text-slate-300 border border-slate-600"
              : "text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          익명으로 공유
        </button>

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? "공유 중..." : "공유하기"}
        </button>
      </div>
    </form>
  );
}

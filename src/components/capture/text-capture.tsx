"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CaptureItem } from "@/app/capture/page";

interface Props {
  module: string;
  topic: string;
  onCapture: (item: CaptureItem) => void;
}

export function TextCapture({ module, topic, onCapture }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);

    const captureContent = content.trim();
    setContent("");

    let category = "concept";
    let tags: string[] = [];
    try {
      const res = await fetch("/api/capture/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: captureContent, module, topic }),
      });
      const data = await res.json();
      category = data.category;
      tags = data.tags;
    } catch {
      // Fallback to default
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("captures").insert({
        user_id: user.id,
        capture_type: "text",
        content: captureContent,
        ai_category: category,
        ai_tags: tags,
      });
      if (error) {
        toast.error("저장 실패: " + error.message);
      }
    }

    onCapture({
      id: crypto.randomUUID(),
      content: captureContent,
      capture_type: "text",
      ai_category: category,
      ai_tags: tags,
      created_at: new Date().toISOString(),
    });

    setLoading(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="space-y-3 mt-4">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="오늘 배운 것, 떠오른 생각, 의문점을 자유롭게 던져주세요... (Enter로 제출, Shift+Enter로 줄바꿈)"
        className="min-h-[120px] bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
        autoFocus
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          size="sm"
        >
          {loading ? (
            "분류 중..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> 캡처
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

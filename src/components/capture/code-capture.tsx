"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { CaptureItem } from "@/app/capture/page";

interface Props {
  module: string;
  topic: string;
  onCapture: (item: CaptureItem) => void;
}

export function CodeCapture({ module, topic, onCapture }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);

    const captureContent = code.trim();
    setCode("");

    let category = "code";
    let tags: string[] = [];
    let coaching: string | null = null;
    try {
      const res = await fetch("/api/capture/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: captureContent, module, topic }),
      });
      const data = await res.json();
      category = data.category;
      tags = data.tags;
      coaching = data.coaching ?? null;
    } catch {
      // Fallback to default
    }

    onCapture({
      id: crypto.randomUUID(),
      content: captureContent,
      capture_type: "code",
      ai_category: category,
      ai_tags: tags,
      ai_coaching: coaching,
      created_at: new Date().toISOString(),
    });

    setLoading(false);
  }

  return (
    <div className="space-y-3 mt-4">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="코드를 붙여넣거나 작성하세요..."
        className="min-h-[160px] bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm placeholder:text-slate-500 resize-none"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || !code.trim()}
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" /> 캡처
        </Button>
      </div>
    </div>
  );
}

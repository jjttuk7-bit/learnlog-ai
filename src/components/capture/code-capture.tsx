"use client";

import { useState } from "react";
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
    let suggestedTerms: string[] = [];
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
      suggestedTerms = data.suggestedTerms ?? [];
    } catch {
      // Fallback to default
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("captures").insert({
        user_id: user.id,
        capture_type: "code",
        content: captureContent,
        ai_category: category,
        ai_tags: tags,
        ai_coaching: coaching,
      });
      if (error) {
        toast.error("저장 실패: " + error.message);
      }
    }

    onCapture({
      id: crypto.randomUUID(),
      content: captureContent,
      capture_type: "code",
      ai_category: category,
      ai_tags: tags,
      ai_coaching: coaching,
      ai_suggested_terms: suggestedTerms.length > 0 ? suggestedTerms : null,
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

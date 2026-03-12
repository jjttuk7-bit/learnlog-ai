"use client";

import { useState, useEffect } from "react";
import { getTodayCurriculum } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/client";
import { TextCapture } from "@/components/capture/text-capture";
import { VoiceCapture } from "@/components/capture/voice-capture";
import { CodeCapture } from "@/components/capture/code-capture";
import { CaptureList } from "@/components/capture/capture-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenLine, Mic, Code } from "lucide-react";

export interface CaptureItem {
  id: string;
  content: string;
  capture_type: "text" | "voice" | "code";
  ai_category: string | null;
  ai_tags: string[] | null;
  ai_coaching: string | null;
  created_at: string;
}

export default function CapturePage() {
  const today = getTodayCurriculum();
  const [captures, setCaptures] = useState<CaptureItem[]>([]);

  useEffect(() => {
    async function loadCaptures() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("captures")
        .select("id, content, capture_type, ai_category, ai_tags, ai_coaching, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setCaptures(data);
    }
    loadCaptures();
  }, []);

  function addCapture(item: CaptureItem) {
    setCaptures((prev) => [item, ...prev]);
  }

  function removeCapture(id: string) {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }

  const module = today?.module ?? "학습 준비";
  const topic = today?.topic ?? "";
  const dayNumber = today?.dayNumber ?? "-";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Smart Capture</h1>
        <p className="text-slate-400 mt-1">
          Day {dayNumber} · {module} {topic && `· ${topic}`}
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <PenLine className="w-4 h-4" /> 텍스트
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" /> 음성
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" /> 코드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <TextCapture module={module} topic={topic} onCapture={addCapture} />
        </TabsContent>
        <TabsContent value="voice">
          <VoiceCapture module={module} topic={topic} onCapture={addCapture} />
        </TabsContent>
        <TabsContent value="code">
          <CodeCapture module={module} topic={topic} onCapture={addCapture} />
        </TabsContent>
      </Tabs>

      <CaptureList captures={captures} onRemove={removeCapture} />
    </div>
  );
}

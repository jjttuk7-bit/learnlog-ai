"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import type { CaptureItem } from "@/app/capture/page";

interface Props {
  module: string;
  topic: string;
  onCapture: (item: CaptureItem) => void;
}

export function VoiceCapture({ module, topic, onCapture }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  }

  async function handleSubmit() {
    if (!transcript.trim()) return;

    let category = "concept";
    let tags: string[] = [];
    let coaching: string | null = null;
    try {
      const res = await fetch("/api/capture/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: transcript, module, topic }),
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
      content: transcript,
      capture_type: "voice",
      ai_category: category,
      ai_tags: tags,
      ai_coaching: coaching,
      created_at: new Date().toISOString(),
    });
    setTranscript("");
  }

  if (!supported) {
    return (
      <div className="mt-4 p-6 bg-slate-800 rounded-lg border border-slate-700 text-center text-slate-400">
        이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col items-center gap-4 p-6 bg-slate-800 rounded-lg border border-slate-700">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className="rounded-full w-16 h-16"
          onClick={toggleListening}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
        <p className="text-sm text-slate-400">
          {isListening
            ? "듣고 있어요... 말해주세요"
            : "마이크를 눌러 음성 캡처 시작"}
        </p>
      </div>

      {transcript && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-slate-200 min-h-[80px]">
            {transcript}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} size="sm">
              <Send className="w-4 h-4 mr-2" /> 캡처
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript;
      if (text) onTranscript(text);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, [onTranscript]);

  function toggle() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setListening(!listening);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-2 rounded-lg transition-colors ${
        listening
          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
          : "text-slate-400 hover:text-white hover:bg-slate-700"
      } ${className || ""}`}
      title={listening ? "음성 입력 중지" : "음성으로 입력"}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}

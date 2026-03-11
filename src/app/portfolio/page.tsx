"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PortfolioBuilder } from "@/components/portfolio/builder";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";

interface ModuleSummary {
  module_name: string;
  period: string;
  key_concepts: string[];
  achievements: string[];
  growth_score: number;
  summary: string;
}

interface PortfolioData {
  title: string;
  intro: string;
  tagline: string;
  projects: { name: string; description: string; skills: string[]; outcome: string }[];
  growth_story: string;
  conclusion: string;
  total_growth_score: number;
}

const DEMO_MODULES_DATA = [
  {
    name: "JavaScript 기초",
    period: "2025.09 – 2025.10",
    captures: ["변수와 타입", "함수와 클로저", "비동기 처리", "Promise와 async/await"],
    quests: ["계산기 만들기", "할 일 목록 앱", "비동기 데이터 페칭"],
    coaching_notes: ["클로저 개념 심화", "이벤트 루프 이해"],
  },
  {
    name: "React 심화",
    period: "2025.11 – 2025.12",
    captures: ["컴포넌트 설계", "상태 관리", "훅 패턴", "성능 최적화"],
    quests: ["커스텀 훅 만들기", "상태 관리 리팩토링", "메모이제이션 적용"],
    coaching_notes: ["렌더링 최적화 전략", "상태 설계 원칙"],
  },
  {
    name: "TypeScript 적용",
    period: "2026.01 – 2026.02",
    captures: ["타입 시스템", "제네릭", "유틸리티 타입", "타입 가드"],
    quests: ["JS 프로젝트 TS 마이그레이션", "타입 안전 API 클라이언트"],
    coaching_notes: ["타입 추론 활용", "엄격 모드 설정"],
  },
];

export default function PortfolioPage() {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [portfolioId] = useState(() => `demo-${Date.now()}`);

  async function handleGenerate() {
    setStatus("generating");
    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "demo-user",
          modules_data: DEMO_MODULES_DATA,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "생성 실패");
      }

      const data = await res.json();
      setPortfolio(data.portfolio);
      setModules(data.modules);
      setStatus("done");
      toast.success("포트폴리오가 생성되었습니다!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "포트폴리오 생성 중 오류가 발생했습니다.");
      setStatus("idle");
    }
  }

  function handleSave(updated: PortfolioData) {
    setPortfolio(updated);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">포트폴리오</h1>
        <p className="text-slate-400 mt-1">AI가 학습 데이터를 분석하여 나만의 성장 스토리를 만듭니다</p>
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-white">포트폴리오를 아직 생성하지 않았습니다</h2>
            <p className="text-sm text-slate-400 max-w-md">
              AI가 지난 6개월간의 학습 캡처, 퀘스트, 코칭 기록을 분석하여
              <br />
              당신만의 성장 스토리 포트폴리오를 자동으로 생성합니다.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            AI로 포트폴리오 생성하기
          </Button>
        </div>
      )}

      {status === "generating" && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-white font-medium">포트폴리오를 생성하는 중...</p>
            <p className="text-sm text-slate-400">학습 데이터를 분석하고 성장 스토리를 작성합니다</p>
          </div>
        </div>
      )}

      {status === "done" && portfolio && (
        <PortfolioBuilder
          portfolio={portfolio}
          modules={modules}
          portfolioId={portfolioId}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

"use client";

import { BookOpen, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PublicPortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>LearnLog AI 포트폴리오</span>
          </div>
          <h1 className="text-3xl font-bold text-white">나의 학습 성장 스토리</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            6개월간의 학습 여정을 통해 쌓아온 지식과 경험을 소개합니다.
          </p>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">소개</h2>
          <p className="text-slate-300 leading-relaxed">
            포트폴리오를 공유하려면 /portfolio 페이지에서 포트폴리오를 생성한 후 공유 버튼을 클릭하세요.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">학습 모듈</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: "JavaScript 기초", period: "2025.09 – 2025.10", score: 8 },
              { name: "React 심화", period: "2025.11 – 2025.12", score: 9 },
              { name: "TypeScript 적용", period: "2026.01 – 2026.02", score: 7 },
            ].map((mod) => (
              <div
                key={mod.name}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-white">{mod.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{mod.period}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-bold">{mod.score}</span>
                  <span className="text-slate-500 text-sm">/10</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-500/10 to-slate-900 border border-blue-500/20 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">성장 스토리</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            체계적인 학습과 꾸준한 실습을 통해 프론트엔드 개발 역량을 단계적으로 쌓아왔습니다.
            단순한 스킬 습득을 넘어 문제 해결 사고방식과 지속적으로 성장하는 방법을 익혔습니다.
          </p>
        </section>

        <footer className="text-center space-y-2 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap justify-center gap-2">
            {["JavaScript", "React", "TypeScript", "Next.js"].map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-slate-800 text-slate-300 border-slate-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">
            LearnLog AI로 생성된 포트폴리오
          </p>
        </footer>
      </div>
    </div>
  );
}

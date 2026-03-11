"use client";

import { MessageSquare, RefreshCw, Lightbulb, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IndividualHighlight {
  member_name: string;
  highlight: string;
  suggestion: string;
}

interface RetroData {
  summary: string;
  keep_questions: string[];
  problem_questions: string[];
  try_questions: string[];
  collaboration_prompts: string[];
  individual_highlights: IndividualHighlight[];
  team_challenge: string;
}

interface TeamRetroProps {
  retro: RetroData;
  onRestart: () => void;
}

export function TeamRetro({ retro, onRestart }: TeamRetroProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-5">
        <p className="text-sm text-slate-300 leading-relaxed">{retro.summary}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded">KEEP</span>
            <span className="text-sm font-medium">잘 되고 있는 것</span>
          </div>
          <ul className="space-y-2">
            {retro.keep_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-xs font-bold px-2 py-0.5 bg-red-500/10 rounded">PROBLEM</span>
            <span className="text-sm font-medium">개선할 점</span>
          </div>
          <ul className="space-y-2">
            {retro.problem_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/10 rounded">TRY</span>
            <span className="text-sm font-medium">다음에 시도할 것</span>
          </div>
          <ul className="space-y-2">
            {retro.try_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {retro.collaboration_prompts.length > 0 && (
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">팀 협업 토론 주제</span>
          </div>
          <ul className="space-y-2">
            {retro.collaboration_prompts.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {retro.individual_highlights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">멤버별 하이라이트</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {retro.individual_highlights.map((h, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-1.5">
                <span className="text-xs font-medium text-white">{h.member_name}</span>
                <p className="text-xs text-slate-300">{h.highlight}</p>
                <p className="text-xs text-blue-400 italic">{h.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
        <Trophy className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-yellow-400 mb-1">다음 스프린트 챌린지</p>
          <p className="text-sm text-slate-300">{retro.team_challenge}</p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onRestart}
        className="border-slate-700 text-slate-400 hover:text-white gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        회고 다시 생성하기
      </Button>
    </div>
  );
}

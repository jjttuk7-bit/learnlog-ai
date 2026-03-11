"use client";

import { useState } from "react";
import { use } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TeamDashboard } from "@/components/team/team-dashboard";
import { TeamRetro } from "@/components/team/team-retro";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEMO_TEAM = {
  id: "demo-team-1",
  name: "AIFFELthon 1조",
  description: "AI 기반 학습 관리 서비스 개발",
};

const DEMO_MEMBERS = [
  { id: "m1", name: "김지수", role: "leader", captureCount: 18, questCount: 7, lastActive: "오늘" },
  { id: "m2", name: "이민준", role: "member", captureCount: 12, questCount: 5, lastActive: "어제" },
  { id: "m3", name: "박서연", role: "member", captureCount: 15, questCount: 6, lastActive: "2일 전" },
  { id: "m4", name: "최유진", role: "member", captureCount: 9, questCount: 4, lastActive: "3일 전" },
];

const DEMO_ACTIVITIES = [
  { id: "a1", user_name: "김지수", activity_type: "capture", content: "트랜스포머 어텐션 메커니즘 정리", created_at: "방금 전" },
  { id: "a2", user_name: "이민준", activity_type: "quest", content: "Sub-C Q12 완료", created_at: "1시간 전" },
  { id: "a3", user_name: "박서연", activity_type: "coach", content: "배치 정규화 개념 코칭 세션", created_at: "3시간 전" },
  { id: "a4", user_name: "최유진", activity_type: "capture", content: "드롭아웃 정규화 기법", created_at: "5시간 전" },
  { id: "a5", user_name: "이민준", activity_type: "capture", content: "CNN 구조 및 특징 맵", created_at: "어제" },
];

const DEMO_MEMBERS_DATA = DEMO_MEMBERS.map((m) => ({
  name: m.name,
  role: m.role === "leader" ? "팀장" : "팀원",
  capture_count: m.captureCount,
  quest_count: m.questCount,
  recent_topics: ["딥러닝", "트랜스포머", "CNN"],
}));

interface RetroData {
  summary: string;
  keep_questions: string[];
  problem_questions: string[];
  try_questions: string[];
  collaboration_prompts: string[];
  individual_highlights: { member_name: string; highlight: string; suggestion: string }[];
  team_challenge: string;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const team = DEMO_TEAM;

  const [retroStatus, setRetroStatus] = useState<"idle" | "loading" | "done">("idle");
  const [retro, setRetro] = useState<RetroData | null>(null);

  async function handleStartRetro() {
    setRetroStatus("loading");
    try {
      const res = await fetch("/api/team/retro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: id,
          members_data: DEMO_MEMBERS_DATA,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "회고 생성 실패");
      }

      const data = await res.json();
      setRetro(data.retro);
      setRetroStatus("done");
      toast.success("AI 팀 회고가 생성되었습니다!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "회고 생성 중 오류가 발생했습니다.");
      setRetroStatus("idle");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/team" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          {team.description && (
            <p className="text-slate-400 mt-0.5 text-sm">{team.description}</p>
          )}
        </div>
      </div>

      <TeamDashboard
        teamName={team.name}
        description={team.description}
        members={DEMO_MEMBERS}
        activities={DEMO_ACTIVITIES}
      />

      <div className="border-t border-slate-800 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">AI 팀 회고</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              팀 전체 학습 데이터를 분석하여 KPT 회고 질문을 생성합니다
            </p>
          </div>
          {retroStatus === "idle" && (
            <Button onClick={handleStartRetro} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Sparkles className="w-4 h-4" />
              AI 회고 시작
            </Button>
          )}
        </div>

        {retroStatus === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-white font-medium">팀 회고를 생성하는 중...</p>
              <p className="text-sm text-slate-400">팀원들의 학습 데이터를 분석합니다</p>
            </div>
          </div>
        )}

        {retroStatus === "done" && retro && (
          <TeamRetro retro={retro} onRestart={() => setRetroStatus("idle")} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, use } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TeamDashboard } from "@/components/team/team-dashboard";
import { TeamRetro } from "@/components/team/team-retro";
import { Sparkles, Loader2, ArrowLeft, Plus, Send } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: { display_name?: string; email?: string } | null;
}

interface ActivityItem {
  id: string;
  user_name: string;
  activity_type: string;
  content: string;
  created_at: string;
}

interface TeamData {
  id: string;
  name: string;
  description?: string;
}

interface RetroData {
  summary: string;
  keep_questions: string[];
  problem_questions: string[];
  try_questions: string[];
  collaboration_prompts: string[];
  individual_highlights: { member_name: string; highlight: string; suggestion: string }[];
  team_challenge: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  if (diffDay === 1) return "어제";
  return `${diffDay}일 전`;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [loadingPage, setLoadingPage] = useState(true);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: "note", content: "" });
  const [submittingActivity, setSubmittingActivity] = useState(false);

  const [retroStatus, setRetroStatus] = useState<"idle" | "loading" | "done">("idle");
  const [retro, setRetro] = useState<RetroData | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      const res = await fetch(`/api/team/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "팀 정보를 불러오지 못했습니다.");
      }
      const data = await res.json();
      setTeam(data.team);
      setMembers(data.members ?? []);
      setActivities(data.activities ?? []);
      setCurrentUserRole(data.currentUserRole ?? "member");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 정보 불러오기 실패");
    } finally {
      setLoadingPage(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityForm.content.trim()) {
      toast.error("활동 내용을 입력해주세요.");
      return;
    }
    setSubmittingActivity(true);
    try {
      const res = await fetch(`/api/team/${id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: activityForm.activity_type,
          content: activityForm.content,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "활동 기록 실패");
      }
      toast.success("활동이 기록되었습니다!");
      setActivityForm({ activity_type: "note", content: "" });
      setShowActivityForm(false);
      await fetchTeamData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "활동 기록 중 오류가 발생했습니다.");
    } finally {
      setSubmittingActivity(false);
    }
  }

  // Build member data for dashboard — map profiles to display name
  const dashboardMembers = members.map((m) => ({
    id: m.id,
    name: m.profiles?.display_name ?? m.profiles?.email ?? "팀원",
    role: m.role,
    captureCount: 0,
    questCount: 0,
    lastActive: formatRelativeTime(m.joined_at),
  }));

  // Build activity items with relative timestamps
  const dashboardActivities = activities.map((a) => ({
    ...a,
    created_at: formatRelativeTime(a.created_at),
  }));

  // Build members_data for retro
  const membersDataForRetro = dashboardMembers.map((m) => ({
    name: m.name,
    role: m.role === "leader" ? "팀장" : "팀원",
    capture_count: m.captureCount,
    quest_count: m.questCount,
    recent_topics: [],
  }));

  async function handleStartRetro() {
    setRetroStatus("loading");
    try {
      const res = await fetch("/api/team/retro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: id,
          members_data: membersDataForRetro,
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

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-4">
        <Link href="/team" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          팀 목록으로
        </Link>
        <p className="text-slate-400">팀을 찾을 수 없습니다.</p>
      </div>
    );
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
        <div className="ml-auto">
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            currentUserRole === "leader"
              ? "text-yellow-400 bg-yellow-400/10"
              : "text-slate-400 bg-slate-700/50"
          }`}>
            {currentUserRole === "leader" ? "팀장" : "팀원"}
          </span>
        </div>
      </div>

      <TeamDashboard
        teamName={team.name}
        description={team.description}
        members={dashboardMembers}
        activities={dashboardActivities}
      />

      {/* Activity log form */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">활동 기록</h2>
          <Button
            size="sm"
            onClick={() => setShowActivityForm((v) => !v)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 gap-1.5 h-7 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            활동 추가
          </Button>
        </div>

        {showActivityForm && (
          <form onSubmit={handleAddActivity} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={activityForm.activity_type}
                onChange={(e) => setActivityForm((f) => ({ ...f, activity_type: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="note">메모</option>
                <option value="capture">학습 캡처</option>
                <option value="quest">퀘스트 완료</option>
                <option value="coach">AI 코칭</option>
                <option value="retro">회고</option>
              </select>
            </div>
            <textarea
              value={activityForm.content}
              onChange={(e) => setActivityForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="오늘의 학습 활동을 팀원들과 공유해보세요"
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submittingActivity}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 gap-1.5 h-7 text-xs"
              >
                {submittingActivity ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                기록하기
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowActivityForm(false)}
                className="border-slate-700 text-slate-400 hover:text-white h-7 text-xs"
              >
                취소
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Team ID share */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1">팀 ID (팀원 초대용)</p>
          <p className="text-xs font-mono text-slate-300 truncate">{team.id}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(team.id);
            toast.success("팀 ID가 복사되었습니다!");
          }}
          className="border-slate-700 text-slate-400 hover:text-white shrink-0 h-7 text-xs"
        >
          복사
        </Button>
      </div>

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

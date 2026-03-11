"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, Loader2, ArrowRight, Copy } from "lucide-react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  role: string;
}

type Mode = "list" | "create" | "join";

export default function TeamPage() {
  const [mode, setMode] = useState<Mode>("list");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [inviteCode, setInviteCode] = useState("");

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("팀 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setTeams(data.teams ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 목록 불러오기 실패");
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("팀 이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createForm.name, description: createForm.description }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "팀 생성 실패");
      }
      const data = await res.json();
      toast.success(`"${data.team.name}" 팀이 생성되었습니다!`);
      setMode("list");
      setCreateForm({ name: "", description: "" });
      await fetchTeams();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("팀 ID를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/team/${inviteCode.trim()}/join`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "팀 참가 실패");
      }
      const data = await res.json();
      toast.success(`"${data.team.name}" 팀에 합류했습니다!`);
      setMode("list");
      setInviteCode("");
      await fetchTeams();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 참가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">팀</h1>
        <p className="text-slate-400 mt-1">AIFFELthon 팀과 함께 학습 기록을 공유하세요</p>
      </div>

      {mode === "list" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setMode("create")}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              팀 만들기
            </Button>
            <Button
              variant="outline"
              onClick={() => setMode("join")}
              className="border-slate-700 text-slate-300 hover:text-white gap-2"
            >
              <LogIn className="w-4 h-4" />
              팀 참가하기
            </Button>
          </div>

          {loadingTeams ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-medium">아직 속한 팀이 없습니다</p>
                <p className="text-sm text-slate-400">팀을 만들거나 팀 ID로 참가해보세요</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="group relative">
                  <Link
                    href={`/team/${team.id}`}
                    className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{team.name}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            team.role === "leader"
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-slate-400 bg-slate-700/50"
                          }`}
                        >
                          {team.role === "leader" ? "팀장" : "팀원"}
                        </span>
                      </div>
                      {team.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{team.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">팀원 {team.memberCount}명</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(team.id);
                      toast.success("팀 ID가 복사되었습니다!");
                    }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                    title="팀 ID 복사"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "create" && (
        <div className="max-w-md space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">새 팀 만들기</h2>
            <p className="text-sm text-slate-400 mt-1">AIFFELthon 프로젝트 팀을 생성합니다</p>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">팀 이름 *</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="예: AIFFELthon 1조"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">팀 설명</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="팀 프로젝트 목표나 주제를 입력하세요"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                팀 생성
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("list")}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      )}

      {mode === "join" && (
        <div className="max-w-md space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">팀 참가하기</h2>
            <p className="text-sm text-slate-400 mt-1">팀장에게 받은 팀 ID를 입력하세요</p>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">팀 ID *</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="팀 ID 입력 (예: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <p className="text-xs text-slate-500">팀 목록에서 팀 카드 위에 마우스를 올리면 ID 복사 버튼이 나타납니다</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                참가하기
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("list")}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

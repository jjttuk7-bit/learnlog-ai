"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Calendar, LogOut, Bell, BellOff,
  BarChart3, PenLine, Brain, Flame, Trophy, Download,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

interface Stats {
  totalCaptures: number;
  totalCoachSessions: number;
  avgUnderstanding: number;
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
}

export default function MyPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load notification preference
  useEffect(() => {
    const saved = localStorage.getItem("notifications-enabled");
    if (saved !== null) setNotifications(saved === "true");
  }, []);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [metricsRes, streakRes] = await Promise.all([
          fetch("/api/metrics"),
          fetch("/api/confidence/streak"),
        ]);
        const metrics = await metricsRes.json();
        const streak = await streakRes.json();

        setStats({
          totalCaptures: metrics.totalCaptures ?? 0,
          totalCoachSessions: metrics.totalCoachSessions ?? 0,
          avgUnderstanding: metrics.avgUnderstanding ?? 0,
          totalActiveDays: streak.total_active_days ?? 0,
          currentStreak: streak.current_streak ?? 0,
          longestStreak: streak.longest_streak ?? 0,
        });
      } catch {
        // ignore
      }
      setStatsLoading(false);
    }
    loadStats();
  }, []);

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("notifications-enabled", String(next));
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  // Format date
  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "학습자";

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <p className="text-slate-400 text-sm mt-0.5">프로필 및 설정</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필"
              className="w-16 h-16 rounded-full border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
              <User className="w-7 h-7 text-blue-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{displayName}</h2>
            {user?.email && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>가입일: {formatDate(user?.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">학습 통계</h3>
        {statsLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm">불러오는 중...</div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon={<Calendar className="w-4 h-4 text-blue-400" />}
              label="총 학습일"
              value={`${stats.totalActiveDays}일`}
            />
            <StatCard
              icon={<PenLine className="w-4 h-4 text-emerald-400" />}
              label="총 캡처"
              value={`${stats.totalCaptures}개`}
            />
            <StatCard
              icon={<Brain className="w-4 h-4 text-purple-400" />}
              label="코칭 세션"
              value={`${stats.totalCoachSessions}회`}
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
              label="평균 이해도"
              value={stats.avgUnderstanding > 0 ? `${stats.avgUnderstanding.toFixed(1)}/5` : "-"}
            />
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="현재 스트릭"
              value={`${stats.currentStreak}일`}
            />
            <StatCard
              icon={<Trophy className="w-4 h-4 text-yellow-400" />}
              label="최장 스트릭"
              value={`${stats.longestStreak}일`}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">통계를 불러올 수 없습니다</p>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">설정</h3>
        <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
          {/* Notifications */}
          <button
            onClick={toggleNotifications}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              {notifications ? (
                <Bell className="w-5 h-5 text-blue-400" />
              ) : (
                <BellOff className="w-5 h-5 text-slate-500" />
              )}
              <div className="text-left">
                <span className="text-sm font-medium text-slate-200">알림</span>
                <p className="text-xs text-slate-500 mt-0.5">학습 리마인더 및 코칭 알림</p>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full relative transition-colors ${
                notifications ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications ? "left-5" : "left-1"
                }`}
              />
            </div>
          </button>

          {/* PWA Install */}
          <button
            onClick={() => {
              // Trigger PWA install if available
              const event = new CustomEvent("trigger-pwa-install");
              window.dispatchEvent(event);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-750 transition-colors"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="text-sm font-medium text-slate-200">앱 설치</span>
              <p className="text-xs text-slate-500 mt-0.5">홈 화면에 추가하여 앱처럼 사용</p>
            </div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl px-4 py-3.5 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      >
        {loggingOut ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        로그아웃
      </button>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

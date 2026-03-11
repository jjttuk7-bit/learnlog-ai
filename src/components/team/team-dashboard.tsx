"use client";

import { Users, Activity, Calendar } from "lucide-react";
import { MemberCard } from "./member-card";

interface Member {
  id: string;
  name: string;
  role: string;
  captureCount: number;
  questCount: number;
  lastActive?: string;
}

interface ActivityItem {
  id: string;
  user_name: string;
  activity_type: string;
  content: string;
  created_at: string;
}

interface TeamDashboardProps {
  teamName: string;
  description?: string;
  members: Member[];
  activities: ActivityItem[];
}

function activityLabel(type: string) {
  const labels: Record<string, string> = {
    capture: "학습 캡처",
    quest: "퀘스트 완료",
    coach: "AI 코칭",
    retro: "팀 회고",
  };
  return labels[type] ?? type;
}

export function TeamDashboard({ teamName, description, members, activities }: TeamDashboardProps) {
  const totalCaptures = members.reduce((s, m) => s + m.captureCount, 0);
  const totalQuests = members.reduce((s, m) => s + m.questCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{members.length}</div>
          <div className="text-xs text-slate-400">팀원</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{totalCaptures}</div>
          <div className="text-xs text-slate-400">총 캡처</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{totalQuests}</div>
          <div className="text-xs text-slate-400">총 퀘스트</div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">팀원 현황</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              captureCount={member.captureCount}
              questCount={member.questCount}
              lastActive={member.lastActive}
            />
          ))}
        </div>
      </div>

      {activities.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">최근 활동</h2>
          <div className="space-y-2">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 bg-slate-800/30 border border-slate-800 rounded-lg px-4 py-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{act.user_name}</span>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                      {activityLabel(act.activity_type)}
                    </span>
                  </div>
                  {act.content && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{act.content}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 shrink-0">{act.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

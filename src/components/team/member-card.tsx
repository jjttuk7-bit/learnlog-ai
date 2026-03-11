"use client";

import { Crown, User } from "lucide-react";

interface MemberCardProps {
  name: string;
  role: string;
  captureCount: number;
  questCount: number;
  lastActive?: string;
}

export function MemberCard({ name, role, captureCount, questCount, lastActive }: MemberCardProps) {
  const isLeader = role === "leader";
  const progressScore = Math.min(100, captureCount * 5 + questCount * 10);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isLeader && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
            <span className="text-sm font-medium text-white truncate">{name}</span>
          </div>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              isLeader
                ? "text-yellow-400 bg-yellow-400/10"
                : "text-slate-400 bg-slate-700/50"
            }`}
          >
            {isLeader ? "팀장" : "팀원"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>활동 진도</span>
          <span>{progressScore}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressScore}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3 text-xs text-slate-400">
        <span>캡처 <span className="text-white font-medium">{captureCount}</span></span>
        <span>퀘스트 <span className="text-white font-medium">{questCount}</span></span>
        {lastActive && <span className="ml-auto">{lastActive}</span>}
      </div>
    </div>
  );
}

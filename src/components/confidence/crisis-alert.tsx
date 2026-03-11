"use client";

import { isHighIntensityPeriod, getCurrentModule } from "@/lib/curriculum";
import { AlertTriangle, Shield } from "lucide-react";

export function CrisisAlert() {
  const isHigh = isHighIntensityPeriod();
  const currentModule = getCurrentModule();

  if (!isHigh) return null;

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <span className="font-medium text-red-300 text-sm">
          고난이도 구간 진행 중
        </span>
      </div>
      <p className="text-sm text-slate-300">
        <strong>{currentModule?.name}</strong> 구간은 아이펠 과정에서 가장
        도전적인 시기입니다. 이 시기에 어렵다고 느끼는 건 정상이에요 — 모든
        수강생이 같은 경험을 합니다.
      </p>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Shield className="w-3 h-3" />
        <span>
          완벽하지 않아도 괜찮아요. 매일 기록하는 것 자체가 성장입니다.
        </span>
      </div>
    </div>
  );
}

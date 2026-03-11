"use client";

import { MODULES } from "@/data/curriculum";
import { getCurrentModule } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";

export function ModuleProgress() {
  const current = getCurrentModule();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">모듈 타임라인</h2>
      <div className="space-y-2">
        {MODULES.map((mod) => {
          const isCurrent = current?.name === mod.name;
          const isPast = new Date(mod.endDate) < new Date();
          const stars = "\u2B50".repeat(mod.difficulty);

          return (
            <div
              key={mod.name}
              className={`p-3 rounded-lg border transition-colors ${
                isCurrent
                  ? "bg-blue-500/10 border-blue-500/30"
                  : isPast
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                      진행중
                    </Badge>
                  )}
                  {isPast && (
                    <Badge variant="outline" className="text-green-400 border-green-500/30 text-[10px]">
                      완료
                    </Badge>
                  )}
                  <span className={`text-sm font-medium ${isPast ? "text-slate-500" : "text-slate-200"}`}>
                    {mod.name}
                  </span>
                </div>
                <span className="text-xs">{stars}</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                <span>{mod.totalDays}일</span>
                <span>{mod.startDate} ~ {mod.endDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

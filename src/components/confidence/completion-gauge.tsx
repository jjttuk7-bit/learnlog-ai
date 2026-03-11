"use client";

interface Props {
  percentage: number;
}

export function CompletionGauge({ percentage }: Props) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage >= 80
      ? "text-green-400"
      : percentage >= 50
        ? "text-blue-400"
        : "text-yellow-400";

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percentage}%</span>
        </div>
      </div>
      <div>
        <div className="font-medium text-sm">완주 예측</div>
        <p className="text-xs text-slate-400 mt-0.5">
          현재 페이스를 유지하면 과정을 완주할 확률입니다
        </p>
      </div>
    </div>
  );
}

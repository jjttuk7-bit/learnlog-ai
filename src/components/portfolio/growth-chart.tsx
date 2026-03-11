"use client";

interface GrowthDataPoint {
  module_name: string;
  growth_score: number;
  period: string;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length === 0) return null;

  const maxScore = 10;
  const chartHeight = 120;
  const chartWidth = 100;
  const padding = { top: 8, right: 8, bottom: 32, left: 28 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth,
    y: innerHeight - (d.growth_score / maxScore) * innerHeight,
    score: d.growth_score,
    label: d.module_name,
  }));

  const pathD =
    points.length > 1
      ? points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ")
      : `M ${points[0].x} ${points[0].y}`;

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${innerHeight} L ${points[0].x} ${innerHeight} Z`
      : `M ${points[0].x} ${points[0].y} L ${points[0].x} ${innerHeight} Z`;

  const viewBox = `0 0 ${chartWidth} ${chartHeight}`;

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-slate-400 mb-3">모듈별 성장 점수</h3>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <svg
          viewBox={viewBox}
          className="w-full"
          style={{ height: "160px" }}
          preserveAspectRatio="none"
        >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {[0, 2, 4, 6, 8, 10].map((tick) => {
              const y = innerHeight - (tick / maxScore) * innerHeight;
              return (
                <g key={tick}>
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.5"
                  />
                  <text
                    x={-4}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#64748b"
                    fontSize="3.5"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {points.length > 1 && (
              <path d={areaD} fill="url(#areaGradient)" />
            )}

            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="2" fill="#3b82f6" />
                <text
                  x={p.x}
                  y={p.y - 5}
                  textAnchor="middle"
                  fill="#93c5fd"
                  fontSize="3.5"
                  fontWeight="bold"
                >
                  {p.score}
                </text>
                <text
                  x={p.x}
                  y={innerHeight + 10}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="3"
                >
                  {p.label.length > 8 ? p.label.slice(0, 8) + "…" : p.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

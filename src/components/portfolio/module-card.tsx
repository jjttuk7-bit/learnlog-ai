"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, TrendingUp } from "lucide-react";

interface ModuleCardProps {
  module_name: string;
  period: string;
  key_concepts: string[];
  achievements: string[];
  growth_score: number;
  summary: string;
}

export function ModuleCard({
  module_name,
  period,
  key_concepts,
  achievements,
  growth_score,
  summary,
}: ModuleCardProps) {
  const scoreColor =
    growth_score >= 8
      ? "text-green-400"
      : growth_score >= 6
      ? "text-blue-400"
      : growth_score >= 4
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-white text-base">{module_name}</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">{period}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className={`text-lg font-bold ${scoreColor}`}>{growth_score}</span>
            <span className="text-xs text-slate-500">/10</span>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">핵심 개념</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {key_concepts.map((concept) => (
              <Badge
                key={concept}
                variant="secondary"
                className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs"
              >
                {concept}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-slate-400">주요 성취</span>
          </div>
          <ul className="space-y-1">
            {achievements.map((achievement) => (
              <li key={achievement} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-yellow-400 mt-0.5">•</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

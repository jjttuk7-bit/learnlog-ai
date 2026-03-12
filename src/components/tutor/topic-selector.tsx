"use client";

import { useMemo } from "react";
import { CURRICULUM } from "@/data/curriculum";
import { getTodayCurriculum } from "@/lib/curriculum";

interface Props {
  value: string;
  onChange: (topic: string, module: string) => void;
}

export function TopicSelector({ value, onChange }: Props) {
  const today = getTodayCurriculum();

  const topics = useMemo(() => {
    const seen = new Set<string>();
    return CURRICULUM.filter((d) => {
      if (seen.has(d.topic)) return false;
      seen.add(d.topic);
      return true;
    });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof topics>();
    for (const t of topics) {
      const list = map.get(t.module) ?? [];
      list.push(t);
      map.set(t.module, list);
    }
    return map;
  }, [topics]);

  return (
    <select
      value={value}
      onChange={(e) => {
        const selected = topics.find((t) => t.topic === e.target.value);
        onChange(e.target.value, selected?.module ?? "");
      }}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
    >
      {today && (
        <option value={today.topic}>
          📌 오늘: {today.topic} ({today.module})
        </option>
      )}
      <option value="">자유 질문 (토픽 없음)</option>
      {Array.from(grouped.entries()).map(([module, days]) => (
        <optgroup key={module} label={module}>
          {days.map((d) => (
            <option
              key={d.dayNumber}
              value={d.topic}
              disabled={d.topic === today?.topic}
            >
              Day {d.dayNumber}: {d.topic}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

"use client";

import { getTodayCurriculum } from "@/lib/curriculum";
import { BlankRecallSession } from "@/components/coach/blank-recall-session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlankRecallPage() {
  const today = getTodayCurriculum();
  return (
    <div className="space-y-6">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> AI 코치
      </Link>
      <BlankRecallSession
        module={today?.module ?? "학습 준비"}
        topic={today?.topic ?? ""}
      />
    </div>
  );
}

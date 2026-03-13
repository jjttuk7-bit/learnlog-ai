"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTodayCurriculum } from "@/lib/curriculum";
import { FeynmanSession } from "@/components/coach/feynman-session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function FeynmanContent() {
  const today = getTodayCurriculum();
  const searchParams = useSearchParams();
  const conceptOverride = searchParams.get("concept");
  const moduleOverride = searchParams.get("module");

  return (
    <div className="space-y-6">
      <Link href="/coach" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> AI 코치
      </Link>
      <FeynmanSession
        module={moduleOverride ?? today?.module ?? "학습 준비"}
        topic={conceptOverride ?? today?.topic ?? ""}
        initialConcept={conceptOverride ?? undefined}
      />
    </div>
  );
}

export default function FeynmanPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-6">로딩 중...</div>}>
      <FeynmanContent />
    </Suspense>
  );
}

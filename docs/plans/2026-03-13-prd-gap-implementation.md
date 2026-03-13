# PRD 갭 9개 항목 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** LearnLog AI PRD v5에서 미구현된 9개 기능을 구현하여 완전한 서비스로 업그레이드

**Architecture:** 기존 Next.js + Supabase + OpenAI 구조 유지. 새 DB 테이블 2개 추가(weakness_concepts, feynman_scores), 기존 quest_logs 테이블의 hint_log 활용. API 라우트 신규 3개, 기존 수정 4개, 컴포넌트 신규 3개, 기존 수정 6개.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL), OpenAI API, React 19, Tailwind CSS, SVG 차트

---

### Task 1: DB 마이그레이션 — weakness_concepts + feynman_scores 테이블

**Files:**
- Create: `supabase/migrations/010_weakness_and_feynman.sql`

**Step 1: 마이그레이션 SQL 작성**

```sql
-- 약점 개념 추적
CREATE TABLE weakness_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  module TEXT NOT NULL,
  topic TEXT,
  fail_count INT DEFAULT 1,
  last_asked TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 파인만 설명 품질 기록
CREATE TABLE feynman_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  module TEXT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  feedback_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE weakness_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feynman_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own weakness" ON weakness_concepts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own feynman" ON feynman_scores FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_weakness_user ON weakness_concepts(user_id, resolved, last_asked DESC);
CREATE INDEX idx_feynman_user ON feynman_scores(user_id, created_at DESC);
CREATE INDEX idx_feynman_concept ON feynman_scores(user_id, concept, created_at DESC);
```

**Step 2: Supabase 대시보드에서 SQL 실행하거나 supabase db push**

**Step 3: 커밋**
```bash
git add supabase/migrations/010_weakness_and_feynman.sql
git commit -m "feat: add weakness_concepts and feynman_scores tables"
```

---

### Task 2: 완주 예측 게이지 — 실데이터 API

**Files:**
- Create: `src/app/api/confidence/completion/route.ts`
- Modify: `src/components/confidence/completion-gauge.tsx`

**Step 1: API 라우트 작성**

`src/app/api/confidence/completion/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM } from "@/data/curriculum";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ percentage: 0 });
  }

  const today = new Date().toISOString().split("T")[0];
  const pastDays = CURRICULUM.filter((d) => d.date <= today);
  const totalPastDays = pastDays.length || 1;

  // 1. 기록일수 — 캡처가 있는 고유 날짜 수
  const { data: captureDays } = await supabase
    .from("captures")
    .select("created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const uniqueCaptureDays = new Set(
    (captureDays || []).map((c) => c.created_at?.split("T")[0])
  ).size;
  const recordRate = Math.min(uniqueCaptureDays / totalPastDays, 1);

  // 2. 코칭 완료율 — 코칭 세션이 있는 고유 날짜 수
  const { data: coachDays } = await supabase
    .from("coach_sessions")
    .select("created_at")
    .eq("user_id", user.id);

  const uniqueCoachDays = new Set(
    (coachDays || []).map((c) => c.created_at?.split("T")[0])
  ).size;
  const coachRate = Math.min(uniqueCoachDays / totalPastDays, 1);

  // 3. 평균 이해도
  const { data: levels } = await supabase
    .from("coach_sessions")
    .select("understanding_level")
    .eq("user_id", user.id)
    .not("understanding_level", "is", null);

  const avgLevel = levels && levels.length > 0
    ? levels.reduce((sum, l) => sum + (l.understanding_level || 0), 0) / levels.length
    : 2.5;

  // 가중 계산: 기록률 40% + 코칭률 30% + 이해도 30%
  const percentage = Math.round(
    recordRate * 40 + coachRate * 30 + (avgLevel / 5) * 30
  );

  return Response.json({
    percentage: Math.min(Math.max(percentage, 0), 100),
    details: {
      recordRate: Math.round(recordRate * 100),
      coachRate: Math.round(coachRate * 100),
      avgLevel: Math.round(avgLevel * 10) / 10,
      recordedDays: uniqueCaptureDays,
      coachedDays: uniqueCoachDays,
      totalPastDays,
    },
  });
}
```

**Step 2: CompletionGauge 컴포넌트를 동적 데이터로 수정**

`src/components/confidence/completion-gauge.tsx` — 전체 교체:
```typescript
"use client";

import { useState, useEffect } from "react";

export function CompletionGauge() {
  const [percentage, setPercentage] = useState<number | null>(null);
  const [details, setDetails] = useState<{
    recordRate: number;
    coachRate: number;
    avgLevel: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/confidence/completion");
        const data = await res.json();
        setPercentage(data.percentage);
        setDetails(data.details);
      } catch {
        setPercentage(0);
      }
    }
    load();
  }, []);

  const pct = percentage ?? 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 80 ? "text-green-400" : pct >= 50 ? "text-blue-400" : "text-yellow-400";

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className={color}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {percentage === null ? (
            <span className="text-sm text-slate-500">...</span>
          ) : (
            <span className="text-lg font-bold">{pct}%</span>
          )}
        </div>
      </div>
      <div>
        <div className="font-medium text-sm">완주 예측</div>
        <p className="text-xs text-slate-400 mt-0.5">
          현재 페이스 기반 실시간 산출
        </p>
        {details && (
          <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
            <span>기록 {details.recordRate}%</span>
            <span>코칭 {details.coachRate}%</span>
            <span>이해도 {details.avgLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Dashboard에서 CompletionGauge props 제거**

`src/app/page.tsx` 수정:
- 변경 전: `<CompletionGauge percentage={85} />`
- 변경 후: `<CompletionGauge />`

**Step 4: 커밋**
```bash
git add src/app/api/confidence/completion/route.ts src/components/confidence/completion-gauge.tsx src/app/page.tsx
git commit -m "feat: completion gauge uses real data from captures and coach sessions"
```

---

### Task 3: 약점 개념 재질문 시스템

**Files:**
- Modify: `src/app/api/coach/evaluate/route.ts` (약점 저장 로직 추가)
- Modify: `src/app/api/coach/checkin/route.ts` (약점 주입 로직 추가)

**Step 1: evaluate API에 약점 저장 로직 추가**

`src/app/api/coach/evaluate/route.ts` — 기존 JSON 파싱 성공 블록 뒤에 추가:
```typescript
// 파싱 성공 후, understanding_level <= 3이면 약점 저장
if (parsed.understanding_level <= 3) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // 기존 약점이 있으면 fail_count 증가, 없으면 새로 생성
    const { data: existing } = await supabase
      .from("weakness_concepts")
      .select("id, fail_count")
      .eq("user_id", user.id)
      .eq("concept", topic || "")
      .eq("resolved", false)
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from("weakness_concepts")
        .update({ fail_count: existing.fail_count + 1, last_asked: new Date().toISOString() })
        .eq("id", existing.id);
    } else if (topic) {
      await supabase.from("weakness_concepts").insert({
        user_id: user.id,
        concept: topic,
        module: module || "",
        topic: question || "",
        fail_count: 1,
      });
    }
  }
}

// understanding_level >= 4이면 약점 해결 처리
if (parsed.understanding_level >= 4) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && topic) {
    await supabase
      .from("weakness_concepts")
      .update({ resolved: true })
      .eq("user_id", user.id)
      .eq("concept", topic)
      .eq("resolved", false);
  }
}
```

import 추가: `import { createClient as createServerClient } from "@/lib/supabase/server";`

**Step 2: checkin API에 약점 개념 주입**

`src/app/api/coach/checkin/route.ts` — systemPrompt 생성 전에 약점 조회 추가:
```typescript
// 미해결 약점 개념 조회
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();
let weaknessList = "";
if (user) {
  const { data: weaknesses } = await supabase
    .from("weakness_concepts")
    .select("concept, module, fail_count")
    .eq("user_id", user.id)
    .eq("resolved", false)
    .order("fail_count", { ascending: false })
    .limit(5);

  if (weaknesses && weaknesses.length > 0) {
    weaknessList = "\n\n## 이전 학습에서 약했던 개념 (우선 재질문 대상)\n" +
      weaknesses.map((w) => `- ${w.concept} (${w.module}, ${w.fail_count}회 어려움)`).join("\n") +
      "\n\n위 약점 개념 중 오늘 주제와 관련 있는 것이 있다면, 반드시 질문에 포함하세요.";
  }
}
```

systemPrompt에 `${weaknessList}` 추가 (마지막 줄 한국어 응답 전에 삽입).

import 추가: `import { createClient as createServerClient } from "@/lib/supabase/server";`

**Step 3: 커밋**
```bash
git add src/app/api/coach/evaluate/route.ts src/app/api/coach/checkin/route.ts
git commit -m "feat: track weak concepts and re-ask them in coach sessions"
```

---

### Task 4: 퀘스트 회고 연결

**Files:**
- Modify: `src/app/quest/[id]/page.tsx` (회고 버튼 추가)

**Step 1: 퀘스트 상세 페이지에 회고 연결 버튼 추가**

`src/app/quest/[id]/page.tsx` — HintSystem 다음에 추가:
```tsx
{/* 퀘스트 회고 연결 */}
<div className="border-t border-slate-700 pt-6 space-y-3">
  <h3 className="font-semibold">퀘스트 회고</h3>
  <p className="text-sm text-slate-400">
    퀘스트에서 다룬 개념을 더 깊이 이해하기 위해 회고해보세요
  </p>
  <div className="flex gap-3">
    <Link
      href={`/coach/feynman?concept=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
    >
      <BookOpen className="w-4 h-4" />
      파인만 모드로 회고
    </Link>
    <Link
      href={`/coach/blank-recall?topic=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
    >
      <FileText className="w-4 h-4" />
      백지학습으로 회고
    </Link>
  </div>
</div>
```

import 추가: `import { BookOpen, FileText } from "lucide-react";`

**Step 2: 파인만 페이지에서 URL 파라미터 수신**

`src/app/coach/feynman/page.tsx` — URL 파라미터로 개념/모듈 오버라이드:
```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { getTodayCurriculum } from "@/lib/curriculum";
import { FeynmanSession } from "@/components/coach/feynman-session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FeynmanPage() {
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
```

**Step 3: FeynmanSession에 initialConcept prop 추가**

`src/components/coach/feynman-session.tsx` — Props에 `initialConcept?: string` 추가:
- `interface Props` 에 `initialConcept?: string;` 추가
- `setConcept` 초기값: `const [concept, setConcept] = useState<string | null>(initialConcept ?? null);`
- `initialConcept`이 있으면 자동으로 개념 선정 건너뛰기

**Step 4: 커밋**
```bash
git add src/app/quest/[id]/page.tsx src/app/coach/feynman/page.tsx src/components/coach/feynman-session.tsx
git commit -m "feat: connect quest retrospective to Feynman and blank-recall modes"
```

---

### Task 5: 퀘스트 힌트 사용 기록

**Files:**
- Modify: `src/app/api/quest/hint/route.ts` (DB 기록 추가)
- Modify: `src/components/quest/hint-system.tsx` (기존 기록 표시)

**Step 1: hint API에 DB 기록 추가**

`src/app/api/quest/hint/route.ts` — 힌트 생성 후 기존 quest_logs 활용:
```typescript
// 힌트 응답 생성 후, quest_logs에 기록
import { createClient as createServerClient } from "@/lib/supabase/server";

// POST 함수 내부, 응답 반환 전에:
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: existing } = await supabase
    .from("quest_logs")
    .select("id, hints_used, hint_log")
    .eq("user_id", user.id)
    .eq("quest_id", questId || questTitle)
    .limit(1)
    .single();

  const hintEntry = { level, stuckPoint, timestamp: new Date().toISOString() };

  if (existing) {
    const currentLog = Array.isArray(existing.hint_log) ? existing.hint_log : [];
    await supabase
      .from("quest_logs")
      .update({
        hints_used: (existing.hints_used || 0) + 1,
        hint_log: [...currentLog, hintEntry],
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("quest_logs").insert({
      user_id: user.id,
      quest_id: questId || questTitle,
      status: "in_progress",
      hints_used: 1,
      hint_log: [hintEntry],
    });
  }
}
```

API body에 `questId` 파라미터 추가로 수신.

**Step 2: HintSystem에 questId 전달 및 기존 힌트 수 표시**

`src/components/quest/hint-system.tsx`:
- `requestHint` 에서 body에 `questId: quest.id` 추가
- 컴포넌트 마운트 시 기존 힌트 사용 수 조회 표시:

```typescript
const [totalHintsUsed, setTotalHintsUsed] = useState(0);

useEffect(() => {
  async function loadHintHistory() {
    try {
      const res = await fetch(`/api/quest/hint-stats?questId=${quest.id}`);
      const data = await res.json();
      setTotalHintsUsed(data.hintsUsed || 0);
    } catch { /* ignore */ }
  }
  loadHintHistory();
}, [quest.id]);
```

하단 텍스트 수정:
```tsx
<div className="text-xs text-slate-500">
  이번 세션 힌트: {currentLevel}/3 단계
  {totalHintsUsed > 0 && <span> · 누적 힌트 사용: {totalHintsUsed}회</span>}
</div>
```

**Step 3: hint-stats API 작성**

`src/app/api/quest/hint-stats/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const questId = request.nextUrl.searchParams.get("questId");
  if (!questId) return Response.json({ hintsUsed: 0 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ hintsUsed: 0 });

  const { data } = await supabase
    .from("quest_logs")
    .select("hints_used")
    .eq("user_id", user.id)
    .eq("quest_id", questId)
    .limit(1)
    .single();

  return Response.json({ hintsUsed: data?.hints_used || 0 });
}
```

**Step 4: 커밋**
```bash
git add src/app/api/quest/hint/route.ts src/app/api/quest/hint-stats/route.ts src/components/quest/hint-system.tsx
git commit -m "feat: track quest hint usage in quest_logs table"
```

---

### Task 6: 위기 구간 2주 전 사전 경보

**Files:**
- Modify: `src/lib/curriculum.ts` (getUpcomingHighIntensity 함수 추가)
- Modify: `src/components/dashboard/daily-brief.tsx` (사전 경보 배너 추가)

**Step 1: curriculum.ts에 함수 추가**

`src/lib/curriculum.ts` 끝에 추가:
```typescript
/** Get upcoming high-intensity period within N days */
export function getUpcomingHighIntensity(
  daysAhead: number = 14,
  today?: string
): { module: Module; daysUntil: number } | null {
  const dateStr = today ?? new Date().toISOString().split("T")[0];
  const todayDate = new Date(dateStr + "T00:00:00");
  const futureDate = new Date(todayDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const highIntensityModules = ["LLM 활용", "DLthon 2", "모델 배포 기초", "MLOps", "파이널 프로젝트"];

  // 현재 이미 고난이도 구간이면 null (당일 경고는 isHighIntensityPeriod가 담당)
  const current = getCurrentModule(dateStr);
  if (current && highIntensityModules.includes(current.name)) return null;

  // 앞으로 N일 내에 시작되는 고난이도 모듈 찾기
  const upcoming = MODULES.find(
    (m) => highIntensityModules.includes(m.name) && m.startDate > dateStr && m.startDate <= futureDateStr
  );

  if (!upcoming) return null;

  const diffMs = new Date(upcoming.startDate + "T00:00:00").getTime() - todayDate.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return { module: upcoming, daysUntil };
}
```

**Step 2: DailyBrief에 사전 경보 배너 추가**

`src/components/dashboard/daily-brief.tsx`:
- import에 `getUpcomingHighIntensity` 추가
- 컴포넌트 내에 `const upcomingHard = getUpcomingHighIntensity();`

High Intensity Warning 블록 위에 추가:
```tsx
{/* 2주 전 사전 경보 */}
{upcomingHard && (
  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-sm text-amber-300 font-medium">
        {upcomingHard.daysUntil}일 후 고난이도 구간 진입 예정
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        {upcomingHard.module.name} ({upcomingHard.module.description}). 이 구간은 모두가 어려워합니다. 지금부터 기초를 탄탄히 다져두세요!
      </p>
    </div>
  </div>
)}
```

**Step 3: 커밋**
```bash
git add src/lib/curriculum.ts src/components/dashboard/daily-brief.tsx
git commit -m "feat: warn 2 weeks before high-intensity curriculum periods"
```

---

### Task 7: 파인만 설명 품질 향상 곡선

**Files:**
- Modify: `src/app/api/coach/feynman/route.ts` (점수 저장)
- Create: `src/components/coach/feynman-growth-chart.tsx` (SVG 라인차트)
- Modify: `src/app/coach/page.tsx` (차트 표시)

**Step 1: feynman API에 점수 파싱 및 DB 저장 추가**

`src/app/api/coach/feynman/route.ts` — evaluate 액션의 시스템 프롬프트에 점수 포함 요청 추가:

기존 FEYNMAN_SYSTEM_PROMPT 사용 부분 다음, 응답 반환 전에:
```typescript
// 점수 파싱 시도 (피드백 텍스트에서 점수 추출)
import { createClient as createServerClient } from "@/lib/supabase/server";

const scoreMatch = text.match(/(\d)\/5|점수[:\s]*(\d)/);
const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : null;

if (score && concept) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("feynman_scores").insert({
      user_id: user.id,
      concept,
      module: module || "",
      score,
      feedback_summary: text.slice(0, 200),
    });
  }
}
```

파인만 평가 시스템 프롬프트에 추가 지시: `"반드시 평가 점수를 'X/5' 형식으로 포함하세요."` (FEYNMAN_SYSTEM_PROMPT 수정 또는 evaluate 분기의 messages에 추가)

**Step 2: SVG 라인차트 컴포넌트**

`src/components/coach/feynman-growth-chart.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface ScorePoint {
  date: string;
  concept: string;
  score: number;
}

export function FeynmanGrowthChart() {
  const [scores, setScores] = useState<ScorePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/coach/feynman-scores");
        const data = await res.json();
        if (data.scores) setScores(data.scores);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || scores.length < 2) return null;

  // SVG 차트 렌더링
  const width = 400;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = scores.map((s, i) => ({
    x: padding.left + (i / (scores.length - 1)) * chartW,
    y: padding.top + chartH - ((s.score - 1) / 4) * chartH,
    ...s,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-sm font-semibold">파인만 설명 품질 추이</span>
        <span className="text-xs text-slate-500">({scores.length}회 기록)</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        {/* Y축 가이드 */}
        {[1, 2, 3, 4, 5].map((v) => {
          const y = padding.top + chartH - ((v - 1) / 4) * chartH;
          return (
            <g key={v}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end"
                className="fill-slate-500" fontSize="10">{v}</text>
            </g>
          );
        })}
        {/* 라인 */}
        <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* 포인트 */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-green-400" />
        ))}
      </svg>
    </div>
  );
}
```

**Step 3: feynman-scores API**

`src/app/api/coach/feynman-scores/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ scores: [] });

  const { data } = await supabase
    .from("feynman_scores")
    .select("concept, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(30);

  const scores = (data || []).map((d) => ({
    date: d.created_at?.split("T")[0],
    concept: d.concept,
    score: d.score,
  }));

  return Response.json({ scores });
}
```

**Step 4: 코치 페이지에 차트 삽입**

`src/app/coach/page.tsx` — 세션 기록 섹션 위에 추가:
```tsx
import { FeynmanGrowthChart } from "@/components/coach/feynman-growth-chart";

// return 내부, {/* 세션 기록 */} 위에:
<FeynmanGrowthChart />
```

**Step 5: 커밋**
```bash
git add src/app/api/coach/feynman/route.ts src/components/coach/feynman-growth-chart.tsx src/app/api/coach/feynman-scores/route.ts src/app/coach/page.tsx
git commit -m "feat: track and visualize Feynman explanation quality growth curve"
```

---

### Task 8: 마인드맵 vs AI 그래프 비교 개선

**Files:**
- Modify: `src/app/coach/mindmap/page.tsx`

**참고:** 코드 검토 결과, 마인드맵 페이지에 이미 `view` state로 "내 마인드맵"/"AI 제안 맵" 토글과 `lg:grid-cols-2` 레이아웃이 구현되어 있음. 부족한 부분은:
1. 차이점 하이라이트 (누락/잘못된 연결 표시)
2. 비교 요약 텍스트

**Step 1: 분석 결과에서 차이점 요약 섹션 추가**

`src/app/coach/mindmap/page.tsx` — 분석 결과 grid 아래에 추가:
```tsx
{/* 비교 요약 */}
{analysis && (
  <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      <GitBranch className="w-4 h-4 text-blue-400" />
      내 맵 vs AI 맵 비교
    </h3>
    <div className="grid sm:grid-cols-3 gap-3 text-center">
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-lg font-bold text-blue-400">{nodes.length}</div>
        <div className="text-xs text-slate-500">내 노드</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-lg font-bold text-purple-400">{aiNodes.length}</div>
        <div className="text-xs text-slate-500">AI 노드</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-lg font-bold text-yellow-400">
          {Math.max(0, aiNodes.length - nodes.length)}
        </div>
        <div className="text-xs text-slate-500">누락 추정</div>
      </div>
    </div>
    {analysis.issues.filter((i) => i.type === "missing_link").length > 0 && (
      <p className="text-xs text-yellow-400">
        누락된 연결 {analysis.issues.filter((i) => i.type === "missing_link").length}개를 AI가 발견했습니다. 위 분석 결과를 확인하세요.
      </p>
    )}
  </div>
)}
```

**Step 2: 커밋**
```bash
git add src/app/coach/mindmap/page.tsx
git commit -m "feat: add mindmap vs AI graph comparison summary with gap stats"
```

---

### Task 9: Main Quest 특별 회고 워크플로우

**Files:**
- Create: `src/components/dashboard/main-quest-retro.tsx`
- Modify: `src/app/page.tsx` (대시보드에 삽입)

**Step 1: Main Quest 회고 카드 컴포넌트**

`src/components/dashboard/main-quest-retro.tsx`:
```tsx
"use client";

import { getTodayCurriculum } from "@/lib/curriculum";
import { getQuestById } from "@/data/quests";
import { Trophy, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

export function MainQuestRetro() {
  const today = getTodayCurriculum();
  if (!today?.questId || today.questType !== "main") return null;

  const quest = getQuestById(today.questId);
  if (!quest) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <div className="text-yellow-400 text-sm font-semibold">Main Quest Day</div>
          <h3 className="text-lg font-bold">{quest.title}</h3>
        </div>
      </div>

      <p className="text-sm text-slate-300">
        Main Quest는 모듈 전체 학습의 종합 평가입니다.
        제출 후 반드시 회고를 진행하세요 — 이것이 포트폴리오의 핵심 자료가 됩니다.
      </p>

      <div className="flex gap-3">
        <Link
          href={`/quest/${quest.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          퀘스트 브리핑 보기
        </Link>
        <Link
          href={`/coach/feynman?concept=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          파인만 회고
        </Link>
        <Link
          href={`/coach/blank-recall?topic=${encodeURIComponent(quest.title)}&module=${encodeURIComponent(quest.module)}`}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
        >
          <FileText className="w-4 h-4" />
          백지학습 회고
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: 대시보드에 삽입**

`src/app/page.tsx` — DailyBrief 바로 다음에:
```tsx
import { MainQuestRetro } from "@/components/dashboard/main-quest-retro";

// DailyBrief 다음:
<MainQuestRetro />
```

**Step 3: 커밋**
```bash
git add src/components/dashboard/main-quest-retro.tsx src/app/page.tsx
git commit -m "feat: add Main Quest special retrospective workflow on dashboard"
```

---

### Task 10: 학습 일기 AI 회고 초안 연동

**Files:**
- Modify: `src/components/diary/diary-form.tsx` (AI 초안 버튼 추가)

**Step 1: DiaryForm에 AI 초안 생성 버튼 추가**

`src/components/diary/diary-form.tsx` — 기존 코드 수정:
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTodayCurriculum } from "@/lib/curriculum";
import type { DiaryEntry } from "@/app/diary/page";

interface Props {
  onSubmit: (entry: DiaryEntry) => void;
}

export function DiaryForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const today = getTodayCurriculum();

  async function generateDraft() {
    setGenerating(true);
    try {
      const res = await fetch("/api/coach/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: today?.module || "",
          topic: today?.topic || "",
          captures: [],
          coachingMessages: [],
        }),
      });
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        if (!title.trim()) {
          setTitle(`Day ${today?.dayNumber || "?"} 학습 회고`);
        }
        toast.success("AI 초안이 생성되었습니다. 자유롭게 수정하세요!");
      }
    } catch {
      toast.error("AI 초안 생성 실패");
    }
    setGenerating(false);
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "저장 실패");
        return;
      }
      onSubmit(data.entry);
      setTitle("");
      setContent("");
      toast.success("일기가 저장되었습니다!");
    } catch {
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="오늘의 학습 제목"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 무엇을 배웠나요? 어떤 점이 어려웠고, 어떤 깨달음이 있었나요? 자유롭게 기록해보세요..."
        className="min-h-[180px] bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
      />
      <div className="flex justify-between">
        <Button
          onClick={generateDraft}
          disabled={generating}
          variant="outline"
          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          AI 초안 생성
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
        >
          {loading ? "AI가 읽고 있어요..." : (
            <><Send className="w-4 h-4 mr-2" /> 일기 저장</>
          )}
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: 커밋**
```bash
git add src/components/diary/diary-form.tsx
git commit -m "feat: add AI draft generation button to diary form"
```

---

## 구현 순서 요약

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | DB 마이그레이션 | 없음 (먼저) |
| 2 | 완주 게이지 실데이터 | 없음 |
| 3 | 약점 재질문 | Task 1 (weakness_concepts 테이블) |
| 4 | 퀘스트 회고 연결 | 없음 |
| 5 | 힌트 기록 | 없음 (기존 quest_logs 활용) |
| 6 | 위기 사전 경보 | 없음 |
| 7 | 파인만 성장 곡선 | Task 1 (feynman_scores 테이블) |
| 8 | 마인드맵 비교 | 없음 |
| 9 | MQ 특별 회고 | 없음 |
| 10 | 일기 AI 초안 | 없음 |

병렬 가능: Task 2, 4, 5, 6, 8, 9, 10은 독립적. Task 3, 7은 Task 1에 의존.

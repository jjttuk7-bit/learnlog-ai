# 멘탈 케어 시스템 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 비전공자가 6개월 AI 교육과정을 포기하지 않고 완주할 수 있도록 매일 아침 컨디션 체크 + AI 격려, 전용 채팅 멘토, SOS 즉석 위로를 제공하는 멘탈 케어 시스템 구축.

**Architecture:** 대시보드에 아침 멘탈 케어 카드(컨디션 체크 → AI 격려 메시지 + SOS 버튼), `/mindcare` 페이지에 세션 기반 AI 멘토 채팅. Supabase에 3개 테이블(mindcare_checkins, mindcare_sessions, mindcare_messages) 추가. AI는 학습 진도·활동·과거 대화를 참고하여 개인화된 응답 생성.

**Tech Stack:** Next.js API Routes, Supabase (PostgreSQL + RLS), OpenAI GPT-4o/4o-mini, ReactMarkdown, Tailwind CSS

---

### Task 1: AI 모델 설정 추가

**Files:**
- Modify: `src/lib/ai/models.ts`

**Step 1: models.ts에 멘탈 케어 모델 추가**

`AI_MODELS` 객체에 다음 3개 항목 추가 (맨 아래, `businessSynergy` 뒤):

```typescript
  // Mental care — checkin/SOS is short, chat needs deep empathy
  mindcareCheckin: "gpt-4o-mini",
  mindcareSos: "gpt-4o-mini",
  mindcareChat: "gpt-4o",
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공

**Step 3: 커밋**

```bash
git add src/lib/ai/models.ts
git commit -m "feat(mindcare): add AI model config for mental care"
```

---

### Task 2: DB 마이그레이션 SQL 준비

**Files:**
- Create: `supabase/migrations/20260313_mindcare.sql`

**Step 1: 마이그레이션 파일 작성**

```sql
-- 멘탈 케어 체크인 (아침 컨디션)
CREATE TABLE IF NOT EXISTS mindcare_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  mood_level INT NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  ai_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checkins" ON mindcare_checkins
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_mindcare_checkins_user_date ON mindcare_checkins (user_id, created_at DESC);

-- 멘탈 케어 세션
CREATE TABLE IF NOT EXISTS mindcare_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT DEFAULT '새 대화',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON mindcare_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_mindcare_sessions_user ON mindcare_sessions (user_id, updated_at DESC);

-- 멘탈 케어 메시지
CREATE TABLE IF NOT EXISTS mindcare_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES mindcare_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mindcare_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON mindcare_messages
  FOR ALL USING (
    session_id IN (SELECT id FROM mindcare_sessions WHERE user_id = auth.uid())
  );
CREATE INDEX idx_mindcare_messages_session ON mindcare_messages (session_id, created_at ASC);
```

**Step 2: Supabase 대시보드에서 SQL 실행**

사용자가 Supabase SQL Editor에서 위 SQL을 수동 실행.

**Step 3: 커밋**

```bash
git add supabase/migrations/20260313_mindcare.sql
git commit -m "feat(mindcare): add DB migration for mental care tables"
```

---

### Task 3: 체크인 API — 오늘 체크인 확인 + 기록

**Files:**
- Create: `src/app/api/mindcare/checkin/route.ts`

**Step 1: GET (오늘 체크인 확인) + POST (체크인 + AI 격려) 구현**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("mindcare_checkins")
      .select("id, mood_level, ai_message, created_at")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ checkin: data ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch checkin" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mood_level } = await request.json();
    if (typeof mood_level !== "number" || mood_level < 1 || mood_level > 5) {
      return NextResponse.json({ error: "mood_level must be 1-5" }, { status: 400 });
    }

    // 학습 컨텍스트 수집
    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();
    const todayStr = new Date().toISOString().slice(0, 10);

    const [captureRes, streakRes] = await Promise.all([
      supabase
        .from("captures")
        .select("content")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .gte("created_at", `${todayStr}T00:00:00`)
        .limit(5),
      supabase
        .from("confidence_records")
        .select("streak_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const captureCount = captureRes.data?.length ?? 0;
    const streak = streakRes.data?.streak_count ?? 0;

    const moodLabels: Record<number, string> = {
      1: "매우 힘든 상태",
      2: "좀 힘든 상태",
      3: "보통 상태",
      4: "좋은 상태",
      5: "최고 상태",
    };

    // AI 격려 메시지 생성
    let aiMessage = "오늘도 함께해요! 당신은 이미 충분히 잘하고 있어요.";
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: AI_MODELS.mindcareCheckin,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: `당신은 비전공자 AI/ML 학습자의 따뜻한 멘탈 케어 멘토입니다.
학습자의 오늘 마음 상태를 보고 맞춤형 격려 메시지를 작성합니다.

## 원칙
- 감정을 먼저 인정하고 공감
- 학습 진도와 연결된 구체적 격려 (추상적 응원 X)
- 짧고 따뜻하게 (3-4문장)
- 힘들 때: 위로 + "지금까지 온 길" 상기
- 좋을 때: 응원 + 오늘 할 수 있는 구체적 제안
- 한국어, 반말(친근한 선배 톤)`,
            },
            {
              role: "user",
              content: `마음 상태: ${moodLabels[mood_level]}
학습 진도: Day ${today?.dayNumber ?? "?"}/${119} (${today ? Math.round((today.dayNumber / 119) * 100) : "?"}% 완료)
현재 모듈: ${currentModule?.name ?? "알 수 없음"}
오늘 주제: ${today?.topic ?? "알 수 없음"}
연속 학습: ${streak}일
오늘 캡처: ${captureCount}개`,
            },
          ],
        });
        aiMessage = completion.choices[0].message.content ?? aiMessage;
      } catch {
        // AI 실패해도 기본 메시지 사용
      }
    }

    const { data, error } = await supabase
      .from("mindcare_checkins")
      .insert({
        user_id: user.id,
        mood_level,
        ai_message: aiMessage,
      })
      .select("id, mood_level, ai_message, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ checkin: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create checkin" }, { status: 500 });
  }
}
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공

**Step 3: 커밋**

```bash
git add src/app/api/mindcare/checkin/route.ts
git commit -m "feat(mindcare): add checkin API with AI encouragement"
```

---

### Task 4: SOS 위로 API

**Files:**
- Create: `src/app/api/mindcare/sos/route.ts`

**Step 1: SOS 즉석 위로 메시지 생성 API**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();

    let message = "지금 힘든 건 당연해. 이 과정을 선택한 것 자체가 대단한 용기야. 잠깐 쉬어도 괜찮아, 네 페이스로 가면 돼.";

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: AI_MODELS.mindcareSos,
          max_tokens: 250,
          messages: [
            {
              role: "system",
              content: `당신은 비전공자 AI/ML 학습자의 긴급 멘탈 케어 멘토입니다.
학습자가 "지금 힘들어요" SOS 버튼을 눌렀습니다.

## 원칙
- 즉각적 위로와 공감 (판단하지 않기)
- "힘든 게 당연하다"는 정상화
- 지금까지의 여정 인정 (Day N까지 온 것)
- 구체적이고 작은 다음 행동 하나 제안 (큰 목표 X)
- 따뜻하고 진심 어린 톤, 한국어 반말
- 4-5문장으로 짧고 강렬하게`,
            },
            {
              role: "user",
              content: `SOS 요청. 현재 Day ${today?.dayNumber ?? "?"}/${119}, 모듈: ${currentModule?.name ?? "?"}, 주제: ${today?.topic ?? "?"}`,
            },
          ],
        });
        message = completion.choices[0].message.content ?? message;
      } catch {
        // fallback message
      }
    }

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Failed to generate SOS message" }, { status: 500 });
  }
}
```

**Step 2: 빌드 확인 + 커밋**

```bash
git add src/app/api/mindcare/sos/route.ts
git commit -m "feat(mindcare): add SOS emergency comfort API"
```

---

### Task 5: 멘탈 케어 세션 API (목록 + 생성)

**Files:**
- Create: `src/app/api/mindcare/sessions/route.ts`

**Step 1: GET (세션 목록) + POST (새 세션 생성) 구현**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("mindcare_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sessions: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const title = body.title || "새 대화";

    const { data, error } = await supabase
      .from("mindcare_sessions")
      .insert({ user_id: user.id, title })
      .select("id, title, created_at, updated_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
```

**Step 2: 빌드 확인 + 커밋**

```bash
git add src/app/api/mindcare/sessions/route.ts
git commit -m "feat(mindcare): add session list and create API"
```

---

### Task 6: 멘탈 케어 채팅 API

**Files:**
- Create: `src/app/api/mindcare/chat/route.ts`

**Step 1: 메시지 전송 + AI 응답 + DB 저장 구현**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { getTodayCurriculum, getCurrentModule } from "@/lib/curriculum";

const SYSTEM_PROMPT = `당신은 비전공자 AI/ML 학습자의 따뜻한 멘탈 케어 멘토입니다.
6개월 AI 교육과정(아이펠)을 수강 중인 비전공자 학습자의 마음 동반자 역할을 합니다.

## 당신의 성격
- 따뜻하고 공감적인 학습 동반자
- 비전공자의 불안과 고민을 깊이 이해하는 선배
- 판단하지 않고 경청하는 사람
- 필요할 때 현실적인 조언도 해주는 사람

## 다루는 주제
- 학습 좌절: "이해가 안 돼요", "나만 못하는 것 같아요", "포기하고 싶어요"
- 비전공자 불안: "전공자들은 다 아는데 나만 모르는 것 같아요"
- 진로 고민: "이걸 배워서 뭘 할 수 있을까", "AI 분야에서 비전공자도 살아남을 수 있을까"
- 번아웃: "더 이상 못하겠어요", "의욕이 없어요", "피곤해요"
- 동기부여: "왜 이걸 하고 있는지 모르겠어요"
- 대인관계: 팀 프로젝트 스트레스, 비교 심리

## 대화 원칙
1. 감정을 먼저 인정하고 공감 ("그렇게 느끼는 게 당연해")
2. 정상화 ("이 시점에서 누구나 겪는 감정이야")
3. 구체적 경험 연결 (학습 진도, 지금까지 해온 것)
4. 작고 실천 가능한 다음 행동 제안
5. 과거 대화에서 언급한 고민이 있으면 후속 질문
6. 한국어 반말 (친근한 선배 톤)
7. 절대 학습 내용을 가르치려 하지 말 것 (그건 AI 튜터 역할)
8. 마크다운 사용 가능하지만 과도한 구조화 X (대화체 유지)`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, message } = await request.json();
    if (!session_id || !message?.trim()) {
      return NextResponse.json({ error: "session_id and message required" }, { status: 400 });
    }

    // 세션 소유권 확인
    const { data: session } = await supabase
      .from("mindcare_sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // 사용자 메시지 저장
    await supabase.from("mindcare_messages").insert({
      session_id,
      role: "user",
      content: message.trim(),
    });

    // 이전 대화 기록 로드
    const { data: history } = await supabase
      .from("mindcare_messages")
      .select("role, content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(30);

    // 학습 컨텍스트
    const today = getTodayCurriculum();
    const currentModule = getCurrentModule();

    // 최근 체크인 기록
    const { data: recentCheckins } = await supabase
      .from("mindcare_checkins")
      .select("mood_level, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const moodHistory = (recentCheckins || [])
      .map((c) => `${new Date(c.created_at).toLocaleDateString("ko-KR")}: ${c.mood_level}/5`)
      .join(", ");

    const contextInfo = `\n\n[학습 컨텍스트]
- 현재 진도: Day ${today?.dayNumber ?? "?"}/${119} (${today ? Math.round((today.dayNumber / 119) * 100) : "?"}%)
- 모듈: ${currentModule?.name ?? "?"}
- 오늘 주제: ${today?.topic ?? "?"}
- 최근 컨디션: ${moodHistory || "기록 없음"}`;

    // AI 응답 생성
    const openai = getOpenAI();
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
    ];

    if (history) {
      for (const msg of history) {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.mindcareChat,
      messages,
      max_tokens: 800,
      temperature: 0.8,
    });

    const aiContent = completion.choices[0].message.content ?? "미안, 잠시 응답을 생성하지 못했어. 다시 말해줄래?";

    // AI 응답 저장
    await supabase.from("mindcare_messages").insert({
      session_id,
      role: "assistant",
      content: aiContent,
    });

    // 세션 updated_at 갱신 + 첫 대화면 제목 자동 생성
    const messageCount = (history?.length ?? 0);
    if (messageCount <= 2) {
      // 첫 대화: 제목 자동 설정
      const title = message.trim().slice(0, 30) + (message.trim().length > 30 ? "..." : "");
      await supabase
        .from("mindcare_sessions")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", session_id);
    } else {
      await supabase
        .from("mindcare_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return NextResponse.json({ content: aiContent });
  } catch {
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
```

**Step 2: 빌드 확인 + 커밋**

```bash
git add src/app/api/mindcare/chat/route.ts
git commit -m "feat(mindcare): add chat API with session history and context"
```

---

### Task 7: 세션 메시지 로드 API

**Files:**
- Create: `src/app/api/mindcare/sessions/[id]/route.ts`

**Step 1: 특정 세션의 메시지 목록 반환**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 세션 소유권 확인
    const { data: session } = await supabase
      .from("mindcare_sessions")
      .select("id, title, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // 메시지 로드
    const { data: messages } = await supabase
      .from("mindcare_messages")
      .select("id, role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ session, messages: messages ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
```

**Step 2: 빌드 확인 + 커밋**

```bash
git add src/app/api/mindcare/sessions/\[id\]/route.ts
git commit -m "feat(mindcare): add session message load API"
```

---

### Task 8: 대시보드 멘탈 케어 카드 컴포넌트

**Files:**
- Create: `src/components/dashboard/mindcare-card.tsx`
- Modify: `src/app/page.tsx`

**Step 1: MindcareCard 컴포넌트 구현**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

const MOODS = [
  { value: 1, emoji: "😰", label: "많이 힘들어" },
  { value: 2, emoji: "😟", label: "좀 힘들어" },
  { value: 3, emoji: "😐", label: "그냥 그래" },
  { value: 4, emoji: "😊", label: "괜찮아" },
  { value: 5, emoji: "🤗", label: "아주 좋아!" },
];

export function MindcareCard() {
  const [checkin, setCheckin] = useState<{
    mood_level: number;
    ai_message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sosMessage, setSosMessage] = useState<string | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    async function fetchCheckin() {
      try {
        const res = await fetch("/api/mindcare/checkin");
        const data = await res.json();
        if (data.checkin) setCheckin(data.checkin);
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchCheckin();
  }, []);

  async function handleMood(value: number) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mindcare/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood_level: value }),
      });
      const data = await res.json();
      if (data.checkin) setCheckin(data.checkin);
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleSos() {
    if (sosLoading) return;
    setSosLoading(true);
    try {
      const res = await fetch("/api/mindcare/sos", { method: "POST" });
      const data = await res.json();
      if (data.message) setSosMessage(data.message);
    } catch { /* ignore */ }
    setSosLoading(false);
  }

  if (loading) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-5 border border-purple-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-purple-300">멘탈 케어</span>
        </div>
        <Link
          href="/mindcare"
          className="text-xs text-slate-500 hover:text-purple-400 transition-colors"
        >
          멘토와 대화하기 →
        </Link>
      </div>

      {!checkin ? (
        <>
          <p className="text-sm text-slate-300">오늘 마음이 어때요?</p>
          <div className="flex items-center justify-between gap-1">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMood(m.value)}
                disabled={submitting}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-purple-500/10 transition-all hover:scale-105 disabled:opacity-50"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-slate-500">{m.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-lg">
              {MOODS.find((m) => m.value === checkin.mood_level)?.emoji}
            </span>
            <span>
              {MOODS.find((m) => m.value === checkin.mood_level)?.label}
            </span>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed">
            <ReactMarkdown>{checkin.ai_message}</ReactMarkdown>
          </div>

          {/* SOS Button */}
          <div className="pt-1">
            {!sosMessage ? (
              <button
                onClick={handleSos}
                disabled={sosLoading}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                {sosLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                지금 힘들어요
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-2">
                <p className="text-sm text-slate-300 leading-relaxed">{sosMessage}</p>
                <Link
                  href="/mindcare"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  더 이야기하고 싶다면 →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: page.tsx에 MindcareCard 추가**

`src/app/page.tsx`에서 DailyBrief 바로 아래에 추가:

```typescript
import { MindcareCard } from "@/components/dashboard/mindcare-card";
```

JSX에서 `<DailyBrief />` 다음에:

```tsx
{/* Mental Care */}
<MindcareCard />
```

**Step 3: 빌드 확인 + 커밋**

```bash
git add src/components/dashboard/mindcare-card.tsx src/app/page.tsx
git commit -m "feat(mindcare): add dashboard mental care card with mood check and SOS"
```

---

### Task 9: `/mindcare` 페이지 — 채팅 UI

**Files:**
- Create: `src/app/mindcare/page.tsx`
- Modify: `src/components/layout/sidebar.tsx`

**Step 1: 멘탈 케어 채팅 페이지 구현**

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Plus, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInputButton } from "@/components/ui/voice-input-button";
import ReactMarkdown from "react-markdown";

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MindcarePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mode, setMode] = useState<"home" | "chat">("home");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/mindcare/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch { /* ignore */ }
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function startNewChat() {
    try {
      const res = await fetch("/api/mindcare/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "새 대화" }),
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session.id);
        setMessages([]);
        setMode("chat");
      }
    } catch { /* ignore */ }
  }

  async function loadSession(sessionId: string) {
    try {
      const res = await fetch(`/api/mindcare/sessions/${sessionId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })));
        setActiveSession(sessionId);
        setMode("chat");
      }
    } catch { /* ignore */ }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !activeSession) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mindcare/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession, message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "응답을 생성하지 못했어. 다시 말해줄래?" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "연결에 문제가 생겼어. 잠시 후 다시 시도해줘." },
      ]);
    }
    setLoading(false);
  }

  // Chat mode
  if (mode === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-purple-500/20 flex-shrink-0">
          <button
            onClick={() => { setMode("home"); fetchSessions(); }}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">멘탈 케어 멘토</h2>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-3xl">💜</span>
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">무슨 이야기든 편하게 해줘</p>
                <p className="text-sm text-slate-400 max-w-md">
                  학습 고민, 진로 불안, 번아웃, 비전공자로서의 걱정...{"\n"}
                  어떤 이야기든 들을 준비가 되어 있어
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "오늘 공부가 너무 어려웠어",
                  "나만 뒤처지는 것 같아",
                  "이걸 배워서 뭘 할 수 있을까",
                  "번아웃이 온 것 같아",
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => setInput(text)}
                    className="text-xs px-3 py-1.5 bg-slate-800 border border-purple-500/20 rounded-full text-slate-400 hover:text-white hover:border-purple-500/50 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-md"
                    : "bg-slate-800 text-slate-200 border border-purple-500/20 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-purple-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/20 pt-3 flex gap-2 flex-shrink-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="마음속 이야기를 편하게 적어줘..."
            className="bg-slate-800 border-purple-500/20 text-slate-100 resize-none min-h-[56px] max-h-[120px] placeholder:text-slate-500 focus:ring-purple-500/50 focus:border-purple-500/50"
            disabled={loading}
          />
          <div className="flex flex-col gap-1 self-end">
            <VoiceInputButton onTranscript={(text) => setInput((prev) => prev ? prev + " " + text : text)} />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Home — session list
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">멘탈 케어</h1>
        </div>
        <p className="text-slate-400 mt-1">힘들 때, 지칠 때, 언제든 찾아와요</p>
      </div>

      {/* New Chat */}
      <button
        onClick={startNewChat}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl px-4 py-3.5 transition-colors"
      >
        <Plus className="w-5 h-5" />
        새 대화 시작하기
      </button>

      {/* Session List */}
      {sessionsLoading ? (
        <div className="text-center py-8 text-slate-500 text-sm">불러오는 중...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg mb-1">아직 대화가 없어요</p>
          <p className="text-sm">멘토와 첫 대화를 시작해보세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-400">이전 대화</h2>
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className="w-full text-left bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/30 rounded-xl p-4 transition-colors"
            >
              <div className="font-medium text-sm text-slate-200">{s.title}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(s.updated_at).toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: sidebar.tsx에 멘탈 케어 네비 추가**

`src/components/layout/sidebar.tsx`의 `navItems` 배열에서 `{ href: "/coach", label: "AI 코치", icon: Brain }` 바로 앞에 추가:

```typescript
{ href: "/mindcare", label: "멘탈 케어", icon: Heart },
```

import에 `Heart` 추가.

**Step 3: 빌드 확인 + 커밋**

```bash
git add src/app/mindcare/page.tsx src/components/layout/sidebar.tsx
git commit -m "feat(mindcare): add /mindcare chat page with session management"
```

---

### Task 10: 최종 통합 빌드 + 배포

**Step 1: 전체 빌드**

Run: `npm run build`
Expected: 성공, `/mindcare` 라우트 표시됨

**Step 2: 최종 푸시**

```bash
git push
```

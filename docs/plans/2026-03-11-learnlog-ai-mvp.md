# LearnLog AI — MVP 구현 기획안 (Implementation Plan)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI 엔지니어링 학습자가 매일 수업 내용을 캡처하고, AI 메타인지 코칭을 받고, 6개월 학습 여정을 추적할 수 있는 웹앱 MVP를 구축한다.

**Architecture:** Next.js App Router 기반 PWA 웹앱. Supabase를 DB/Auth로 사용하고, Claude API로 AI 코칭 엔진을 구동한다. 119일 커리큘럼 데이터를 JSON으로 사전 입력하여 모든 기능의 컨텍스트로 활용한다.

**Tech Stack:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | Supabase (PostgreSQL + Auth + Realtime) | Claude API (claude-sonnet-4) | Web Speech API | Vercel 배포

---

## 목차

- [Phase 1 — MVP (Task 1~12)](#phase-1--mvp-task-112): 핵심 학습 루틴
- [Phase 2 — Growth (Task 13~16)](#phase-2--growth-task-1316): 학습 자산 축적
- [Phase 3 — Social (Task 17~18)](#phase-3--social-task-1718): 집단지성

---

## 데이터 모델 개요

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   users      │────▶│  captures    │────▶│  coach_sessions│
│ (Supabase    │     │ (학습 캡처)   │     │ (AI 코칭 기록) │
│  Auth)       │     └──────────────┘     └───────────────┘
│              │     ┌──────────────┐     ┌───────────────┐
│              │────▶│  quest_logs  │     │  reflections  │
│              │     │ (퀘스트 기록) │     │ (회고 기록)    │
└─────────────┘     └──────────────┘     └───────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ curriculum   │     │ confidence   │
│ (119일 맵)   │     │ (WIN카드 등)  │
└──────────────┘     └──────────────┘
```

---

## Phase 1 — MVP (Task 1~12)

> 목표: 매일 쓰는 학습 루틴 + 퀘스트 완주 기반 형성
> 시기: 3~4월 (파이썬·데이터 모듈)

---

### Task 1: 프로젝트 초기화 + 기본 레이아웃

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- Create: `src/app/layout.tsx` (루트 레이아웃)
- Create: `src/app/page.tsx` (메인 대시보드)
- Create: `src/app/globals.css`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/lib/utils.ts`

**Step 1: Next.js 프로젝트 생성**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Step 2: shadcn/ui 설치 + 핵심 컴포넌트**

```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea tabs badge dialog sheet toast
```

**Step 3: PWA 매니페스트 설정**

```typescript
// next.config.js
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
module.exports = withPWA({ /* next config */ });
```

Create: `public/manifest.json`
```json
{
  "name": "LearnLog AI",
  "short_name": "LearnLog",
  "description": "AI 메타인지 학습 코칭 서비스",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6"
}
```

**Step 4: 루트 레이아웃 + 반응형 네비게이션**

```typescript
// src/app/layout.tsx
// - 모바일: 하단 탭 네비 (캡처 | 코치 | 진도 | 퀘스트 | 마이)
// - 데스크탑: 좌측 사이드바
// 탭 구성:
//   1. 캡처 (PenLine 아이콘)
//   2. AI 코치 (Brain 아이콘)
//   3. 진도 (BarChart3 아이콘)
//   4. 퀘스트 (Sword 아이콘)
//   5. 마이 (User 아이콘)
```

**Step 5: 커밋**

```bash
git init && git add -A && git commit -m "chore: init Next.js project with Tailwind, shadcn/ui, PWA"
```

---

### Task 2: Supabase 설정 + 데이터베이스 스키마

**Files:**
- Create: `src/lib/supabase/client.ts` (브라우저 클라이언트)
- Create: `src/lib/supabase/server.ts` (서버 클라이언트)
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `.env.local.example`

**Step 1: Supabase 클라이언트 라이브러리 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: 데이터베이스 스키마 작성**

```sql
-- supabase/migrations/001_initial_schema.sql

-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT DEFAULT 'learner',
  learning_goal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 커리큘럼 (119일 사전 입력 데이터)
CREATE TABLE curriculum (
  id SERIAL PRIMARY KEY,
  day_number INT NOT NULL UNIQUE,      -- 1~119
  date DATE NOT NULL,                  -- 2026-03-11 ~ 2026-09-10
  module TEXT NOT NULL,                -- '아이펠 적응', '파이썬 마스터' 등
  topic TEXT NOT NULL,                 -- 그날의 학습 주제
  difficulty INT DEFAULT 1,            -- 1~5 난이도
  quest_id TEXT,                       -- Sub Quest / Main Quest ID (nullable)
  quest_type TEXT,                     -- 'sub_b' | 'sub_c' | 'main' | null
  is_dlthon BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- 학습 캡처 (Smart Capture)
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  capture_type TEXT NOT NULL DEFAULT 'text',  -- text | voice | image | code
  content TEXT NOT NULL,
  ai_category TEXT,                    -- concept | code | question | insight
  ai_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI 코칭 세션
CREATE TABLE coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  session_type TEXT NOT NULL,          -- 'checkin' | 'feynman' | 'blank_recall' | 'review'
  messages JSONB NOT NULL DEFAULT '[]',
  understanding_level INT,             -- 1~5
  ai_feedback TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 회고 기록
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  ai_draft TEXT,
  user_content TEXT,
  wins TEXT[],
  struggles TEXT[],
  tomorrow_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 퀘스트 기록
CREATE TABLE quest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  quest_id TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',   -- not_started | in_progress | completed
  hints_used INT DEFAULT 0,
  hint_log JSONB DEFAULT '[]',
  ai_briefing TEXT,
  ai_review TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 자신감 엔진 (Confidence Engine)
CREATE TABLE confidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curriculum_id INT REFERENCES curriculum(id),
  win_cards JSONB DEFAULT '[]',
  streak_count INT DEFAULT 0,
  completion_rate DECIMAL(5,2),
  self_rating INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own captures" ON captures FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own sessions" ON coach_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own reflections" ON reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own quest_logs" ON quest_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own confidence" ON confidence_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Curriculum is readable by all" ON curriculum FOR SELECT USING (true);

-- 인덱스
CREATE INDEX idx_captures_user_date ON captures(user_id, created_at DESC);
CREATE INDEX idx_captures_curriculum ON captures(curriculum_id);
CREATE INDEX idx_sessions_user_date ON coach_sessions(user_id, created_at DESC);
CREATE INDEX idx_quest_logs_user ON quest_logs(user_id, quest_id);
CREATE INDEX idx_confidence_user ON confidence_records(user_id, created_at DESC);
```

**Step 3: Supabase 클라이언트 설정**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**Step 4: .env.local.example**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

**Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add Supabase setup and database schema"
```

---

### Task 3: 인증 (Auth) 플로우

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/middleware.ts`
- Create: `src/hooks/use-user.ts`

**Step 1: 로그인 페이지**

```
// src/app/auth/login/page.tsx
// - 이메일 + 비밀번호 로그인
// - Google OAuth 로그인 버튼
// - LearnLog AI 로고 + 슬로건 표시
// - Supabase Auth signInWithPassword / signInWithOAuth 사용
```

**Step 2: Auth 콜백 + 미들웨어**

```typescript
// src/middleware.ts
// - 미인증 사용자 → /auth/login 리다이렉트
// - 인증 사용자 → / (대시보드) 접근 허용
// - /auth/* 경로는 항상 허용
```

**Step 3: useUser 훅**

```typescript
// src/hooks/use-user.ts
// - Supabase onAuthStateChange 리스닝
// - 현재 사용자 정보 + 프로필 반환
// - 로딩 상태 관리
```

**Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add auth flow with Supabase (login, callback, middleware)"
```

---

### Task 4: 커리큘럼 119일 데이터 입력

**Files:**
- Create: `src/data/curriculum.ts` (119일 전체 매핑 데이터)
- Create: `src/lib/curriculum.ts` (커리큘럼 유틸리티 함수)
- Create: `scripts/seed-curriculum.ts` (Supabase 시딩 스크립트)

**Step 1: 커리큘럼 데이터 구조화**

PRD 섹션 4.2 + 부록 10에 명시된 13개 모듈, 119일을 TypeScript 배열로 구조화:

```typescript
// src/data/curriculum.ts
export interface CurriculumDay {
  dayNumber: number;           // 1~119
  date: string;                // 'YYYY-MM-DD'
  module: string;              // 모듈명
  topic: string;               // 그날 학습 주제
  difficulty: 1 | 2 | 3 | 4 | 5;
  questId?: string;            // 퀘스트 ID
  questType?: 'sub_b' | 'sub_c' | 'main';
  isDlthon: boolean;
}

export const MODULES = [
  { name: '아이펠 적응', start: '2026-03-11', end: '2026-03-17', days: 5, difficulty: 1 },
  { name: '파이썬 마스터', start: '2026-03-18', end: '2026-03-30', days: 9, difficulty: 2 },
  { name: '데이터 처리·분석', start: '2026-03-31', end: '2026-04-07', days: 6, difficulty: 2 },
  { name: '딥러닝 기초', start: '2026-04-08', end: '2026-04-14', days: 5, difficulty: 3 },
  { name: 'CV 기초', start: '2026-04-15', end: '2026-04-21', days: 5, difficulty: 3 },
  { name: 'DLthon 1', start: '2026-04-22', end: '2026-04-27', days: 4, difficulty: 4 },
  { name: '자연어처리 기초', start: '2026-04-28', end: '2026-05-07', days: 5, difficulty: 3 },
  { name: 'LLM 기초', start: '2026-05-08', end: '2026-05-15', days: 6, difficulty: 4 },
  { name: 'LLM 활용', start: '2026-05-18', end: '2026-06-01', days: 10, difficulty: 5 },
  { name: 'DLthon 2', start: '2026-06-02', end: '2026-06-08', days: 4, difficulty: 4 },
  { name: '모델 배포 기초', start: '2026-06-09', end: '2026-06-18', days: 8, difficulty: 3 },
  { name: 'MLOps', start: '2026-06-19', end: '2026-07-06', days: 12, difficulty: 5 },
  { name: '파이널 프로젝트', start: '2026-07-07', end: '2026-09-10', days: 40, difficulty: 5 },
] as const;

export const CURRICULUM: CurriculumDay[] = [
  // 119일 전체 데이터 — PRD 부록 기반으로 일별 매핑
  // 38개 퀘스트 포함 (Sub Quest B 14개, Sub Quest C 19개, Main Quest 5개)
];
```

**Step 2: 유틸리티 함수**

```typescript
// src/lib/curriculum.ts
export function getTodayCurriculum(): CurriculumDay | null { /* 오늘 날짜 기반 조회 */ }
export function getModuleProgress(module: string, completedDays: number[]): number { /* 모듈 완료율 */ }
export function getCurrentModule(): Module { /* 현재 진행 중 모듈 */ }
export function getDaysUntilNextQuest(): number { /* 다음 퀘스트까지 남은 일수 */ }
export function isHighIntensityPeriod(date: string): boolean { /* 5~7월 고난이도 구간 판별 */ }
```

**Step 3: Supabase 시딩**

```bash
npx tsx scripts/seed-curriculum.ts
```

**Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add 119-day curriculum data and utility functions"
```

---

### Task 5: Smart Capture (스마트 캡처) — Feature 1

**Files:**
- Create: `src/app/capture/page.tsx` (캡처 메인 페이지)
- Create: `src/components/capture/text-capture.tsx`
- Create: `src/components/capture/voice-capture.tsx`
- Create: `src/components/capture/code-capture.tsx`
- Create: `src/components/capture/capture-list.tsx`
- Create: `src/app/api/capture/classify/route.ts` (AI 분류 API)
- Create: `src/lib/prompts/capture.ts` (캡처 분류 프롬프트)

**Step 1: 캡처 입력 UI**

```
// src/app/capture/page.tsx
// 상단: 오늘 날짜 + 현재 모듈명 + Day N 자동 표시
// 입력 모드 탭: 텍스트 | 음성 | 코드
// 하단: 오늘 캡처 목록 (시간순, 카테고리 배지 표시)
//
// 핵심 UX: 열자마자 바로 타이핑 가능 (autofocus)
// 모바일에서도 빠른 입력이 최우선
```

**Step 2: 텍스트 캡처 컴포넌트**

```typescript
// src/components/capture/text-capture.tsx
// - textarea autofocus, 엔터키로 빠른 제출
// - Shift+Enter로 줄바꿈
// - 제출 시 Supabase captures 테이블에 저장
// - 저장 후 Claude API로 자동 분류 요청 (비동기)
```

**Step 3: 음성 캡처 컴포넌트**

```typescript
// src/components/capture/voice-capture.tsx
// - Web Speech API (SpeechRecognition) 사용
// - 녹음 버튼 → 실시간 텍스트 변환 표시
// - 변환 완료 후 텍스트 캡처와 동일 플로우
// - 브라우저 미지원 시 안내 메시지
```

**Step 4: 코드 스니펫 캡처**

```typescript
// src/components/capture/code-capture.tsx
// - 코드 전용 모노스페이스 입력 영역
// - 언어 선택 드롭다운 (Python 기본)
// - 간단한 구문 하이라이팅 (선택: react-syntax-highlighter)
```

**Step 5: AI 자동 분류 API**

```typescript
// src/app/api/capture/classify/route.ts
// Claude API 호출: 캡처 내용 → concept | code | question | insight 분류
// + 키워드 태그 3~5개 추출
// + 현재 커리큘럼 컨텍스트 포함
```

```typescript
// src/lib/prompts/capture.ts
export const CAPTURE_CLASSIFY_PROMPT = `
당신은 AI 엔지니어링 학습 기록 분류기입니다.

현재 학습 모듈: {module}
오늘의 주제: {topic}

사용자가 입력한 학습 기록을 다음 4가지 카테고리 중 하나로 분류하세요:
- concept: 개념 설명, 이론, 정의
- code: 코드 스니펫, 구현 관련
- question: 의문점, 질문, 이해 안 되는 부분
- insight: 발견, 깨달음, 연결된 아이디어

또한 관련 키워드 태그를 3~5개 추출하세요.

JSON 형식으로 응답: { "category": "...", "tags": ["...", "..."] }
`;
```

**Step 6: 캡처 목록 컴포넌트**

```typescript
// src/components/capture/capture-list.tsx
// - 오늘 캡처한 항목 시간순 역정렬
// - 카테고리별 색상 배지 (concept=파랑, code=초록, question=노랑, insight=보라)
// - 클릭 시 상세 보기 + 수정 가능
// - 삭제 기능
```

**Step 7: 커밋**

```bash
git add -A && git commit -m "feat: add Smart Capture with text, voice, code input and AI classification"
```

---

### Task 6: AI 메타인지 코치 — Feature 2

**Files:**
- Create: `src/app/coach/page.tsx` (AI 코치 메인)
- Create: `src/components/coach/checkin-session.tsx` (체크인 세션)
- Create: `src/components/coach/chat-message.tsx`
- Create: `src/app/api/coach/checkin/route.ts`
- Create: `src/app/api/coach/evaluate/route.ts`
- Create: `src/lib/prompts/coach.ts`

**Step 1: AI 코치 프롬프트 설계 — PRD 핵심**

```typescript
// src/lib/prompts/coach.ts
// PRD 7.3 Claude API 활용 시나리오 반영
// PRD 6.9.3 예시 우선 학습 원칙 강제 적용

export const COACH_SYSTEM_PROMPT = `
당신은 LearnLog AI의 메타인지 학습 코치입니다.

## 핵심 원칙
1. 소크라테스식 질문법: 정답을 알려주지 않고, 학습자가 스스로 깨닫도록 질문합니다.
2. 예시 우선 (Example-First Policy): 모든 개념 설명에 반드시 실생활 예시 1개 + 코드 예시 1개를 포함합니다.
3. 비개발자 맥락: 창업자·기획자 관점의 비유를 추가로 제공합니다.
4. 구체적 근거 기반 격려: '잘했어요'식 빈 칭찬이 아닌, 구체적 증거를 들어 격려합니다.

## 현재 컨텍스트
- 학습자: 비전통 개발자, DotLine 창업자
- 과정: 아이펠 AI 엔지니어 2기
- 현재 모듈: {module}
- 오늘 주제: {topic}
- 오늘 캡처 내용: {captures}
- 이전 약점 개념: {weak_concepts}

## 체크인 동작
오늘 캡처된 내용을 분석하여 소크라테스식 질문 3개를 생성합니다.
각 질문은 이해의 다른 측면을 검증합니다:
1. 개념 이해 질문 (정의/원리)
2. 적용 질문 (코드/실무 활용)
3. 연결 질문 (다른 개념과의 관계)
`;

export const EVALUATE_ANSWER_PROMPT = `
학습자의 답변을 평가하세요.

## 평가 기준 (5점 척도)
1점: 개념 자체를 설명하지 못함
2점: 표면적 이해 (용어만 나열)
3점: 기본 이해 (핵심 원리 파악)
4점: 응용 가능 (실제 적용 가능한 이해)
5점: 전문가 수준 (연결·확장 가능)

## 응답 형식
- understanding_level: 1~5 점수
- feedback: 구체적 피드백 (잘한 점 먼저, 보완점 후)
- follow_up: 추가 질문 또는 다음 학습 제안
- example: (점수 3 이하 시) 실생활 예시 + 코드 예시로 보충 설명
`;
```

**Step 2: 체크인 세션 UI**

```typescript
// src/components/coach/checkin-session.tsx
// - 챗 인터페이스 형태
// - AI가 먼저 오늘의 캡처 요약 + 질문 3개 제시
// - 사용자 답변 → AI 평가 → 피드백 순환
// - 세션 완료 시 이해도 레벨 (1~5) 표시
// - 이전 세션 히스토리 열람 가능
```

**Step 3: 체크인 API 엔드포인트**

```typescript
// src/app/api/coach/checkin/route.ts
// POST: 오늘 캡처 내용 기반 → Claude API → 소크라테스식 질문 3개 반환
// - 스트리밍 응답 (ReadableStream) 사용으로 UX 향상
// - 이전 약점 개념 히스토리도 컨텍스트에 포함

// src/app/api/coach/evaluate/route.ts
// POST: 사용자 답변 + 질문 → Claude API → 이해도 평가 + 피드백
```

**Step 4: 회고 자동 생성**

```typescript
// 체크인 세션 완료 후 자동으로 회고 초안 생성
// src/app/api/coach/reflection/route.ts
// POST: 오늘 캡처 + 체크인 답변 → Claude API → 회고 초안
// - 오늘의 WIN 3가지 자동 추출
// - 어려웠던 점 정리
// - 내일 학습 제안
```

**Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add AI metacognition coach with Socratic check-in and reflection"
```

---

### Task 7: 커리큘럼 진도 트래커 — Feature 3

**Files:**
- Create: `src/app/progress/page.tsx`
- Create: `src/components/progress/module-progress.tsx`
- Create: `src/components/progress/heatmap.tsx`
- Create: `src/components/progress/today-position.tsx`
- Create: `src/components/progress/quest-badges.tsx`

**Step 1: 진도 대시보드**

```
// src/app/progress/page.tsx
// 구성:
// 1. 오늘 위치 카드 — Day N/119, 현재 모듈, 남은 일수
// 2. 모듈 타임라인 — 13개 모듈 가로 진행 바, 현재 위치 강조
// 3. 학습 히트맵 — GitHub 잔디 스타일, 일별 캡처·코칭 활동량 시각화
// 4. Main Quest 배지 — MQ 01~05, 달성 시 특별 배지
// 5. 주간 통계 카드 — 이번 주 캡처 수, 코칭 세션 수, 평균 이해도
```

**Step 2: 학습 히트맵 컴포넌트**

```typescript
// src/components/progress/heatmap.tsx
// - 6개월(약 26주) 히트맵 그리드
// - 색상 강도: 캡처 수 + 코칭 완료 여부 기반 (0=빈칸, 1~3=연한색, 4+=진한색)
// - 호버 시 해당 일 상세 (캡처 N개, 코칭 완료/미완료)
// - SVG 기반 직접 구현 (경량화)
```

**Step 3: 모듈 진행률 바**

```typescript
// src/components/progress/module-progress.tsx
// - 13개 모듈 리스트
// - 각 모듈: 이름 | 기간 | 난이도(별) | 완료율 바
// - 현재 진행 중 모듈 하이라이트
// - 난이도 급등 구간(LLM·MLOps) 특별 표시 — PRD 4.3 위기 구간 사전 경보
```

**Step 4: Main Quest 배지**

```typescript
// src/components/progress/quest-badges.tsx
// - MQ 01~05 원형 배지 5개
// - 미달성: 회색 잠김 상태
// - 달성: 컬러풀 + 완료 날짜 표시
// - 달성 시 특별 회고 연결 링크
```

**Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add curriculum progress tracker with heatmap and quest badges"
```

---

### Task 8: Daily Brief (데일리 브리프) — 하루 사이클 시작점

**Files:**
- Create: `src/components/dashboard/daily-brief.tsx`
- Create: `src/app/api/brief/route.ts`
- Create: `src/lib/prompts/brief.ts`

**Step 1: Daily Brief 컴포넌트**

```
// src/components/dashboard/daily-brief.tsx
// 대시보드 메인에 표시되는 오늘의 브리프 카드
//
// 구성:
// - 오늘의 학습: 모듈명 + Day N + 주제
// - 학습 목표 3개 (AI 제안 → 사용자 커스터마이즈 가능)
// - 예상 어려운 개념 (난이도 기반 AI 경고)
// - 오늘의 퀘스트 (있을 경우)
// - 어제의 성과 요약 (스트릭 연속일 등)
//
// 아침 10시 전에 자동 생성, 사용자 접속 시 표시
```

**Step 2: Brief 생성 API**

```typescript
// src/app/api/brief/route.ts
// GET: 오늘 커리큘럼 + 이전 학습 히스토리 → Claude API → Daily Brief 생성
// - 학습 목표 3개
// - 예상 어려운 개념
// - 어제 학습과의 연결고리
```

**Step 3: 커밋**

```bash
git add -A && git commit -m "feat: add Daily Brief with AI-generated learning goals"
```

---

### Task 9: 심층 이해 검증 — 파인만 모드 + 백지학습 모드 (Feature 4)

**Files:**
- Create: `src/app/coach/feynman/page.tsx`
- Create: `src/app/coach/blank-recall/page.tsx`
- Create: `src/components/coach/feynman-session.tsx`
- Create: `src/components/coach/blank-recall-session.tsx`
- Create: `src/app/api/coach/feynman/route.ts`
- Create: `src/app/api/coach/blank-recall/route.ts`
- Create: `src/lib/prompts/deep-check.ts`

**Step 1: 파인만 모드 (PRD 6.4.1)**

```typescript
// src/components/coach/feynman-session.tsx
// 플로우:
// 1. AI가 오늘 핵심 개념 1개 선정 → 화면에 제시
// 2. '초등학생에게 설명하듯 써봐' 프롬프트 표시
// 3. 사용자가 설명 작성 (긴 텍스트 에디터)
// 4. 제출 → Claude API가 논리 빈틈·모호한 지점 감지
// 5. '더 단순하게 설명할 수 있어?' 재질문
// 6. 2~3회 반복 후 설명 품질 점수 산출
//
// 누적: 설명 히스토리 저장 → 개념별 설명 품질 향상 곡선 시각화
```

**Step 2: 백지학습 모드 (PRD 6.4.2)**

```typescript
// src/components/coach/blank-recall-session.tsx
// 플로우:
// 1. 빈 에디터 오픈 + '오늘 배운 것을 처음부터 써봐, 아무것도 보지 말고' 안내
// 2. 사용자가 자유 형식으로 오늘 배운 내용 재구성
// 3. 제출 → Claude API가 오늘 캡처 원본과 비교 분석
// 4. 3가지 축으로 피드백:
//    - 커버리지: 전체 캡처 대비 얼마나 기억했는지 (%)
//    - 순서: 개념 흐름이 맞는지
//    - 연결: 개념 간 관계를 제대로 파악했는지
// 5. 빠진 것보다 맞게 인출한 것을 먼저 인정 (격려 설계)
```

**Step 3: 프롬프트 설계**

```typescript
// src/lib/prompts/deep-check.ts

export const FEYNMAN_PROMPT = `
당신은 파인만 학습법 코치입니다.

오늘 학습 주제: {topic}
선정된 핵심 개념: {concept}

학습자의 설명을 분석하세요:
1. 논리적으로 빈틈이 있는 지점을 정확히 짚어주세요
2. 모호하거나 전문용어에 의존하는 부분을 지적하세요
3. '더 단순하게 설명할 수 있어?'라고 재질문하세요

[예시 우선 정책] 피드백에 반드시 실생활 비유 1개 + 코드 예시 1개를 포함하세요.
`;

export const BLANK_RECALL_PROMPT = `
당신은 백지학습 평가 코치입니다.

[오늘의 캡처 원본]
{original_captures}

[학습자의 백지 재구성]
{user_recall}

세 축으로 비교 분석하세요:
1. 커버리지 (Coverage): 원본 대비 기억한 비율 (%)
2. 순서 (Sequence): 개념 흐름이 올바른지
3. 연결 (Connection): 개념 간 관계를 파악했는지

[격려 우선 원칙] 맞게 인출한 것을 먼저 인정한 뒤, 빠진 개념을 알려주세요.
`;
```

**Step 4: 커밋**

```bash
git add -A && git commit -m "feat: add Feynman mode and blank recall deep understanding checks"
```

---

### Task 10: Quest AI 파트너 — Feature 9

**Files:**
- Create: `src/app/quest/page.tsx`
- Create: `src/app/quest/[id]/page.tsx`
- Create: `src/components/quest/quest-briefing.tsx`
- Create: `src/components/quest/hint-system.tsx`
- Create: `src/components/quest/quest-review.tsx`
- Create: `src/app/api/quest/briefing/route.ts`
- Create: `src/app/api/quest/hint/route.ts`
- Create: `src/lib/prompts/quest.ts`
- Create: `src/data/quests.ts`

**Step 1: 38개 퀘스트 데이터 (PRD 6.9.4)**

```typescript
// src/data/quests.ts
export interface Quest {
  id: string;              // 'SQ_B_01', 'MQ_01' 등
  type: 'sub_b' | 'sub_c' | 'main';
  title: string;
  module: string;
  curriculumDayNumber: number;
  aiStrategy: string;      // AI 지원 전략
}

export const QUESTS: Quest[] = [
  // Sub Quest B (약 14개): 개념 브리핑 + 1~2차 힌트 중심
  // Sub Quest C/C-2 (약 19개): 전체 3단계 힌트 + 코드 예시
  // Main Quest (5개): 집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록
];
```

**Step 2: 퀘스트 목록 페이지**

```
// src/app/quest/page.tsx
// - 전체 38개 퀘스트 타임라인 뷰
// - 유형별 필터 (Sub B | Sub C | Main)
// - 상태 표시: 미시작 (회색) | 진행중 (파랑) | 완료 (초록)
// - Main Quest는 특별 카드 디자인 (크기 크게, 배지 아이콘)
```

**Step 3: 3단계 AI 지원 구조 (PRD 6.9.1~6.9.2)**

```typescript
// src/components/quest/quest-briefing.tsx
// 1단계: 퀘스트 브리핑 — 목표 분해 + 필요 개념 + 실생활·코드 예시 2개

// src/components/quest/hint-system.tsx
// 2단계: 단계별 힌트
//   - 1차 힌트: 개념 방향만 (잠금 해제 버튼)
//   - 2차 힌트: 접근 방법 (1차 사용 후 활성화)
//   - 3차 힌트: 유사 문제 코드 예시 (2차 사용 후 활성화)
//   - 각 단계는 의도적으로 지연 (최소 2분 후 다음 힌트 활성화)
//   - 힌트 사용 이력 기록 → 약점 개념 파악 데이터

// src/components/quest/quest-review.tsx
// 3단계: 퀘스트 회고 — 제출 후 핵심 개념 정리 → 파인만/백지학습 모드 연결
```

**Step 4: 퀘스트 프롬프트 (예시 우선 정책 강제)**

```typescript
// src/lib/prompts/quest.ts

export const QUEST_BRIEFING_PROMPT = `
당신은 LearnLog AI의 퀘스트 브리핑 파트너입니다.

[예시 우선 정책 — 필수]
모든 개념 설명에 반드시:
1. 실생활 예시 1개 (기술 배경 없이도 이해 가능한 비유)
2. 코드 예시 1개 (3~10줄의 최소 동작 가능 예시)
3. 비개발자 맥락 예시 1개 (창업자·기획자 관점 비유)

퀘스트: {quest_title}
모듈: {module}
관련 학습 주제: {topics}

다음을 제공하세요:
1. 퀘스트 목표를 3~4개 하위 단계로 분해
2. 각 단계에 필요한 핵심 개념 목록
3. 각 개념에 대한 실생활 예시 + 코드 예시
`;

export const QUEST_HINT_PROMPT = `
학습자가 퀘스트에서 막혔습니다.

현재 힌트 단계: {level} (1=방향, 2=접근법, 3=코드 예시)
퀘스트: {quest_title}
막힌 지점: {stuck_point}

[핵심 철학] 정답을 주는 것이 아니라 스스로 도달하게 안내합니다.
힌트를 열수록 스스로 생각한 흔적이 쌓입니다.

Level {level} 힌트를 제공하세요.
`;
```

**Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add Quest AI Partner with 3-stage hint system"
```

---

### Task 11: Confidence Engine (자신감 유지 엔진) — Feature 8

**Files:**
- Create: `src/components/confidence/win-card.tsx`
- Create: `src/components/confidence/streak-counter.tsx`
- Create: `src/components/confidence/growth-timeline.tsx`
- Create: `src/components/confidence/completion-gauge.tsx`
- Create: `src/components/confidence/crisis-alert.tsx`
- Create: `src/app/api/confidence/wins/route.ts`
- Create: `src/lib/prompts/confidence.ts`

**Step 1: 오늘의 WIN 카드 (PRD 6.8)**

```typescript
// src/components/confidence/win-card.tsx
// - AI가 오늘 캡처·코칭 기록에서 잘한 것 3가지 자동 추출
// - 카드 형태로 시각적 제시
// - 예시: '오늘 Transformer의 Attention 메커니즘을 자신의 언어로 설명했습니다.
//          3주 전엔 이 개념이 캡처조차 안 됐었죠. 이게 성장입니다.'
// - 대시보드 하단 또는 하루 마무리 시점에 표시
```

**Step 2: 스트릭 카운터 + 마일스톤 배지**

```typescript
// src/components/confidence/streak-counter.tsx
// - 연속 기록 일수 (불꽃 아이콘 + 숫자)
// - 마일스톤: 7일, 30일, 60일, 100일, 119일(완주) 배지
// - 모듈 완료 배지 (13개)
// - Main Quest 달성 축하 메시지
```

**Step 3: 성장 증거 타임라인**

```typescript
// src/components/confidence/growth-timeline.tsx
// - 파인만 모드 기록 활용: 1주차 vs N주차 설명 품질 비교
// - 이해도 점수 추이 그래프 (체크인 세션 데이터 기반)
// - "과거의 나 vs 현재의 나" 직관적 대비
```

**Step 4: 완주 예측 게이지 + 위기 구간 경보**

```typescript
// src/components/confidence/completion-gauge.tsx
// - 현재 기록률·이해도 추이 기반 완주 확률 (%) 표시
// - 원형 게이지 UI

// src/components/confidence/crisis-alert.tsx
// - LLM·MLOps 등 난이도 급등 구간 진입 2주 전 사전 안내
// - '이 구간은 원래 모두가 어려워합니다' 메시지
// - isHighIntensityPeriod() 함수 활용
```

**Step 5: 커밋**

```bash
git add -A && git commit -m "feat: add Confidence Engine with WIN cards, streaks, growth timeline"
```

---

### Task 12: 메인 대시보드 통합

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/dashboard/today-summary.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`

**Step 1: 대시보드 레이아웃 — Daily Learning Loop 반영 (PRD 5.3)**

```
// src/app/page.tsx
// 대시보드 구성 (위→아래):
//
// ┌─────────────────────────────────────┐
// │  Daily Brief (Task 8)               │  ← 오늘 학습 목표 + 모듈 정보
// ├──────────────┬──────────────────────┤
// │  Today       │  Streak: N일         │  ← 오늘 캡처 수, 코칭 상태, 스트릭
// │  Position    │  완주 예측: NN%       │
// │  Day N/119   │                      │
// ├──────────────┴──────────────────────┤
// │  Quick Actions                      │  ← 빠른 캡처 | AI 코치 | 오늘 퀘스트
// ├─────────────────────────────────────┤
// │  오늘의 캡처 미리보기 (최근 3개)      │
// ├─────────────────────────────────────┤
// │  오늘의 WIN 카드 (3개)              │  ← Confidence Engine
// ├─────────────────────────────────────┤
// │  위기 구간 알림 (해당 시)            │  ← 난이도 급등 사전 경보
// └─────────────────────────────────────┘
```

**Step 2: Quick Actions 컴포넌트**

```typescript
// src/components/dashboard/quick-actions.tsx
// 3개 주요 액션 버튼:
// 1. '빠른 캡처' → /capture (가장 크게)
// 2. 'AI 코치' → /coach (체크인 또는 파인만/백지학습 선택)
// 3. '오늘 퀘스트' → /quest/[today-quest-id] (퀘스트가 있는 날만 활성화)
```

**Step 3: 커밋**

```bash
git add -A && git commit -m "feat: integrate main dashboard with daily learning loop"
```

---

## Phase 2 — Growth (Task 13~16)

> 목표: 학습 자산 축적 + 공유 시작
> 시기: 5~6월 (LLM·배포 모듈)

---

### Task 13: 마인드맵 모드 — Feature 4.3

**Files:**
- Create: `src/app/coach/mindmap/page.tsx`
- Create: `src/components/mindmap/canvas.tsx`
- Create: `src/components/mindmap/node.tsx`
- Create: `src/components/mindmap/edge.tsx`
- Create: `src/app/api/coach/mindmap/route.ts`
- Dependency: `reactflow`

**구현 내용:**
- 사용자가 중심 개념 입력 → 드래그로 노드 연결 → 마인드맵 구성
- 완성 후 AI가 분석: 잘못 연결된 개념, 누락된 연결고리, 추가 가지 제안
- AI 자동 생성 개념 그래프와 사용자 맵 나란히 비교
- 모듈 누적 맵 기능 (6개월 확장 지도)
- 완성된 마인드맵을 포트폴리오에 삽입 가능

---

### Task 14: 개념 지식 그래프 — Feature 5

**Files:**
- Create: `src/app/graph/page.tsx`
- Create: `src/components/graph/knowledge-graph.tsx`
- Create: `src/app/api/graph/build/route.ts`
- Create: `src/lib/prompts/graph.ts`
- Dependency: `d3` 또는 `reactflow`

**구현 내용:**
- 캡처된 개념 간 연관성을 AI가 분석하여 그래프 자동 구성
- 예: Python → PyTorch → CNN → Transformer → LLM → RAG → Agent
- 개념 키워드 검색 시 관련 학습일·노트 즉시 연결
- 노드 크기 = 해당 개념 학습량, 엣지 두께 = 연관 강도
- 시간 슬라이더로 그래프 성장 과정 애니메이션

---

### Task 15: 학습 포트폴리오 빌더 — Feature 6

**Files:**
- Create: `src/app/portfolio/page.tsx`
- Create: `src/app/portfolio/[id]/page.tsx`
- Create: `src/components/portfolio/builder.tsx`
- Create: `src/components/portfolio/module-card.tsx`
- Create: `src/components/portfolio/growth-chart.tsx`
- Create: `src/app/api/portfolio/generate/route.ts`

**구현 내용:**
- AI가 6개월 학습 데이터를 자동 정리하여 포트폴리오 초안 생성
- 콘텐츠: 모듈별 핵심 학습, 프로젝트 결과, 성장 지표, AI 코칭 히스토리
- 출력 형식: 공개 웹페이지 URL / PDF 다운로드
- '학습 과정의 증거' — 단순 이력이 아닌 성장 스토리

---

### Task 16: Phase 2 통합 + 대시보드 확장

**구현 내용:**
- 대시보드에 개념 그래프 미니뷰 추가
- AI 코치 메뉴에 마인드맵 모드 추가 (요일별 추천 루틴: 월~수 파인만, 목 백지학습, 금 마인드맵)
- 포트폴리오 빌더 진입점 추가
- 주간/월간 리포트 자동 생성 기능

---

## Phase 3 — Social (Task 17~18)

> 목표: 집단지성 + 취업 포트폴리오 완성
> 시기: 7~9월 (파이널 프로젝트)

---

### Task 17: 동료 학습 공유 — Feature 7

**Files:**
- Create: `src/app/community/page.tsx`
- Create: `src/components/community/share-card.tsx`
- Create: `src/components/community/feed.tsx`

**구현 내용:**
- 공유 단위: 오늘의 핵심 개념 1줄 요약 / 어려웠던 것 / 발견한 팁
- 익명 옵션: 선택적 익명 공유로 심리적 부담 최소화
- AI 큐레이션: 동기들의 공유 내용 중 내 약점과 관련된 것 우선 추천
- Supabase Realtime 활용 실시간 피드

---

### Task 18: 팀 프로젝트 연동 (파이널 프로젝트)

**구현 내용:**
- AIFFELthon 팀 기반 학습 기록 공유
- 팀 대시보드: 팀원별 역할·진행 상황 시각화
- 팀 회고 세션: AI가 팀 전체 학습 데이터 기반 회고 질문 생성

---

## 성공 지표 추적 (PRD 섹션 8)

대시보드에 반영할 핵심 지표:

| 지표 | 목표 | 데이터 소스 |
|------|------|------------|
| 일일 기록률 | 80% (95일+/119일) | `captures` 테이블 일별 집계 |
| AI 코칭 완료율 | 70% | `coach_sessions.completed_at` |
| 이해도 향상 | 첫달 대비 +20% | `coach_sessions.understanding_level` 추이 |
| Main Quest 제출률 | 5/5 | `quest_logs` (type='main') |
| 연속 기록 스트릭 | 최대화 | `captures` 연속일 계산 |
| WIN 카드 누적 | 357개 (119x3) | `confidence_records.win_cards` |

---

## 파일 구조 요약

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 + 네비게이션
│   ├── page.tsx                # 메인 대시보드
│   ├── auth/
│   │   ├── login/page.tsx      # 로그인
│   │   └── callback/route.ts   # OAuth 콜백
│   ├── capture/page.tsx        # Smart Capture
│   ├── coach/
│   │   ├── page.tsx            # AI 코치 메인 (체크인)
│   │   ├── feynman/page.tsx    # 파인만 모드
│   │   ├── blank-recall/page.tsx # 백지학습 모드
│   │   └── mindmap/page.tsx    # 마인드맵 모드 (Phase 2)
│   ├── progress/page.tsx       # 진도 트래커
│   ├── quest/
│   │   ├── page.tsx            # 퀘스트 목록
│   │   └── [id]/page.tsx       # 퀘스트 상세
│   ├── graph/page.tsx          # 개념 그래프 (Phase 2)
│   ├── portfolio/              # 포트폴리오 (Phase 2)
│   ├── community/              # 동료 공유 (Phase 3)
│   └── api/
│       ├── capture/classify/route.ts
│       ├── coach/
│       │   ├── checkin/route.ts
│       │   ├── evaluate/route.ts
│       │   ├── reflection/route.ts
│       │   ├── feynman/route.ts
│       │   └── blank-recall/route.ts
│       ├── brief/route.ts
│       ├── quest/
│       │   ├── briefing/route.ts
│       │   └── hint/route.ts
│       └── confidence/wins/route.ts
├── components/
│   ├── layout/                 # 사이드바, 모바일 네비
│   ├── capture/                # 캡처 관련 컴포넌트
│   ├── coach/                  # AI 코치 컴포넌트
│   ├── progress/               # 진도 트래커 컴포넌트
│   ├── quest/                  # 퀘스트 컴포넌트
│   ├── confidence/             # 자신감 엔진 컴포넌트
│   ├── dashboard/              # 대시보드 컴포넌트
│   └── ui/                     # shadcn/ui 컴포넌트
├── data/
│   ├── curriculum.ts           # 119일 커리큘럼 데이터
│   └── quests.ts               # 38개 퀘스트 데이터
├── lib/
│   ├── supabase/               # Supabase 클라이언트
│   ├── prompts/                # Claude API 프롬프트 모음
│   │   ├── capture.ts
│   │   ├── coach.ts
│   │   ├── deep-check.ts
│   │   ├── quest.ts
│   │   ├── brief.ts
│   │   ├── confidence.ts
│   │   └── graph.ts
│   ├── curriculum.ts           # 커리큘럼 유틸리티
│   └── utils.ts
├── hooks/
│   └── use-user.ts
└── middleware.ts
```

---

## 실행 우선순위 요약

```
Week 1: Task 1~4 (프로젝트 초기화 + DB + Auth + 커리큘럼 데이터)
         → Day 1부터 데이터 입력 가능한 기반 완성

Week 2: Task 5~6 (Smart Capture + AI 코치)
         → 핵심 학습 루틴의 두 축 완성

Week 3: Task 7~8 (진도 트래커 + Daily Brief)
         → 매일 열어보는 대시보드 완성

Week 4: Task 9~12 (심층 검증 + 퀘스트 + Confidence Engine + 통합)
         → Phase 1 MVP 완성, 매일 사용 가능
```

---

*이 기획안은 LearnLog_AI_PRD_v5.docx의 전체 내용을 반영하여 작성되었습니다.*
*PRD의 핵심 원칙 — 예시 우선 정책, 소크라테스식 질문, 비개발자 맥락 코칭, 구체적 근거 기반 격려 — 이 모든 AI 프롬프트에 적용됩니다.*

# AI 용어 코칭 + 용어 사전 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI 튜터에 용어 코칭 모드 탭을 추가하고, 학습한 용어를 저장/검색할 수 있는 용어 사전 페이지를 만든다.

**Architecture:** AI 튜터 페이지에 "일반 질문"/"용어 코칭" 탭을 추가하여 용어 모드 진입. 용어 코칭 시 구조화된 프롬프트로 개념/예시/활용/연관 용어를 응답. 대화 중 설명된 용어는 자동 저장되어 /glossary 페이지에서 모듈별 분류 + 검색으로 열람 가능.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL + RLS), OpenAI (gpt-4o/gpt-4o-mini), Tailwind CSS

---

### Task 1: DB 마이그레이션 — glossary_terms 테이블

**Files:**
- Create: `supabase/migrations/011_glossary_terms.sql`

**Code:**

```sql
-- 용어 사전 테이블
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  module TEXT,
  definition TEXT NOT NULL,
  related_terms TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 같은 사용자가 같은 용어 중복 저장 방지
CREATE UNIQUE INDEX idx_glossary_user_term ON glossary_terms (user_id, term);

-- RLS
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own glossary" ON glossary_terms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glossary" ON glossary_terms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own glossary" ON glossary_terms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own glossary" ON glossary_terms
  FOR DELETE USING (auth.uid() = user_id);
```

---

### Task 2: 용어 코칭 API — `/api/tutor/chat/route.ts` 수정

**Files:**
- Modify: `src/app/api/tutor/chat/route.ts`

용어 코칭 모드("glossary")를 MODE_PROMPTS에 추가하고, 응답 후 용어를 자동 추출하여 glossary_terms에 저장하는 로직 추가.

**변경 내용:**

1. `MODE_PROMPTS`에 `glossary` 키 추가:

```typescript
glossary: `## 용어 코칭 모드
학생이 AI/ML 용어의 개념을 질문했습니다. 아래 구조로 답변하세요:

### 📖 개념 정의
- 비전공자도 이해할 수 있는 쉬운 설명 (일상 비유 필수)
- 영어 원어와 한글 병기

### 💻 실제 예시
- 실행 가능한 코드 예시 (Python 중심)
- 입력/출력 결과 포함
- 코드에 한글 주석 상세히

### 🔧 활용법
- 실무/학습에서 어떻게 사용되는지
- 어떤 상황에서 이 개념이 필요한지

### 🔗 연관 용어
- 함께 알면 좋은 관련 용어 3-5개
- 각 용어에 한 줄 설명 포함

### ✅ 이해도 체크
- "이 용어를 자기 말로 설명해보세요" 형태의 확인 질문

[중요] 응답의 맨 마지막 줄에 아래 형식으로 메타데이터를 추가하세요:
<!-- GLOSSARY_META: {"term": "용어명", "related": ["연관1", "연관2", "연관3"]} -->`,
```

2. POST 핸들러에서 mode가 "glossary"일 때 응답에서 메타데이터를 파싱하여 glossary_terms에 upsert:

```typescript
// 응답 후 용어 자동 저장 (glossary 모드일 때)
if (mode === "glossary") {
  try {
    const metaMatch = content.match(/<!-- GLOSSARY_META: ({.*?}) -->/);
    if (metaMatch) {
      const meta = JSON.parse(metaMatch[1]);
      const cleanContent = content.replace(/<!-- GLOSSARY_META:.*?-->/, "").trim();

      await supabase.from("glossary_terms").upsert(
        {
          user_id: user.id,
          term: meta.term,
          module: module || null,
          definition: cleanContent,
          related_terms: meta.related || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,term" }
      );
    }
  } catch {
    // 저장 실패해도 응답은 정상 반환
  }
}
```

3. 응답에서 메타데이터 태그를 제거하고 클린 콘텐츠만 반환.

---

### Task 3: 용어 사전 CRUD API

**Files:**
- Create: `src/app/api/glossary/route.ts`

**Code:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const module = request.nextUrl.searchParams.get("module");
  const search = request.nextUrl.searchParams.get("q");

  let query = supabase
    .from("glossary_terms")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (module) query = query.eq("module", module);
  if (search) query = query.ilike("term", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ terms: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await supabase.from("glossary_terms").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
```

---

### Task 4: AI 튜터 페이지에 탭 추가

**Files:**
- Modify: `src/app/tutor/page.tsx`
- Modify: `src/components/tutor/tutor-chat.tsx`

**변경 내용:**

1. `tutor/page.tsx` — Home 화면 상단에 "일반 질문" / "용어 코칭" 탭 추가:
   - 탭 state: `tab: "general" | "glossary"`
   - "용어 코칭" 탭 선택 시 토픽 선택 대신 용어 입력 필드 표시
   - startNewChat 호출 시 chatMode 전달

2. `tutor-chat.tsx` — Props에 `glossaryMode?: boolean` 추가:
   - glossaryMode가 true면 MODES 배열 대신 고정으로 glossary 모드 사용
   - 플레이스홀더: "궁금한 용어를 입력하세요..."
   - 빈 상태 UI 변경: 용어 코칭 안내 문구

---

### Task 5: 용어 사전 페이지

**Files:**
- Create: `src/app/glossary/page.tsx`

용어 사전 페이지. 모듈별 필터 + 검색 + 용어 카드 리스트. 카드 클릭 시 정의 펼치기. "다시 질문하기" 버튼으로 튜터 용어 모드 이동.

**주요 구성:**
- 상단: 검색 인풋 + 모듈 필터 드롭다운
- 본문: 용어 카드 그리드 (term, module, 생성일, 연관 용어 태그)
- 카드 펼침: 마크다운으로 렌더된 AI 설명 전체
- 버튼: "다시 대화하기" → `/tutor?mode=glossary&term={term}`
- 빈 상태: "아직 저장된 용어가 없습니다. AI 튜터의 용어 코칭 모드에서 용어를 질문해보세요!"

---

### Task 6: 사이드바 + 모바일 네비 업데이트

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/mobile-nav.tsx`

**변경 내용:**
- navItems 배열에 `{ href: "/glossary", label: "용어 사전", icon: BookA }` 추가 (AI 튜터 아래)
- lucide-react에서 `BookA` 아이콘 import

---

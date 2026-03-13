# 모바일 네비 + PWA 설치 + 대시보드 개선 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모바일 UX를 개선하고 (5탭 네비 + 더보기 Sheet), PWA 앱 설치 배너를 추가하고, 대시보드 정보 과부하를 해소한다.

**Architecture:** 모바일 하단 네비를 5탭으로 줄이고 나머지를 Sheet 컴포넌트로 이동. PWA install prompt를 `beforeinstallprompt` 이벤트로 구현. 대시보드 하위 섹션을 아코디언으로 접기.

**Tech Stack:** Next.js App Router + Tailwind CSS + shadcn/ui Sheet + Web App Manifest + beforeinstallprompt API

---

## Task 1: 모바일 하단 네비게이션 5탭으로 리팩터

**Files:**
- Modify: `src/components/layout/mobile-nav.tsx`

**구현:**
- 하단 탭을 5개로 축소: 홈, 캡처, AI 튜터, AI 코치, 더보기
- "더보기" 탭 클릭 시 Sheet 오픈
- Sheet 내부에 5개 그룹(학습 기록, 분석, 확장, 소셜, 기타)으로 나머지 메뉴 배치
- 현재 페이지가 더보기 내 항목이면 "더보기" 탭 활성화

**커밋:** `feat: redesign mobile nav with 5 tabs and more-menu sheet`

---

## Task 2: 사이드바 그룹핑 개선

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

**구현:**
- 데스크톱 사이드바도 동일한 5그룹으로 구분선+라벨 추가
- 시각적 계층 구조 개선

**커밋:** `feat: add grouped sections to desktop sidebar`

---

## Task 3: PWA manifest 보강 + 아이콘

**Files:**
- Modify: `public/manifest.json`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Modify: `src/app/layout.tsx` (meta tags)

**구현:**
- manifest.json에 icons, screenshots, categories 추가
- SVG → PNG 아이콘 생성 (192x192, 512x512)
- layout.tsx에 apple-touch-icon, theme-color meta 추가

**커밋:** `feat: enhance PWA manifest with icons and metadata`

---

## Task 4: PWA 설치 배너 컴포넌트

**Files:**
- Create: `src/components/pwa/install-banner.tsx`
- Modify: `src/app/page.tsx`

**구현:**
- beforeinstallprompt 이벤트 캡처
- iOS Safari 감지 (standalone 미지원 시 수동 안내)
- 닫기 시 localStorage에 7일간 숨김 저장
- 대시보드 최상단에 배치

**커밋:** `feat: add PWA install banner for mobile`

---

## Task 5: 대시보드 아코디언 정리

**Files:**
- Create: `src/components/dashboard/collapsible-section.tsx`
- Modify: `src/app/page.tsx`

**구현:**
- CollapsibleSection 래퍼 컴포넌트 (제목 + 접기/펼치기)
- 핵심 3개 (Daily Brief, Quick Actions, Today Summary) 항상 표시
- 나머지 섹션을 3개 그룹으로 묶어 기본 접힌 상태
- localStorage로 접기 상태 기억

**커밋:** `feat: reorganize dashboard with collapsible sections`

---

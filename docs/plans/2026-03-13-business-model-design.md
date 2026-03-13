# AI 비즈니스 모델 빌더 설계

## 배경

LearnLog AI의 최종 목적은 단순 학습이 아닌 비즈니스로의 연결. 6개월 AI 교육과정에서 배우는 기술들과 사용자의 아이디어가 유기적으로 결합되어 비즈니스 모델이 점진적으로 구축되는 기능.

## 핵심 컨셉

- 여러 비즈니스 아이디어를 자유롭게 탐색하는 "아이디어 놀이터"
- 처음엔 비전 한 줄로 시작, 학습 진행에 따라 AI가 캔버스를 점진적으로 채워감
- 매일 학습한 기술이 비즈니스 아이디어와 자동 연결

## 핵심 기능

### 1. 비즈니스 페이지 (`/business`)

- 여러 비즈니스 아이디어를 카드 형태로 관리
- 각 카드: 비전 한 줄 + AI가 연결한 기술 수 + 캔버스 진행도(%)
- 새 아이디어: 한 줄 비전만 입력하면 생성
- 상태: 탐색 중 / 발전 중 / 보류

### 2. 아이디어 상세 페이지 (`/business/[id]`)

- **비즈니스 캔버스**: 아래 항목이 점진적으로 채워짐
  - 해결하는 문제
  - 타겟 고객
  - 솔루션 설명
  - 필요 기술 스택
  - 필요 데이터
  - 수익 모델
  - 경쟁 우위
  - MVP 범위
- **AI 인사이트 타임라인**: 학습-비즈니스 연결이 시간순으로 쌓임
  - "Day 15: CNN 학습 → X-ray 이미지 분류에 활용 가능"
  - "Day 30: FastAPI 학습 → MVP API 서버 구축 가능"
- **AI 토론**: 이 아이디어에 대해 AI와 자유롭게 대화, 학습 데이터 참조

### 3. 학습-비즈니스 자동 연결

- 매일 학습 후 AI가 활성 아이디어들에 대해 인사이트 자동 생성
- `/api/business/insight` POST — 오늘 학습 내용 + 활성 아이디어 목록 → AI가 연결 인사이트 생성
- Daily Brief 하단에 "비즈니스 인사이트" 섹션 추가 (인사이트 있을 때만)

### 4. DB 구조

- `business_ideas` 테이블:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `title` (text) — 비전 한 줄
  - `canvas` (jsonb) — { problem, target, solution, tech_stack, data, revenue, advantage, mvp }
  - `status` (text) — exploring / developing / paused
  - `created_at`, `updated_at` (timestamptz)

- `business_insights` 테이블:
  - `id` (uuid, PK)
  - `idea_id` (uuid, FK → business_ideas)
  - `user_id` (uuid, FK)
  - `day_number` (int) — 커리큘럼 Day
  - `skill_learned` (text) — 배운 기술/주제
  - `insight` (text) — AI가 생성한 연결 인사이트
  - `created_at` (timestamptz)

- RLS: 본인 데이터만 CRUD

### 5. API

- `/api/business` GET — 아이디어 목록
- `/api/business` POST — 새 아이디어 생성
- `/api/business/[id]` GET — 상세 조회 (캔버스 + 인사이트)
- `/api/business/[id]` PATCH — 캔버스 업데이트
- `/api/business/[id]` DELETE — 아이디어 삭제
- `/api/business/insight` POST — 학습-비즈니스 인사이트 생성 (AI)
- `/api/business/chat` POST — 아이디어별 AI 토론

### 6. AI 프롬프트 전략

- 인사이트 생성: gpt-4o-mini (간결한 연결 한 줄)
- 캔버스 항목 제안: gpt-4o (깊은 분석 필요)
- AI 토론: gpt-4o (비즈니스 멘토 역할)

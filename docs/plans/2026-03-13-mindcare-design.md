# 멘탈 케어 시스템 설계

## 목표

비전공자가 6개월 AI 교육과정(119일)을 포기하지 않고 끝까지 완주할 수 있도록 매일 동기부여, 힘들 때 위로, 어려울 때 함께하는 종합 멘탈 케어 시스템.

## 아키텍처

3가지 핵심 요소로 구성:

1. **대시보드 아침 멘탈 케어 카드** — 매일 컨디션 체크 + 맞춤 격려 + SOS 버튼
2. **`/mindcare` 전용 페이지** — AI 멘탈 케어 멘토와의 채팅
3. **SOS 즉석 위로** — 긴급 위로 메시지 + 대화 연결

---

## 1. 대시보드 — 아침 멘탈 케어 카드

대시보드 상단(DailyBrief 바로 아래)에 매일 표시.

- **컨디션 체크**: "오늘 기분이 어때요?" 5단계 이모지 선택 (마음 상태 전용, 기존 SelfRating 학습 컨디션과 별도)
- **맞춤 격려 메시지**: 컨디션 + 학습 진도(Day N/119, 완주율) + 최근 활동을 종합해서 AI가 생성
  - 힘들면: 위로 + "어제 캡처 3개나 했잖아요, 충분히 하고 있어요"
  - 좋으면: 응원 + "이 페이스라면 목표 완주 확실해요!"
- **SOS 버튼**: "지금 힘들어요" 누르면 즉석 위로 팝업 표시 → "더 이야기하고 싶다면" `/mindcare` 링크

---

## 2. `/mindcare` 페이지 — AI 멘탈 케어 멘토

채팅 형태의 전용 페이지.

### AI 멘토 성격
따뜻하고 공감적인 학습 동반자. 비전공자의 불안과 고민을 깊이 이해하는 선배 같은 존재.

### 다루는 주제 범위
- 학습 좌절: "이해가 안 돼요", "나만 뒤처지는 것 같아요"
- 비전공자 불안: "전공자들은 다 아는데 나만 모르는 것 같아요"
- 진로 고민: "이걸 배워서 뭘 할 수 있을까"
- 번아웃: "더 이상 못하겠어요", "의욕이 없어요"

### AI 컨텍스트
현재 커리큘럼(Day, 모듈, 난이도), 최근 학습 활동(캡처, 코칭, 일기), 과거 멘탈 케어 대화 기록을 참고해서 개인화된 응답.

### 세션 보존
DB에 대화 기록 저장. 재방문 시 이전 대화 이어가기 + AI가 지난 고민 후속 케어.

### UI
AI 튜터와 비슷한 채팅 UI, 보라색/라벤더 톤으로 차분한 분위기.

---

## 3. 데이터 & API 구조

### DB 테이블

**`mindcare_sessions`** — 세션 관리
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `title` (text) — AI가 대화 주제로 자동 생성
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**`mindcare_messages`** — 대화 기록
- `id` (uuid, PK)
- `session_id` (uuid, FK)
- `role` (text) — user / assistant
- `content` (text)
- `created_at` (timestamptz)

**`mindcare_checkins`** — 아침 컨디션 체크
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `mood_level` (int, 1-5)
- `ai_message` (text)
- `created_at` (timestamptz)

### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/mindcare/checkin` | 컨디션 기록 + AI 격려 메시지 생성 |
| GET | `/api/mindcare/checkin/today` | 오늘 체크인 확인 (중복 방지) |
| GET | `/api/mindcare/sessions` | 세션 목록 |
| POST | `/api/mindcare/sessions` | 새 세션 생성 |
| GET | `/api/mindcare/sessions/[id]` | 대화 기록 로드 |
| POST | `/api/mindcare/chat` | 메시지 전송 + AI 응답 |
| POST | `/api/mindcare/sos` | SOS 즉석 위로 메시지 생성 |

### AI 모델

- 체크인/SOS: `gpt-4o-mini` (짧은 응답, 비용 효율)
- 채팅: `gpt-4o` (깊은 공감과 맥락 이해 필요)

---

## 컴포넌트 구조

- `src/components/dashboard/mindcare-card.tsx` — 대시보드 아침 멘탈 케어 카드
- `src/app/mindcare/page.tsx` — 멘탈 케어 메인 페이지 (세션 목록 + 채팅)
- `src/components/mindcare/mindcare-chat.tsx` — 채팅 UI
- `src/components/mindcare/sos-modal.tsx` — SOS 위로 팝업

---

## 기술 스택

- Next.js API Routes (서버 사이드)
- Supabase (PostgreSQL + RLS)
- OpenAI GPT-4o / GPT-4o-mini
- ReactMarkdown (AI 응답 렌더링)
- Tailwind CSS (보라색/라벤더 테마)

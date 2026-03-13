# PRD 갭 9개 항목 구현 설계

## 날짜: 2026-03-13

## 개요
LearnLog AI PRD v5 대비 미구현/부분구현 9개 항목을 구현하는 설계안.
(이미지 캡처는 후순위로 제외)

## 새 Supabase 테이블

### quest_hint_logs
- id (uuid, PK)
- user_id (uuid, FK)
- quest_id (text)
- hint_level (int, 1~3)
- concept (text, nullable)
- created_at (timestamptz)

### weakness_concepts
- id (uuid, PK)
- user_id (uuid, FK)
- concept (text)
- module (text)
- fail_count (int, default 1)
- last_asked (timestamptz)
- resolved (boolean, default false)
- created_at (timestamptz)

### feynman_scores
- id (uuid, PK)
- user_id (uuid, FK)
- concept (text)
- module (text)
- score (int, 1~5)
- created_at (timestamptz)

## 항목별 설계

### 1. 완주 예측 게이지 실데이터 연동
- `/api/confidence/completion` API 신규
- captures 수, coach 세션 수, 이해도 평균 쿼리
- 계산: (기록일수/전체수업일 × 40%) + (코칭완료율 × 30%) + (평균이해도/5 × 30%)
- CompletionGauge 컴포넌트에서 API 호출

### 2. 약점 개념 재질문
- evaluate API에서 이해도 3이하 개념 → weakness_concepts 저장
- checkin API에서 미해결 약점 조회 → 프롬프트 주입
- 이해도 4이상 달성 시 resolved 마킹

### 3. 퀘스트 회고 연결
- 퀘스트 페이지에 "회고하기" 버튼
- 파인만/백지학습 선택 → 해당 퀘스트 개념으로 코치 페이지 이동

### 4. 퀘스트 힌트 사용 기록
- 힌트 요청 시 quest_hint_logs에 기록
- 퀘스트 상세에 힌트 사용 횟수 표시
- 프로그레스 페이지에 힌트 TOP 3

### 5. 위기 구간 2주 전 사전 경보
- curriculum.ts에 getUpcomingHighIntensity(14) 함수
- DailyBrief에서 2주 내 고난이도 구간 사전 안내 배너

### 6. 파인만 설명 품질 향상 곡선
- 파인만 평가 시 feynman_scores에 점수 저장
- SVG 라인차트로 시간별 점수 추이 시각화

### 7. 마인드맵 vs AI 그래프 비교
- 마인드맵 페이지에 "AI 그래프와 비교" 버튼
- 좌우 분할: 사용자 맵 vs AI 그래프
- 누락/잘못된 연결 하이라이트

### 8. Main Quest 특별 회고 워크플로우
- MQ 도달 감지 → 대시보드에 특별 회고 카드
- 전용 회고 페이지: 모듈 종합 학습 요약 + AI 평가 + 성취 배지

### 9. 학습 일기 AI 회고 초안 연동
- 일기 작성에 "AI 초안 생성" 버튼
- 캡처 + 코칭 데이터 → /api/coach/reflection 활용
- 사용자 편집 후 저장

import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MODE_PROMPTS: Record<string, string> = {
  normal: `## 답변 구조 (반드시 이 형식을 따르세요)

### 📝 쉬운 설명
- 일상생활 비유를 활용하여 핵심 개념을 설명
- 전문용어에는 (쉬운 설명)을 괄호로 병기

### 💻 예시
- 실행 가능한 코드 예시 또는 구체적인 사례
- 코드에는 한글 주석을 상세히 달기
- 입력과 출력 결과도 함께 보여주기

### 🔗 관련 개념
- 현재 질문과 연결되는 2-3개의 관련 개념
- 커리큘럼상 어디서 배우는지 언급

### 🎯 실습 과제
- 직접 해볼 수 있는 간단한 미니 과제 1개 (10-15분)

### 🔍 더 알아보기
- 관련 키워드 3-5개를 태그 형태로 제시

### ✅ 이해도 체크
- 방금 설명한 내용을 확인하는 간단한 질문 1개
- "~를 자기 말로 설명해보세요" 또는 "~의 결과는 무엇일까요?" 형태
- 학생이 대답하면 맞으면 칭찬 + 심화, 틀리면 다른 비유로 재설명`,

  error: `## 에러 분석 모드
학생이 에러 메시지나 코드 문제를 붙여넣었습니다. 아래 구조로 답변하세요:

### 🚨 에러 원인
- 에러 메시지를 한 줄씩 해석
- 핵심 원인을 비유로 쉽게 설명

### 🔧 해결 방법
- 단계별 해결 코드 제시 (수정 전/후 비교)
- 각 수정에 대한 이유 설명

### 🛡️ 예방법
- 같은 에러를 방지하는 팁
- 관련 디버깅 패턴 소개

### ✅ 이해도 체크
- "이 에러가 왜 발생했는지 자기 말로 설명해보세요" 같은 확인 질문`,

  code: `## 코드 설명 모드
학생이 코드를 이해하고 싶어합니다. 아래 구조로 답변하세요:

### 📖 코드 한 줄씩 해석
- 각 줄/블록이 하는 일을 일상 비유로 설명
- 실행 순서를 시각적으로 보여주기

### 🔄 실행 흐름
- 코드가 실행되는 과정을 단계별로 설명
- 가능하면 \`\`\`mermaid 플로우차트로 시각화

### 💡 핵심 패턴
- 이 코드에서 배울 수 있는 프로그래밍 패턴
- 변형 예시 제시

### ✅ 이해도 체크
- 코드 일부를 변경하면 결과가 어떻게 바뀔지 질문`,

  diagram: `## 시각화 모드
개념이나 구조를 다이어그램으로 설명하세요. 반드시 mermaid 코드 블록을 포함하세요.

### 📊 다이어그램
- \`\`\`mermaid 코드 블록으로 시각적 구조 표현
- flowchart, sequence diagram, class diagram 등 적절한 형태 사용
- 노드 이름은 한글로

### 📝 다이어그램 해설
- 각 요소와 화살표가 의미하는 것 설명
- 전체 흐름을 자연어로 풀어 설명

### 🔗 관련 개념
- 다이어그램과 연결되는 관련 개념들

### ✅ 이해도 체크
- 다이어그램의 특정 부분에 대한 질문`,

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

[중요] 응답의 맨 마지막 줄에 아래 형식으로 메타데이터를 추가하세요 (사용자에게는 보이지 않습니다):
<!-- GLOSSARY_META: {"term": "용어명", "related": ["연관1", "연관2", "연관3"]} -->`,
};

const SYSTEM_PROMPT = `당신은 비전공자를 위한 AI/ML 전문 튜터입니다.

## 당신의 역할
- 6개월 AI 교육과정(아이펠)을 수강 중인 비전공자 학생의 실시간 학습 도우미
- 어떤 질문이든 친절하고 체계적으로 답변
- 전문용어를 쓸 때는 반드시 쉬운 설명을 괄호로 병기
- 개념을 설명할 때 시각적 다이어그램이 도움이 되면 \`\`\`mermaid 코드 블록 사용

## 주의사항
- 존댓말 사용 (전문 강사 톤)
- 코드 블록은 반드시 언어 표시 (\`\`\`python 등)
- 질문이 모호하면 구체적으로 어떤 부분이 궁금한지 되물어보기
- 이전 대화 맥락을 고려하여 답변
- 학생이 이해도 체크 질문에 답하면 반드시 피드백 제공`;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history, topic, module, mode, captures } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const modePrompt = MODE_PROMPTS[mode as string] ?? MODE_PROMPTS.normal;

    let contextInfo = "";
    if (topic) {
      contextInfo += `\n\n[현재 학습 토픽: ${topic}${module ? ` (${module} 모듈)` : ""}]`;
    }
    if (captures && Array.isArray(captures) && captures.length > 0) {
      contextInfo += `\n\n[오늘 학생이 캡처한 학습 내용 ${captures.length}개]\n${captures.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}`;
      contextInfo += `\n\n위 캡처 내용을 참고하여 학생의 현재 학습 맥락에 맞게 답변하세요.`;
    }

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + modePrompt + contextInfo },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.coachEvaluate,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    let content = completion.choices[0].message.content ?? "답변을 생성하지 못했습니다.";

    // 용어 자동 저장 (glossary 모드일 때)
    if (mode === "glossary") {
      try {
        const metaMatch = content.match(/<!-- GLOSSARY_META: ({.*?}) -->/);
        if (metaMatch) {
          const meta = JSON.parse(metaMatch[1]);
          content = content.replace(/\n*<!-- GLOSSARY_META:.*?-->\n*/g, "").trim();

          await supabase.from("glossary_terms").upsert(
            {
              user_id: user.id,
              term: meta.term,
              module: module || null,
              definition: content,
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

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Tutor chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}

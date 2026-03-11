import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FEYNMAN_SYSTEM_PROMPT } from "@/lib/prompts/deep-check";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { action, concept, explanation, module, topic, previousFeedback } =
    await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    if (action === "select_concept") {
      return Response.json({ concept: topic || "오늘의 핵심 개념" });
    }
    return Response.json({
      content:
        "API 키를 설정하면 파인만 모드 피드백을 받을 수 있습니다.",
    });
  }

  if (action === "select_concept") {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      system:
        "오늘 학습 주제에서 파인만 학습법으로 설명 연습하기 좋은 핵심 개념 1개를 선정하세요. 개념 이름만 간단히 답변하세요. 한국어로.",
      messages: [
        { role: "user", content: `모듈: ${module}, 주제: ${topic}` },
      ],
    });
    const text =
      msg.content[0].type === "text" ? msg.content[0].text : topic;
    return Response.json({ concept: text.trim() });
  }

  // Evaluate explanation
  const messages: Anthropic.MessageParam[] = [];
  if (previousFeedback) {
    messages.push({ role: "assistant", content: previousFeedback });
    messages.push({
      role: "user",
      content: `수정된 설명:\n\n${explanation}`,
    });
  } else {
    messages.push({
      role: "user",
      content: `개념: ${concept}\n\n학습자의 설명:\n\n${explanation}\n\n이 설명을 파인만 학습법 관점에서 평가해주세요.`,
    });
  }

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: FEYNMAN_SYSTEM_PROMPT,
    messages,
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return Response.json({ content: text });
}

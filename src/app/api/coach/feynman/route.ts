import { NextRequest } from "next/server";
import OpenAI from "openai";
import { FEYNMAN_SYSTEM_PROMPT } from "@/lib/prompts/deep-check";
import { AI_MODELS, getOpenAI } from "@/lib/ai/models";

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const { action, concept, explanation, module, topic, previousFeedback } =
    await request.json();

  if (!process.env.OPENAI_API_KEY) {
    if (action === "select_concept") {
      return Response.json({ concept: topic || "오늘의 핵심 개념" });
    }
    return Response.json({
      content:
        "API 키를 설정하면 파인만 모드 피드백을 받을 수 있습니다.",
    });
  }

  if (action === "select_concept") {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.feynmanConcept,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content:
            "오늘 학습 주제에서 파인만 학습법으로 설명 연습하기 좋은 핵심 개념 1개를 선정하세요. 개념 이름만 간단히 답변하세요. 한국어로.",
        },
        { role: "user", content: `모듈: ${module}, 주제: ${topic}` },
      ],
    });
    const text = completion.choices[0].message.content ?? topic;
    return Response.json({ concept: text.trim() });
  }

  // Evaluate explanation
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: FEYNMAN_SYSTEM_PROMPT },
  ];
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

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.feynmanEvaluate,
    max_tokens: 1024,
    messages,
  });

  const text = completion.choices[0].message.content ?? "";
  return Response.json({ content: text });
}

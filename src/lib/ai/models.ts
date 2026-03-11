// Centralized AI model configuration for cost optimization
// gpt-4o-mini: ~$0.15/1M input, $0.60/1M output (cheap, fast)
// gpt-4o: ~$2.50/1M input, $10/1M output (capable, expensive)

export const AI_MODELS = {
  // Simple classification & tagging — cheap model is sufficient
  captureClassify: "gpt-4o-mini",

  // Daily brief generation — simple structured output
  dailyBrief: "gpt-4o-mini",

  // WIN card extraction — simple analysis
  winCards: "gpt-4o-mini",

  // AI coaching check-in — needs deep understanding for Socratic questions
  coachCheckin: "gpt-4o",

  // Answer evaluation — needs nuanced judgment
  coachEvaluate: "gpt-4o",

  // Reflection generation — moderate complexity
  coachReflection: "gpt-4o-mini",

  // Feynman mode — needs deep analysis of explanations
  feynmanConcept: "gpt-4o-mini", // concept selection is simple
  feynmanEvaluate: "gpt-4o", // evaluation needs depth

  // Blank recall analysis — needs careful comparison
  blankRecall: "gpt-4o",

  // Quest briefing — needs structured breakdown with examples
  questBriefing: "gpt-4o",

  // Quest hints — level 1-2 cheap, level 3 needs more capability
  questHintBasic: "gpt-4o-mini", // level 1-2
  questHintAdvanced: "gpt-4o", // level 3

  // Mindmap analysis — needs deep understanding of concept relationships
  mindmapAnalyze: "gpt-4o",
  mindmapGenerate: "gpt-4o-mini",

  // Knowledge graph — relationship analysis between concepts
  graphBuild: "gpt-4o-mini",
} as const;

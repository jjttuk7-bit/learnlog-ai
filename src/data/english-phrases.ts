export interface Phrase {
  korean: string;
  english: string[];
  example: string;
}

export interface PhraseCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  phrases: Phrase[];
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    id: "greeting",
    title: "자기소개 & 첫 만남",
    icon: "👋",
    color: "blue",
    phrases: [
      {
        korean: "자기소개할 때",
        english: [
          "Hi, I'm [name]. I'm from Korea.",
          "I'm currently studying AI and machine learning.",
          "I don't have a CS background, but I'm really passionate about AI.",
        ],
        example: "A: Hi, I'm Minho. I'm studying AI at AIFFEL in Korea.\nB: Nice to meet you! What got you into AI?",
      },
      {
        korean: "상대방에게 관심 보일 때",
        english: [
          "What are you studying?",
          "What year are you in?",
          "Have you worked on any AI projects?",
        ],
        example: "A: So what are you majoring in?\nB: I'm a junior studying computer science at UCLA.",
      },
      {
        korean: "배경 설명할 때",
        english: [
          "I'm a career changer — I used to work in [field].",
          "I've been learning AI for about [N] months now.",
          "This is my first time studying abroad like this.",
        ],
        example: "A: How long have you been coding?\nB: I actually started just 3 months ago. I'm a complete beginner!",
      },
    ],
  },
  {
    id: "daily",
    title: "일상 대화",
    icon: "☕",
    color: "amber",
    phrases: [
      {
        korean: "식사/카페에서",
        english: [
          "Want to grab lunch together?",
          "What do you feel like eating?",
          "I'll have the same thing.",
        ],
        example: "A: Hey, want to grab some coffee before class?\nB: Sure! I heard there's a good cafe nearby.",
      },
      {
        korean: "일정 조율할 때",
        english: [
          "When are you free today?",
          "Should we meet after the session?",
          "Let me check my schedule.",
        ],
        example: "A: When should we work on the project?\nB: How about after dinner, around 7?",
      },
      {
        korean: "감사/부탁할 때",
        english: [
          "Thanks for helping me with that!",
          "Could you explain that one more time?",
          "Sorry, I didn't catch that. Could you say it again?",
        ],
        example: "A: Could you slow down a bit? My English isn't great.\nB: Of course! No problem at all.",
      },
    ],
  },
  {
    id: "technical",
    title: "기술 토론",
    icon: "💻",
    color: "emerald",
    phrases: [
      {
        korean: "코드 설명할 때",
        english: [
          "This function takes [X] as input and returns [Y].",
          "Here, we're iterating over the dataset.",
          "This line preprocesses the data before feeding it to the model.",
        ],
        example: "A: Can you walk me through your code?\nB: Sure. So first, we load the dataset, then we split it into training and test sets.",
      },
      {
        korean: "모델 성능 이야기할 때",
        english: [
          "Our model achieved [N]% accuracy on the test set.",
          "The loss is still decreasing, so it hasn't converged yet.",
          "I think the model is overfitting — the training accuracy is much higher than validation.",
        ],
        example: "A: How's your model performing?\nB: The accuracy is around 85%, but I think we can improve it with more data augmentation.",
      },
      {
        korean: "에러/문제 논의할 때",
        english: [
          "I'm getting a shape mismatch error.",
          "The model keeps crashing during training.",
          "Have you tried adjusting the learning rate?",
        ],
        example: "A: I keep getting a CUDA out of memory error.\nB: Try reducing the batch size. That usually helps.",
      },
      {
        korean: "아이디어 제안할 때",
        english: [
          "What if we try a different approach?",
          "I think we could use transfer learning here.",
          "How about we start with a simpler model first?",
        ],
        example: "A: I'm stuck on this problem.\nB: What if we use a pre-trained model instead of training from scratch?",
      },
    ],
  },
  {
    id: "jeju",
    title: "제주도 프로그램 특화",
    icon: "🏝️",
    color: "purple",
    phrases: [
      {
        korean: "프로젝트 소개할 때",
        english: [
          "Our project focuses on [topic].",
          "We're trying to solve [problem] using [method].",
          "The goal of our project is to [objective].",
        ],
        example: "A: Can you tell us about your project?\nB: Sure! We're building an image classifier that can detect different types of skin conditions.",
      },
      {
        korean: "팀 토론할 때",
        english: [
          "I agree with your point, and I'd like to add...",
          "That's a good idea. What about the data pipeline?",
          "I'm not sure I understand. Could you elaborate?",
        ],
        example: "A: I think we should use ResNet for this task.\nB: That makes sense. But have you considered using a lighter model for deployment?",
      },
      {
        korean: "발표할 때",
        english: [
          "Today, I'd like to present our work on [topic].",
          "As you can see in this chart, the results show that...",
          "In conclusion, our approach achieved [result].",
        ],
        example: "A: Let me walk you through our results. As you can see here, the F1 score improved by 12% after fine-tuning.",
      },
      {
        korean: "모르는 게 있을 때",
        english: [
          "Sorry, could you explain that in simpler terms?",
          "I'm not familiar with that concept. What does it mean?",
          "Could you give me an example?",
        ],
        example: "A: We used stochastic gradient descent with momentum.\nB: I've heard of SGD, but what exactly does the momentum part do?",
      },
    ],
  },
];

export const SCENARIOS = [
  { id: "first-meeting", label: "첫 만남 자기소개", emoji: "👋" },
  { id: "code-review", label: "함께 코드 리뷰", emoji: "💻" },
  { id: "lunch", label: "점심 시간 대화", emoji: "🍽️" },
  { id: "project-intro", label: "내 프로젝트 소개", emoji: "📊" },
  { id: "team-discussion", label: "팀 토론", emoji: "🗣️" },
  { id: "presentation", label: "발표 연습", emoji: "🎤" },
  { id: "asking-help", label: "도움 요청하기", emoji: "🙋" },
  { id: "free", label: "자유 대화", emoji: "💬" },
];

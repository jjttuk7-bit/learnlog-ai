export interface CurriculumDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  module: string;
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  questId?: string;
  questType?: "sub_b" | "sub_c" | "main";
  isDlthon: boolean;
}

export interface Module {
  name: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export const MODULES: Module[] = [
  { name: "아이펠 적응", startDate: "2026-03-11", endDate: "2026-03-17", totalDays: 5, difficulty: 1, description: "교육 철학, Growth Training, Computational Thinking" },
  { name: "파이썬 마스터", startDate: "2026-03-18", endDate: "2026-03-30", totalDays: 9, difficulty: 2, description: "Python 01~10, Generative Agents 논문 리딩" },
  { name: "데이터 처리·분석", startDate: "2026-03-31", endDate: "2026-04-07", totalDays: 6, difficulty: 2, description: "Pandas, Numpy, 데이터 탐색, FUNDAMENTAL, EXPLORATION, Main Quest 01" },
  { name: "딥러닝 기초", startDate: "2026-04-08", endDate: "2026-04-14", totalDays: 5, difficulty: 3, description: "PyTorch 튜토리얼, 신경망 교재 1~4" },
  { name: "CV 기초", startDate: "2026-04-15", endDate: "2026-04-21", totalDays: 5, difficulty: 3, description: "Computer Vision 교재 8, EXPLORATION 03~04" },
  { name: "DLthon 1", startDate: "2026-04-22", endDate: "2026-04-27", totalDays: 4, difficulty: 4, description: "딥러닝 해커톤, Main Quest 02" },
  { name: "자연어처리 기초", startDate: "2026-04-28", endDate: "2026-05-07", totalDays: 5, difficulty: 3, description: "NLP 교재 5~6, Attention, System Design 실습" },
  { name: "LLM 기초", startDate: "2026-05-08", endDate: "2026-05-15", totalDays: 6, difficulty: 4, description: "교재 7, Transformer, Augmentation, Main Quest 03" },
  { name: "LLM 활용", startDate: "2026-05-18", endDate: "2026-06-01", totalDays: 10, difficulty: 5, description: "LangChain, RAG 기초·고급·평가, Function Calling, Agent, LangGraph" },
  { name: "DLthon 2", startDate: "2026-06-02", endDate: "2026-06-08", totalDays: 4, difficulty: 4, description: "LLM 해커톤, Main Quest 04" },
  { name: "모델 배포 기초", startDate: "2026-06-09", endDate: "2026-06-18", totalDays: 8, difficulty: 3, description: "FastAPI, Streamlit, RESTful API, 인증·권한" },
  { name: "MLOps", startDate: "2026-06-19", endDate: "2026-07-06", totalDays: 12, difficulty: 5, description: "Docker, GCP, Airflow, 파이프라인, Main Quest 05" },
  { name: "파이널 프로젝트", startDate: "2026-07-07", endDate: "2026-09-10", totalDays: 40, difficulty: 5, description: "AIFFELthon 01~31, End-to-End AI 시스템 구축" },
];

// Generate all weekdays (Mon-Fri) between start and end dates
function generateWeekdays(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      // Skip weekends
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Topic mapping per module and relative day
function getTopicForDay(module: string, date: string): string {
  const topics: Record<string, string[]> = {
    "아이펠 적응": [
      "교육 OT, 아이펠 시스템 소개",
      "Growth Training, 팀 빌딩",
      "Computational Thinking 기초",
      "CT 실습 + 문제 해결 전략",
      "아이펠 적응 마무리, 학습 방법론",
    ],
    "파이썬 마스터": [
      "Python 01: 변수, 자료형, 연산자",
      "Python 02: 조건문, 반복문",
      "Python 03: 함수, 모듈",
      "Python 04: 자료구조 (리스트, 딕셔너리)",
      "Python 05: 파일 입출력, 예외처리",
      "Python 06: 클래스와 객체지향",
      "Python 07~08: 고급 문법 (데코레이터, 제너레이터)",
      "Python 09~10: 종합 실습",
      "Generative Agents 논문 리딩",
    ],
    "데이터 처리·분석": [
      "FUNDAMENTAL 01: Pandas 기초",
      "FUNDAMENTAL 02: Numpy 기초",
      "EXPLORATION 01: 데이터 탐색 실습",
      "EXPLORATION 02: 데이터 시각화",
      "Sub Quest B 01~03",
      "Main Quest 01: 데이터 분석 종합",
    ],
    "딥러닝 기초": [
      "PyTorch 튜토리얼 기초",
      "신경망 교재 1: 퍼셉트론과 활성화 함수",
      "신경망 교재 2: 순전파와 역전파",
      "신경망 교재 3: 최적화 (SGD, Adam)",
      "신경망 교재 4: 실습 + Sub Quest",
    ],
    "CV 기초": [
      "Computer Vision 교재 8: CNN 기초",
      "CNN 아키텍처 (LeNet, AlexNet, VGG)",
      "EXPLORATION 03: 이미지 분류 실습",
      "EXPLORATION 04: OpenCV 활용",
      "CV 기초 마무리 + Sub Quest",
    ],
    "DLthon 1": [
      "DLthon 1 팀 빌딩 + 주제 선정",
      "DLthon 1 모델 개발",
      "DLthon 1 성능 최적화",
      "Main Quest 02: DLthon 1 발표 + 제출",
    ],
    "자연어처리 기초": [
      "NLP 교재 5: 텍스트 전처리, 토큰화",
      "NLP 교재 6: 워드 임베딩 (Word2Vec)",
      "Attention 메커니즘 이해",
      "Seq2Seq 모델 구현",
      "System Design 실습 + Sub Quest",
    ],
    "LLM 기초": [
      "교재 7: 언어 모델 기초",
      "Transformer 아키텍처 이해",
      "Transformer 구현 실습",
      "Data Augmentation 기법",
      "GPT 구조 분석",
      "Main Quest 03: LLM 기초 종합",
    ],
    "LLM 활용": [
      "LangChain 기초 + 체인 구성",
      "RAG 기초: 문서 로딩 + 임베딩",
      "RAG 고급: 검색 최적화",
      "RAG 평가 (RAGAS, 자동 평가)",
      "Fine-tuning 기초 (LoRA, QLoRA)",
      "RLHF 개념과 실습",
      "Function Calling 구현",
      "AI Agent 설계 패턴",
      "LangGraph 기초",
      "LangGraph 고급 + Sub Quest",
    ],
    "DLthon 2": [
      "DLthon 2 팀 빌딩 + LLM 주제 선정",
      "DLthon 2 LLM 앱 개발",
      "DLthon 2 테스트 + 최적화",
      "Main Quest 04: DLthon 2 발표 + 제출",
    ],
    "모델 배포 기초": [
      "FastAPI 기초: 라우팅, 요청/응답",
      "FastAPI 중급: 비동기, 미들웨어",
      "Streamlit 대시보드 구축",
      "RESTful API 설계 원칙",
      "인증·권한 (JWT, OAuth)",
      "모델 서빙 (TorchServe, Triton)",
      "API 테스트 + 문서화",
      "배포 기초 마무리 + Sub Quest",
    ],
    MLOps: [
      "Docker 기초: 컨테이너, 이미지",
      "Docker 실습: Dockerfile, Compose",
      "GCP 기초: Compute Engine, Storage",
      "GCP 실습: Cloud Run 배포",
      "Airflow 기초: DAG, 오퍼레이터",
      "Airflow 실습: ML 파이프라인 구축",
      "CI/CD 파이프라인 (GitHub Actions)",
      "모델 모니터링 + 드리프트 감지",
      "MLflow 실험 추적",
      "종합 파이프라인 구축 실습 1",
      "종합 파이프라인 구축 실습 2",
      "Main Quest 05: MLOps 종합",
    ],
  };

  // Find the relative day within the module
  const moduleStart = MODULES.find((m) => m.name === module);
  if (!moduleStart) return module;

  const moduleWeekdays = generateWeekdays(moduleStart.startDate, moduleStart.endDate);
  const relativeIndex = moduleWeekdays.indexOf(date);

  if (module === "파이널 프로젝트") {
    if (relativeIndex === 0) return "AIFFELthon 킥오프 + 팀 빌딩";
    if (relativeIndex <= 5) return `AIFFELthon 기획 + 설계 (${relativeIndex}/5)`;
    if (relativeIndex <= 20) return `AIFFELthon 개발 Sprint ${Math.ceil((relativeIndex - 5) / 5)}`;
    if (relativeIndex <= 30) return "AIFFELthon 통합 테스트 + 최적화";
    if (relativeIndex <= 38) return "AIFFELthon 발표 준비 + 문서화";
    return "AIFFELthon 최종 발표";
  }

  const moduleTopics = topics[module];
  if (!moduleTopics || relativeIndex < 0 || relativeIndex >= moduleTopics.length) {
    return `${module} Day ${relativeIndex + 1}`;
  }
  return moduleTopics[relativeIndex];
}

// Quest assignment
function getQuestForDay(_module: string, dayNumber: number): string | undefined {
  const questMap: Record<number, string> = {
    // 데이터 처리·분석
    15: "SQ_B_01",
    16: "SQ_B_02",
    17: "SQ_B_03",
    18: "MQ_01",
    // 딥러닝 기초
    24: "SQ_B_04",
    25: "SQ_C_01",
    // CV 기초
    29: "SQ_C_02",
    30: "SQ_B_05",
    // DLthon 1
    34: "MQ_02",
    // 자연어처리 기초
    39: "SQ_C_03",
    // LLM 기초
    45: "SQ_C_04",
    46: "MQ_03",
    // LLM 활용
    50: "SQ_C_05",
    51: "SQ_C_06",
    52: "SQ_C_07",
    53: "SQ_C_08",
    54: "SQ_C_09",
    55: "SQ_C_10",
    56: "SQ_C_11",
    // DLthon 2
    60: "MQ_04",
    // 모델 배포 기초
    64: "SQ_B_06",
    65: "SQ_C_12",
    66: "SQ_C_13",
    67: "SQ_B_07",
    68: "SQ_C_14",
    // MLOps
    73: "SQ_B_08",
    74: "SQ_C_15",
    75: "SQ_C_16",
    76: "SQ_B_09",
    77: "SQ_C_17",
    78: "SQ_C_18",
    79: "SQ_C_19",
    80: "SQ_B_10",
    81: "MQ_05",
  };
  return questMap[dayNumber];
}

function getQuestType(_module: string, dayNumber: number): "sub_b" | "sub_c" | "main" | undefined {
  const questId = getQuestForDay(_module, dayNumber);
  if (!questId) return undefined;
  if (questId.startsWith("MQ")) return "main";
  if (questId.startsWith("SQ_B")) return "sub_b";
  if (questId.startsWith("SQ_C")) return "sub_c";
  return undefined;
}

// Build the 119-day curriculum by distributing weekdays across modules
function buildCurriculum(): CurriculumDay[] {
  const curriculum: CurriculumDay[] = [];
  let dayIndex = 0;

  for (const mod of MODULES) {
    const moduleWeekdays = generateWeekdays(mod.startDate, mod.endDate);
    for (const date of moduleWeekdays) {
      if (dayIndex >= 119) break;
      dayIndex++;
      curriculum.push({
        dayNumber: dayIndex,
        date,
        module: mod.name,
        topic: getTopicForDay(mod.name, date),
        difficulty: mod.difficulty,
        questId: getQuestForDay(mod.name, dayIndex),
        questType: getQuestType(mod.name, dayIndex),
        isDlthon: mod.name.startsWith("DLthon"),
      });
    }
  }

  return curriculum;
}

export const CURRICULUM: CurriculumDay[] = buildCurriculum();

// Total stats
export const TOTAL_DAYS = 119;
export const TOTAL_HOURS = 833; // 119 * 7
export const COURSE_START = "2026-03-11";
export const COURSE_END = "2026-09-10";

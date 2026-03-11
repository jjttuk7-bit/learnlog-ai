export interface Quest {
  id: string;
  type: "sub_b" | "sub_c" | "main";
  title: string;
  module: string;
  description: string;
  aiStrategy: string;
}

export const QUESTS: Quest[] = [
  // Sub Quest B (14개) - 개념 브리핑 + 1~2차 힌트 중심
  { id: "SQ_B_01", type: "sub_b", title: "Pandas 데이터 조작", module: "데이터 처리·분석", description: "Pandas DataFrame 기본 조작 실습", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_02", type: "sub_b", title: "Numpy 배열 연산", module: "데이터 처리·분석", description: "Numpy 배열 생성과 연산 실습", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_03", type: "sub_b", title: "데이터 시각화 기초", module: "데이터 처리·분석", description: "Matplotlib, Seaborn 시각화 실습", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_04", type: "sub_b", title: "PyTorch 텐서 기초", module: "딥러닝 기초", description: "텐서 생성, 연산, 자동미분", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_05", type: "sub_b", title: "이미지 전처리", module: "CV 기초", description: "OpenCV 이미지 로딩, 변환, 필터", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_06", type: "sub_b", title: "FastAPI 라우팅", module: "모델 배포 기초", description: "FastAPI 기본 라우트 구현", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_07", type: "sub_b", title: "API 인증 구현", module: "모델 배포 기초", description: "JWT 기반 인증 시스템", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_08", type: "sub_b", title: "Docker 기초 실습", module: "MLOps", description: "Dockerfile 작성과 이미지 빌드", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_09", type: "sub_b", title: "GCP 기초 배포", module: "MLOps", description: "Cloud Run 기본 배포", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_10", type: "sub_b", title: "MLflow 실험 추적", module: "MLOps", description: "MLflow로 실험 로깅과 비교", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_11", type: "sub_b", title: "Python 함수 실습", module: "파이썬 마스터", description: "함수 정의, 인자, 반환값", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_12", type: "sub_b", title: "클래스 설계", module: "파이썬 마스터", description: "OOP 기초 클래스 구현", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_13", type: "sub_b", title: "텍스트 전처리", module: "자연어처리 기초", description: "토큰화, 정규화, 불용어 처리", aiStrategy: "개념 브리핑 + 1~2차 힌트" },
  { id: "SQ_B_14", type: "sub_b", title: "Streamlit 대시보드", module: "모델 배포 기초", description: "Streamlit으로 간단한 ML 대시보드", aiStrategy: "개념 브리핑 + 1~2차 힌트" },

  // Sub Quest C (19개) - 전체 3단계 힌트 + 코드 예시
  { id: "SQ_C_01", type: "sub_c", title: "신경망 구현", module: "딥러닝 기초", description: "PyTorch로 기본 신경망 구현", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_02", type: "sub_c", title: "CNN 이미지 분류", module: "CV 기초", description: "CNN으로 이미지 분류 모델 구현", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_03", type: "sub_c", title: "Seq2Seq 구현", module: "자연어처리 기초", description: "Seq2Seq 모델 구현과 학습", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_04", type: "sub_c", title: "Transformer 구현", module: "LLM 기초", description: "Transformer 아키텍처 직접 구현", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_05", type: "sub_c", title: "LangChain 체인 구성", module: "LLM 활용", description: "LangChain으로 프롬프트 체인 구성", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_06", type: "sub_c", title: "RAG 기초 구현", module: "LLM 활용", description: "문서 기반 RAG 시스템 구축", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_07", type: "sub_c", title: "RAG 고급 최적화", module: "LLM 활용", description: "RAG 검색 최적화와 리랭킹", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_08", type: "sub_c", title: "RAG 평가", module: "LLM 활용", description: "RAGAS 기반 RAG 시스템 평가", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_09", type: "sub_c", title: "Fine-tuning 실습", module: "LLM 활용", description: "LoRA/QLoRA 파인튜닝 실습", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_10", type: "sub_c", title: "Function Calling", module: "LLM 활용", description: "LLM Function Calling 구현", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_11", type: "sub_c", title: "AI Agent 구현", module: "LLM 활용", description: "LangGraph 기반 AI Agent", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_12", type: "sub_c", title: "FastAPI 모델 서빙", module: "모델 배포 기초", description: "FastAPI로 ML 모델 API 구축", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_13", type: "sub_c", title: "RESTful API 설계", module: "모델 배포 기초", description: "REST 원칙 준수 API 설계", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_14", type: "sub_c", title: "배포 자동화", module: "모델 배포 기초", description: "CI/CD 파이프라인 구축", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_15", type: "sub_c", title: "Docker Compose", module: "MLOps", description: "멀티 컨테이너 서비스 구성", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_16", type: "sub_c", title: "GCP 고급 배포", module: "MLOps", description: "GKE 기반 스케일링 배포", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_17", type: "sub_c", title: "Airflow DAG", module: "MLOps", description: "Airflow로 ML 파이프라인 DAG 작성", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_18", type: "sub_c", title: "모델 모니터링", module: "MLOps", description: "모델 성능 모니터링 시스템 구축", aiStrategy: "3단계 힌트 + 코드 예시" },
  { id: "SQ_C_19", type: "sub_c", title: "종합 파이프라인", module: "MLOps", description: "End-to-End ML 파이프라인 구축", aiStrategy: "3단계 힌트 + 코드 예시" },

  // Main Quest (5개) - 집중 브리핑 + 심층 회고 + 포트폴리오
  { id: "MQ_01", type: "main", title: "데이터 분석 종합 프로젝트", module: "데이터 처리·분석", description: "Pandas/Numpy 활용 데이터 분석 종합 과제", aiStrategy: "집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록" },
  { id: "MQ_02", type: "main", title: "DLthon 1 딥러닝 해커톤", module: "DLthon 1", description: "딥러닝 모델 설계·구현·발표", aiStrategy: "집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록" },
  { id: "MQ_03", type: "main", title: "LLM 기초 종합", module: "LLM 기초", description: "Transformer/GPT 구현 종합 과제", aiStrategy: "집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록" },
  { id: "MQ_04", type: "main", title: "DLthon 2 LLM 해커톤", module: "DLthon 2", description: "LLM 활용 앱 설계·구현·발표", aiStrategy: "집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록" },
  { id: "MQ_05", type: "main", title: "MLOps 종합 프로젝트", module: "MLOps", description: "End-to-End MLOps 파이프라인 구축", aiStrategy: "집중 브리핑 + 심층 회고 + 포트폴리오 자동 기록" },
];

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

export function getQuestsByModule(module: string): Quest[] {
  return QUESTS.filter((q) => q.module === module);
}

export function getQuestsByType(type: "sub_b" | "sub_c" | "main"): Quest[] {
  return QUESTS.filter((q) => q.type === type);
}

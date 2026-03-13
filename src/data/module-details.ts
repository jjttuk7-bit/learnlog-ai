// 각 모듈별 상세 정보 (진도 폴더의 커리큘럼 문서에서 추출)

export interface ModuleDetail {
  name: string;
  objectives: string[];
  tools: string[];
  practiceProjects: string[];
  keyConceptTable?: { area: string; content: string }[];
  evaluationCriteria?: string[];
  teamRoles?: string[];
  sprintPlan?: { sprint: string; tasks: string; deliverables: string }[];
}

export const MODULE_DETAILS: Record<string, ModuleDetail> = {
  "아이펠 적응": {
    name: "아이펠 적응",
    objectives: [
      "교육 시스템과 학습 방식 이해",
      "개발 환경 세팅 완료 (Python, Jupyter, VS Code)",
      "Git/GitHub 기초 협업 가능",
      "클라우드 환경 (Colab, GPU 서버) 접근",
      "Python 기초 역량 점검",
    ],
    tools: ["Python 3.10+", "Anaconda", "Jupyter Notebook", "VS Code", "Git", "GitHub", "Google Colab", "SSH"],
    practiceProjects: ["Python 기초 코딩 테스트 (FizzBuzz, 중복 제거, 단어 빈도)", "팀 빌딩 + 자기소개"],
    keyConceptTable: [
      { area: "자료형", content: "int, float, str, list, dict, tuple, set" },
      { area: "제어문", content: "if/elif/else, for, while, break/continue" },
      { area: "함수", content: "def, return, *args, **kwargs, lambda" },
      { area: "OOP", content: "class, __init__, self, 상속, 메서드" },
      { area: "컴프리헨션", content: "list/dict comprehension" },
      { area: "파일 I/O", content: "open(), read(), write(), csv, json" },
    ],
  },

  "파이썬 마스터": {
    name: "파이썬 마스터",
    objectives: [
      "Python 전체 문법 마스터",
      "객체지향 프로그래밍 활용",
      "고급 문법 (데코레이터, 제너레이터) 이해",
      "논문 리딩 역량 기초",
    ],
    tools: ["Python", "unittest", "Jupyter Notebook"],
    practiceProjects: ["Python 종합 실습 프로젝트", "Generative Agents 논문 분석"],
  },

  "데이터 처리·분석": {
    name: "데이터 처리·분석",
    objectives: [
      "Pandas/NumPy 기반 데이터 처리 능력",
      "EDA (탐색적 데이터 분석) 수행 능력",
      "데이터 시각화 (Matplotlib, Seaborn)",
      "Feature Engineering 기초",
      "전처리 파이프라인 설계 (정규화, 인코딩, 분할)",
    ],
    tools: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn"],
    practiceProjects: ["EDA 실습", "데이터 시각화", "데이터 분석 종합 (Main Quest 01)"],
    keyConceptTable: [
      { area: "데이터 수집", content: "Pandas, API, 크롤링" },
      { area: "EDA", content: "분포, 상관관계, 이상치 탐색" },
      { area: "클리닝", content: "결측치, 중복, 이상치 처리" },
      { area: "Feature Engineering", content: "신규 변수 생성, 변수 선택" },
      { area: "전처리", content: "정규화, 인코딩, Train/Val/Test 분할" },
    ],
  },

  "딥러닝 기초": {
    name: "딥러닝 기초",
    objectives: [
      "퍼셉트론과 MLP 구조 이해",
      "활성화 함수 (Sigmoid, ReLU, Softmax) 이해",
      "손실 함수 (MSE, Cross-Entropy) 이해",
      "역전파와 경사하강법 이해",
      "PyTorch 기반 학습 루프 구현",
      "과적합 방지 기법 (Dropout, 정규화, Early Stopping)",
    ],
    tools: ["PyTorch", "NumPy", "Matplotlib"],
    practiceProjects: ["MNIST 손글씨 분류", "Fashion-MNIST 분류", "회귀 실습 (California Housing)"],
  },

  "CV 기초": {
    name: "CV 기초",
    objectives: [
      "이미지 데이터 전처리 (resize, 정규화, augmentation)",
      "CNN 아키텍처 이해 (Conv → ReLU → Pool → FC)",
      "전이학습 (Transfer Learning) 활용",
      "CV 주요 태스크 이해 (분류, 검출, 분할)",
    ],
    tools: ["PyTorch", "OpenCV", "torchvision", "PIL"],
    practiceProjects: ["이미지 분류 실습", "OpenCV 활용 실습", "전이학습 (ImageNet pretrained)"],
    keyConceptTable: [
      { area: "LeNet-5 (1998)", content: "Conv + Pooling 기초, CNN의 시작" },
      { area: "AlexNet (2012)", content: "ReLU, Dropout, GPU 학습 → 딥러닝 붐" },
      { area: "VGGNet (2014)", content: "3×3 작은 필터, 깊은 구조" },
      { area: "GoogLeNet (2014)", content: "Inception 모듈 (병렬 필터)" },
      { area: "ResNet (2015)", content: "Skip Connection → 100+ 층 가능" },
      { area: "EfficientNet (2019)", content: "Width/Depth/Resolution 스케일링" },
    ],
  },

  "DLthon 1": {
    name: "DLthon 1",
    objectives: [
      "모듈 1~4 종합 적용",
      "팀 기반 딥러닝 프로젝트 수행",
      "모델 실험 및 성능 최적화",
    ],
    tools: ["PyTorch", "ResNet", "EfficientNet", "ConvNeXt", "CosineAnnealing", "StepLR"],
    practiceProjects: ["이미지 분류 또는 구조화된 데이터 예측 경진대회"],
    evaluationCriteria: ["Accuracy", "F1 Score", "코드 품질", "Public/Private 리더보드"],
    teamRoles: ["데이터 담당", "모델링 담당", "인프라/실험 관리 담당"],
  },

  "자연어처리 기초": {
    name: "자연어처리 기초",
    objectives: [
      "텍스트 전처리 (토큰화, 불용어 제거, 정규화)",
      "텍스트 표현 (BoW, TF-IDF, Word Embedding)",
      "RNN/LSTM/GRU 시퀀스 모델 이해",
      "Attention 메커니즘과 Transformer 구조 이해",
    ],
    tools: ["PyTorch", "KoNLPy (Okt, Mecab)", "Word2Vec", "GloVe", "FastText"],
    practiceProjects: ["감성 분석 (NSMC 데이터셋)", "뉴스 분류", "간단한 영한 번역 모델"],
  },

  "LLM 기초": {
    name: "LLM 기초",
    objectives: [
      "BERT vs GPT 아키텍처 차이 이해",
      "사전학습 → Fine-tuning → RLHF 학습 과정",
      "토크나이저 (BPE, SentencePiece) 이해",
      "효율적 Fine-tuning (LoRA, QLoRA)",
      "Hugging Face 생태계 활용",
    ],
    tools: ["Hugging Face Transformers", "Datasets", "PEFT", "KoBERT", "klue/bert-base", "GPT-2"],
    practiceProjects: ["BERT 감성 분류 (KoBERT)", "GPT-2 텍스트 생성", "LoRA Fine-tuning (LLaMA/Mistral)"],
  },

  "LLM 활용": {
    name: "LLM 활용",
    objectives: [
      "프롬프트 엔지니어링 (Zero-shot, Few-shot, CoT)",
      "RAG 파이프라인 구축 (문서 청킹, 임베딩, 검색)",
      "LangChain/LlamaIndex 프레임워크 활용",
      "API 활용 (OpenAI, Anthropic, Gemini)",
      "AI Agent 설계 및 구현",
    ],
    tools: ["LangChain", "LlamaIndex", "LangGraph", "ChromaDB", "FAISS", "Pinecone", "OpenAI API", "Anthropic API"],
    practiceProjects: ["PDF Q&A 챗봇 (RAG 파이프라인)", "내부 문서 검색 서비스", "AI Agent (검색, 계산, 코드 실행 도구)"],
  },

  "DLthon 2": {
    name: "DLthon 2",
    objectives: [
      "모듈 1~8 종합 적용 (NLP + LLM 포함)",
      "코드 품질, 실험 관리, 팀 협업, 발표 능력",
    ],
    tools: ["BERT", "RoBERTa", "DeBERTa", "LLaMA", "Mistral", "KoBERT", "KoELECTRA", "KoGPT", "KULLM", "MLflow", "W&B"],
    practiceProjects: ["NLU 과제 (뉴스 요약, 문서 유사도, QA)", "멀티모달 과제", "RAG 시스템 정확도 경진대회", "자동 리포트 생성"],
    evaluationCriteria: ["코드 품질", "실험 관리", "팀 협업", "발표 능력"],
    teamRoles: ["Data Engineer", "Model Researcher", "Engineering (인프라/하이퍼파라미터)", "분석/발표"],
  },

  "모델 배포 기초": {
    name: "모델 배포 기초",
    objectives: [
      "FastAPI로 모델 서빙 API 구축",
      "Docker 컨테이너화",
      "클라우드 배포 (AWS EC2, Lambda, SageMaker)",
      "모델 최적화 (ONNX, 양자화)",
      "데모 앱 구축 (Streamlit, Gradio)",
    ],
    tools: ["FastAPI", "Docker", "Docker Compose", "Streamlit", "Gradio", "ONNX", "AWS", "TorchServe"],
    practiceProjects: ["FastAPI 모델 서빙", "Docker 컨테이너 배포", "Streamlit 대시보드", "Gradio 데모 앱"],
  },

  MLOps: {
    name: "MLOps",
    objectives: [
      "CI/CD 파이프라인 구축 (GitHub Actions)",
      "실험 추적 (MLflow, W&B)",
      "데이터 버전 관리 (DVC)",
      "모델 모니터링 (Data Drift, Model Drift)",
      "자동 재학습 파이프라인 설계",
    ],
    tools: ["Docker", "GCP", "Airflow", "GitHub Actions", "MLflow", "W&B", "DVC", "Grafana"],
    practiceProjects: ["CI/CD 파이프라인 구축", "MLflow 실험 추적", "종합 파이프라인 구축"],
    keyConceptTable: [
      { area: "CI/CD", content: "GitHub Actions, Jenkins — 자동 학습/배포" },
      { area: "실험 추적", content: "MLflow (Model Registry), W&B (Sweep)" },
      { area: "데이터 버전", content: "DVC — Git for Data" },
      { area: "모니터링", content: "Data Drift, Model Drift 감지" },
      { area: "자동 재학습", content: "수집 → 전처리 → 학습 → 평가 → 배포" },
    ],
  },

  "파이널 프로젝트": {
    name: "파이널 프로젝트",
    objectives: [
      "End-to-End AI 서비스 구축",
      "데이터 파이프라인 + AI 모델 + Backend + Frontend + Infra",
      "4주 스프린트 기반 팀 프로젝트",
      "15~20분 최종 발표",
    ],
    tools: ["전체 모듈 기술 스택 종합"],
    practiceProjects: ["AI 고객 지원 챗봇", "제품 결함 감지", "문서 요약 서비스", "개인화 추천 시스템", "AI 이력서 분석기"],
    sprintPlan: [
      { sprint: "Sprint 1 (1주차)", tasks: "데이터 수집/전처리, 베이스라인 모델", deliverables: "클린 데이터셋, 베이스라인 성능" },
      { sprint: "Sprint 2 (2주차)", tasks: "모델 개선, 백엔드 API 개발", deliverables: "최적화 모델, API 서버" },
      { sprint: "Sprint 3 (3주차)", tasks: "프론트엔드 통합, Docker, 클라우드 배포", deliverables: "동작하는 프로토타입" },
      { sprint: "Sprint 4 (4주차)", tasks: "테스트, 버그 수정, 모니터링, 발표 준비", deliverables: "최종 서비스, 발표" },
    ],
    evaluationCriteria: ["문제 정의 (2분)", "기술 설계 (3분)", "핵심 기술 (5분)", "라이브 데모 (3분)", "결과 및 회고 (3분)", "Q&A (4분)"],
  },
};

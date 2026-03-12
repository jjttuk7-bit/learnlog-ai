// 각 토픽별 핵심 학습 포인트
export const KEY_POINTS: Record<string, { objectives: string[]; keywords: string[] }> = {
  // 아이펠 적응
  "교육 OT, 아이펠 시스템 소개": {
    objectives: ["아이펠 교육 시스템과 학습 방식 이해", "LMS 플랫폼 사용법 익히기", "6개월 커리큘럼 전체 로드맵 파악"],
    keywords: ["아이펠", "LMS", "Growth Training", "자기주도학습"],
  },
  "Growth Training, 팀 빌딩": {
    objectives: ["성장 마인드셋과 학습 전략 수립", "팀원과의 협업 방식 설정", "페어 프로그래밍 방법론 이해"],
    keywords: ["성장 마인드셋", "팀 빌딩", "페어 프로그래밍", "협업"],
  },
  "Computational Thinking 기초": {
    objectives: ["문제 분해(Decomposition) 기법 습득", "패턴 인식과 추상화 개념 이해", "알고리즘적 사고 훈련"],
    keywords: ["분해", "패턴 인식", "추상화", "알고리즘"],
  },
  "CT 실습 + 문제 해결 전략": {
    objectives: ["실제 문제에 CT 적용하기", "문제 해결 5단계 전략 습득", "코드 없이 알고리즘 설계하기"],
    keywords: ["문제 해결", "의사코드", "플로우차트", "논리적 사고"],
  },
  "아이펠 적응 마무리, 학습 방법론": {
    objectives: ["효과적인 학습 방법론 정리 (파인만, 간격 반복)", "개인 학습 루틴 설계", "메타인지 학습의 중요성 이해"],
    keywords: ["파인만 기법", "간격 반복", "메타인지", "학습 루틴"],
  },

  // 파이썬 마스터
  "Python 01: 변수, 자료형, 연산자": {
    objectives: ["Python 변수 선언과 동적 타이핑 이해", "기본 자료형 (int, float, str, bool) 활용", "산술/비교/논리 연산자 사용"],
    keywords: ["변수", "자료형", "연산자", "동적 타이핑", "형변환"],
  },
  "Python 02: 조건문, 반복문": {
    objectives: ["if/elif/else 조건 분기 작성", "for/while 반복문과 range 활용", "break, continue, else절 이해"],
    keywords: ["if문", "for문", "while문", "range", "제어문"],
  },
  "Python 03: 함수, 모듈": {
    objectives: ["함수 정의와 매개변수 (가변, 키워드)", "return과 다중 반환값", "모듈 import와 패키지 구조 이해"],
    keywords: ["def", "매개변수", "return", "import", "모듈"],
  },
  "Python 04: 자료구조 (리스트, 딕셔너리)": {
    objectives: ["리스트 슬라이싱과 컴프리헨션", "딕셔너리, 세트, 튜플 활용", "자료구조별 시간복잡도 이해"],
    keywords: ["리스트", "딕셔너리", "세트", "컴프리헨션", "시간복잡도"],
  },
  "Python 05: 파일 입출력, 예외처리": {
    objectives: ["파일 읽기/쓰기 (with문 활용)", "try/except/finally 예외처리 패턴", "커스텀 예외 클래스 정의"],
    keywords: ["open", "with", "try/except", "예외처리", "파일 I/O"],
  },
  "Python 06: 클래스와 객체지향": {
    objectives: ["클래스 정의와 인스턴스 생성", "상속, 다형성, 캡슐화 개념", "__init__, __str__ 등 매직 메서드"],
    keywords: ["class", "상속", "다형성", "캡슐화", "OOP"],
  },
  "Python 07~08: 고급 문법 (데코레이터, 제너레이터)": {
    objectives: ["데코레이터 패턴과 활용 (@wraps)", "제너레이터와 yield 이해", "이터레이터 프로토콜과 컨텍스트 매니저"],
    keywords: ["데코레이터", "제너레이터", "yield", "이터레이터", "컨텍스트 매니저"],
  },
  "Python 09~10: 종합 실습": {
    objectives: ["Python 전체 개념 종합 프로젝트", "코드 리팩토링과 클린 코드 원칙", "테스트 코드 작성 기초"],
    keywords: ["종합 실습", "리팩토링", "클린 코드", "unittest"],
  },
  "Generative Agents 논문 리딩": {
    objectives: ["Generative Agents 논문 핵심 아이디어 이해", "LLM 기반 에이전트 아키텍처 분석", "메모리, 반성, 계획 메커니즘"],
    keywords: ["Generative Agents", "LLM Agent", "메모리 스트림", "논문 리딩"],
  },

  // 데이터 처리·분석
  "FUNDAMENTAL 01: Pandas 기초": {
    objectives: ["DataFrame/Series 생성과 조작", "데이터 선택 (loc, iloc, 조건 필터링)", "groupby, merge, pivot 활용"],
    keywords: ["Pandas", "DataFrame", "loc/iloc", "groupby", "merge"],
  },
  "FUNDAMENTAL 02: Numpy 기초": {
    objectives: ["ndarray 생성과 브로드캐스팅", "배열 연산과 인덱싱/슬라이싱", "선형대수 기초 (행렬 곱, 전치)"],
    keywords: ["Numpy", "ndarray", "브로드캐스팅", "벡터화", "선형대수"],
  },
  "EXPLORATION 01: 데이터 탐색 실습": {
    objectives: ["EDA(탐색적 데이터 분석) 프로세스", "결측치/이상치 처리 전략", "상관관계 분석과 인사이트 도출"],
    keywords: ["EDA", "결측치", "이상치", "상관관계", "데이터 전처리"],
  },
  "EXPLORATION 02: 데이터 시각화": {
    objectives: ["Matplotlib/Seaborn 차트 작성", "시각화 유형별 적합한 사용 케이스", "인사이트를 전달하는 시각화 설계"],
    keywords: ["Matplotlib", "Seaborn", "시각화", "히스토그램", "산점도"],
  },
  "Sub Quest B 01~03": {
    objectives: ["데이터 분석 실전 과제 수행", "전처리→분석→시각화 파이프라인 구축", "분석 결과 보고서 작성"],
    keywords: ["Sub Quest", "데이터 파이프라인", "분석 보고서"],
  },
  "Main Quest 01: 데이터 분석 종합": {
    objectives: ["end-to-end 데이터 분석 프로젝트 완수", "데이터 수집부터 인사이트 도출까지", "발표 및 피어 리뷰"],
    keywords: ["Main Quest", "종합 프로젝트", "피어 리뷰"],
  },

  // 딥러닝 기초
  "PyTorch 튜토리얼 기초": {
    objectives: ["Tensor 생성과 연산", "autograd와 자동 미분 이해", "nn.Module로 모델 정의하기"],
    keywords: ["PyTorch", "Tensor", "autograd", "nn.Module"],
  },
  "신경망 교재 1: 퍼셉트론과 활성화 함수": {
    objectives: ["퍼셉트론의 구조와 동작 원리", "활성화 함수 종류 (ReLU, Sigmoid, Tanh)", "XOR 문제와 다층 퍼셉트론"],
    keywords: ["퍼셉트론", "활성화 함수", "ReLU", "Sigmoid", "MLP"],
  },
  "신경망 교재 2: 순전파와 역전파": {
    objectives: ["순전파(Forward Pass) 계산 과정", "역전파(Backpropagation)와 체인 룰", "그래디언트 소실/폭발 문제 이해"],
    keywords: ["순전파", "역전파", "체인 룰", "그래디언트", "손실함수"],
  },
  "신경망 교재 3: 최적화 (SGD, Adam)": {
    objectives: ["경사하강법의 변형들 (SGD, Momentum, Adam)", "학습률 스케줄링 전략", "배치 정규화와 드롭아웃"],
    keywords: ["SGD", "Adam", "학습률", "배치 정규화", "드롭아웃"],
  },
  "신경망 교재 4: 실습 + Sub Quest": {
    objectives: ["MNIST/CIFAR 분류 모델 구현", "학습 루프 작성 (train/eval)", "하이퍼파라미터 튜닝 실습"],
    keywords: ["MNIST", "학습 루프", "하이퍼파라미터", "모델 평가"],
  },

  // CV 기초
  "Computer Vision 교재 8: CNN 기초": {
    objectives: ["합성곱(Convolution) 연산 원리", "풀링, 스트라이드, 패딩 개념", "Feature Map과 수용 영역(Receptive Field)"],
    keywords: ["CNN", "합성곱", "풀링", "Feature Map", "수용 영역"],
  },
  "CNN 아키텍처 (LeNet, AlexNet, VGG)": {
    objectives: ["LeNet-5 구조와 역사적 의의", "AlexNet의 혁신 (ReLU, Dropout, GPU)", "VGG의 깊은 네트워크 설계 철학"],
    keywords: ["LeNet", "AlexNet", "VGG", "CNN 아키텍처"],
  },
  "EXPLORATION 03: 이미지 분류 실습": {
    objectives: ["커스텀 데이터셋으로 이미지 분류", "데이터 증강(Augmentation) 기법 적용", "전이학습(Transfer Learning) 활용"],
    keywords: ["이미지 분류", "데이터 증강", "전이학습", "Fine-tuning"],
  },
  "EXPLORATION 04: OpenCV 활용": {
    objectives: ["OpenCV 기본 이미지 처리 (필터링, 엣지 검출)", "객체 검출 기초 (Contour, Template Matching)", "실시간 영상 처리 파이프라인"],
    keywords: ["OpenCV", "엣지 검출", "객체 검출", "영상 처리"],
  },
  "CV 기초 마무리 + Sub Quest": {
    objectives: ["CV 전체 개념 정리 및 복습", "실전 이미지 처리 과제 수행", "모델 성능 분석 및 개선"],
    keywords: ["Sub Quest", "모델 개선", "성능 분석"],
  },

  // 자연어처리 기초
  "NLP 교재 5: 텍스트 전처리, 토큰화": {
    objectives: ["텍스트 정규화와 토큰화 기법", "BPE, WordPiece, SentencePiece 비교", "한국어 형태소 분석 도구 활용"],
    keywords: ["토큰화", "BPE", "WordPiece", "형태소 분석", "전처리"],
  },
  "NLP 교재 6: 워드 임베딩 (Word2Vec)": {
    objectives: ["단어 임베딩의 개념과 필요성", "Word2Vec (CBOW, Skip-gram) 학습 원리", "임베딩 유사도와 시각화"],
    keywords: ["Word2Vec", "임베딩", "CBOW", "Skip-gram", "코사인 유사도"],
  },
  "Attention 메커니즘 이해": {
    objectives: ["Attention의 동기와 핵심 아이디어", "Query, Key, Value 개념", "Self-Attention과 Multi-Head Attention"],
    keywords: ["Attention", "Q/K/V", "Self-Attention", "Multi-Head"],
  },
  "Seq2Seq 모델 구현": {
    objectives: ["Encoder-Decoder 구조 이해", "Seq2Seq + Attention 구현", "Teacher Forcing 학습 기법"],
    keywords: ["Seq2Seq", "Encoder-Decoder", "Teacher Forcing"],
  },
  "System Design 실습 + Sub Quest": {
    objectives: ["NLP 시스템 설계 원칙", "전처리→모델→후처리 파이프라인", "실전 NLP 과제 수행"],
    keywords: ["시스템 설계", "파이프라인", "Sub Quest"],
  },

  // LLM 기초
  "교재 7: 언어 모델 기초": {
    objectives: ["언어 모델의 정의와 확률적 접근", "N-gram에서 신경망 언어 모델까지", "Perplexity 평가 지표 이해"],
    keywords: ["언어 모델", "N-gram", "Perplexity", "확률 모델"],
  },
  "Transformer 아키텍처 이해": {
    objectives: ["Transformer 전체 구조 (인코더/디코더)", "Positional Encoding의 역할", "Layer Normalization과 Residual Connection"],
    keywords: ["Transformer", "Positional Encoding", "LayerNorm", "Residual"],
  },
  "Transformer 구현 실습": {
    objectives: ["PyTorch로 Transformer 직접 구현", "Multi-Head Attention 코딩", "학습 및 추론 루프 작성"],
    keywords: ["구현 실습", "PyTorch", "Attention 구현"],
  },
  "Data Augmentation 기법": {
    objectives: ["텍스트 데이터 증강 기법", "Back Translation, EDA 기법", "데이터 품질 vs 양의 트레이드오프"],
    keywords: ["데이터 증강", "Back Translation", "EDA", "오버샘플링"],
  },
  "GPT 구조 분석": {
    objectives: ["GPT-1/2/3 아키텍처 진화 과정", "Decoder-only 구조의 특징", "Scaling Law와 Emergent Ability"],
    keywords: ["GPT", "Decoder-only", "Scaling Law", "In-context Learning"],
  },
  "Main Quest 03: LLM 기초 종합": {
    objectives: ["LLM 기초 개념 종합 프로젝트", "모델 학습 및 평가 실습", "발표 및 피어 리뷰"],
    keywords: ["Main Quest", "종합 프로젝트"],
  },

  // LLM 활용
  "LangChain 기초 + 체인 구성": {
    objectives: ["LangChain 핵심 컴포넌트 이해", "PromptTemplate과 Chain 구성", "OutputParser로 구조화된 출력 생성"],
    keywords: ["LangChain", "Chain", "PromptTemplate", "OutputParser"],
  },
  "RAG 기초: 문서 로딩 + 임베딩": {
    objectives: ["RAG 아키텍처 전체 흐름 이해", "문서 로딩과 청크 분할 전략", "임베딩 모델과 벡터 스토어 구축"],
    keywords: ["RAG", "임베딩", "벡터 DB", "청킹", "문서 로딩"],
  },
  "RAG 고급: 검색 최적화": {
    objectives: ["Hybrid Search (키워드 + 시맨틱)", "Re-ranking과 검색 품질 향상", "Parent Document Retriever, Self-Query"],
    keywords: ["Hybrid Search", "Re-ranking", "검색 최적화"],
  },
  "RAG 평가 (RAGAS, 자동 평가)": {
    objectives: ["RAG 시스템 평가 프레임워크", "RAGAS 메트릭 (Faithfulness, Relevancy)", "자동 평가 파이프라인 구축"],
    keywords: ["RAGAS", "Faithfulness", "Relevancy", "평가 메트릭"],
  },
  "Fine-tuning 기초 (LoRA, QLoRA)": {
    objectives: ["Full Fine-tuning vs PEFT 비교", "LoRA의 원리 (Low-Rank Adaptation)", "QLoRA로 메모리 효율적 학습"],
    keywords: ["Fine-tuning", "LoRA", "QLoRA", "PEFT"],
  },
  "RLHF 개념과 실습": {
    objectives: ["RLHF 학습 3단계 이해", "Reward Model 학습 원리", "PPO 알고리즘과 정렬(Alignment)"],
    keywords: ["RLHF", "Reward Model", "PPO", "정렬"],
  },
  "Function Calling 구현": {
    objectives: ["Function Calling API 사용법", "함수 스키마 정의와 실행 흐름", "외부 API/도구 연동 패턴"],
    keywords: ["Function Calling", "Tool Use", "API 연동"],
  },
  "AI Agent 설계 패턴": {
    objectives: ["AI Agent의 핵심 구성요소", "ReAct, Plan-and-Execute 패턴", "도구 사용과 메모리 관리"],
    keywords: ["AI Agent", "ReAct", "Plan-and-Execute", "도구 사용"],
  },
  "LangGraph 기초": {
    objectives: ["LangGraph 그래프 기반 워크플로우", "State, Node, Edge 개념", "조건 분기와 루프 구현"],
    keywords: ["LangGraph", "State Graph", "Node", "Edge"],
  },
  "LangGraph 고급 + Sub Quest": {
    objectives: ["멀티 에이전트 시스템 구현", "Human-in-the-loop 패턴", "실전 Agent 앱 개발"],
    keywords: ["멀티 에이전트", "Human-in-the-loop", "Sub Quest"],
  },

  // 모델 배포 기초
  "FastAPI 기초: 라우팅, 요청/응답": {
    objectives: ["FastAPI 프로젝트 구조 설계", "Path/Query Parameter와 Request Body", "Pydantic 모델로 데이터 검증"],
    keywords: ["FastAPI", "라우팅", "Pydantic", "요청/응답"],
  },
  "FastAPI 중급: 비동기, 미들웨어": {
    objectives: ["async/await 비동기 엔드포인트", "미들웨어와 의존성 주입", "에러 핸들링과 로깅"],
    keywords: ["비동기", "미들웨어", "의존성 주입", "에러 핸들링"],
  },
  "Streamlit 대시보드 구축": {
    objectives: ["Streamlit 컴포넌트와 레이아웃", "인터랙티브 데이터 시각화", "ML 모델 데모 앱 구축"],
    keywords: ["Streamlit", "대시보드", "데모 앱", "시각화"],
  },
  "RESTful API 설계 원칙": {
    objectives: ["REST 아키텍처 원칙과 제약 조건", "리소스 설계와 HTTP 메서드 매핑", "API 버저닝과 에러 응답 표준화"],
    keywords: ["REST", "HTTP 메서드", "API 설계", "버저닝"],
  },
  "인증·권한 (JWT, OAuth)": {
    objectives: ["JWT 토큰 기반 인증 구현", "OAuth 2.0 흐름 이해", "역할 기반 접근 제어 (RBAC)"],
    keywords: ["JWT", "OAuth", "인증", "권한", "RBAC"],
  },
  "모델 서빙 (TorchServe, Triton)": {
    objectives: ["모델 서빙 프레임워크 비교", "TorchServe 배포 실습", "배치 추론과 성능 최적화"],
    keywords: ["TorchServe", "Triton", "모델 서빙", "배치 추론"],
  },
  "API 테스트 + 문서화": {
    objectives: ["pytest로 API 테스트 작성", "Swagger/OpenAPI 자동 문서화", "통합 테스트와 E2E 테스트"],
    keywords: ["pytest", "Swagger", "API 문서화", "테스트"],
  },
  "배포 기초 마무리 + Sub Quest": {
    objectives: ["배포 전체 프로세스 정리", "실전 API 서버 배포", "Sub Quest 과제 수행"],
    keywords: ["배포", "Sub Quest", "종합 정리"],
  },

  // MLOps
  "Docker 기초: 컨테이너, 이미지": {
    objectives: ["컨테이너와 VM 차이 이해", "Docker 이미지 레이어 구조", "기본 Docker 명령어 (run, build, push)"],
    keywords: ["Docker", "컨테이너", "이미지", "레이어"],
  },
  "Docker 실습: Dockerfile, Compose": {
    objectives: ["Dockerfile 작성과 멀티 스테이지 빌드", "Docker Compose로 멀티 컨테이너 관리", "볼륨, 네트워크, 환경변수 설정"],
    keywords: ["Dockerfile", "Docker Compose", "멀티 스테이지", "볼륨"],
  },
  "GCP 기초: Compute Engine, Storage": {
    objectives: ["GCP 콘솔과 gcloud CLI 사용", "Compute Engine 인스턴스 생성/관리", "Cloud Storage 버킷 활용"],
    keywords: ["GCP", "Compute Engine", "Cloud Storage", "gcloud"],
  },
  "GCP 실습: Cloud Run 배포": {
    objectives: ["Cloud Run으로 컨테이너 서버리스 배포", "자동 스케일링과 비용 최적화", "CI/CD 연동 배포 자동화"],
    keywords: ["Cloud Run", "서버리스", "자동 스케일링", "배포"],
  },
  "Airflow 기초: DAG, 오퍼레이터": {
    objectives: ["Airflow DAG 구조와 스케줄링", "오퍼레이터 종류 (Bash, Python, Branch)", "Task 의존성과 실행 순서 관리"],
    keywords: ["Airflow", "DAG", "오퍼레이터", "스케줄링"],
  },
  "Airflow 실습: ML 파이프라인 구축": {
    objectives: ["데이터 수집→전처리→학습→평가 파이프라인", "XCom으로 Task 간 데이터 전달", "에러 핸들링과 재시도 전략"],
    keywords: ["ML 파이프라인", "XCom", "파이프라인 자동화"],
  },
  "CI/CD 파이프라인 (GitHub Actions)": {
    objectives: ["GitHub Actions 워크플로우 작성", "자동 테스트 + 빌드 + 배포 파이프라인", "시크릿 관리와 환경별 배포"],
    keywords: ["CI/CD", "GitHub Actions", "워크플로우", "자동 배포"],
  },
  "모델 모니터링 + 드리프트 감지": {
    objectives: ["모델 성능 모니터링 지표 설계", "데이터 드리프트와 컨셉 드리프트 감지", "알림 시스템과 자동 재학습 트리거"],
    keywords: ["모니터링", "드리프트", "재학습", "알림"],
  },
  "MLflow 실험 추적": {
    objectives: ["MLflow로 실험 로깅 (파라미터, 메트릭, 아티팩트)", "모델 레지스트리와 버전 관리", "실험 비교와 최적 모델 선택"],
    keywords: ["MLflow", "실험 추적", "모델 레지스트리", "버전 관리"],
  },
  "종합 파이프라인 구축 실습 1": {
    objectives: ["end-to-end MLOps 파이프라인 설계", "Docker + Airflow + GCP 통합", "데이터 파이프라인 자동화"],
    keywords: ["종합 실습", "파이프라인 통합", "자동화"],
  },
  "종합 파이프라인 구축 실습 2": {
    objectives: ["모니터링 + CI/CD 통합", "프로덕션 배포 시뮬레이션", "트러블슈팅과 디버깅"],
    keywords: ["프로덕션 배포", "트러블슈팅", "통합 테스트"],
  },
  "Main Quest 05: MLOps 종합": {
    objectives: ["MLOps 전체 과정 종합 프로젝트", "end-to-end 파이프라인 구축 및 발표", "피어 리뷰와 피드백"],
    keywords: ["Main Quest", "종합 프로젝트", "피어 리뷰"],
  },

  // DLthon
  "DLthon 1 팀 빌딩 + 주제 선정": {
    objectives: ["팀 구성과 역할 분담", "프로젝트 주제 선정 및 기획", "데이터셋 탐색 및 베이스라인 설정"],
    keywords: ["팀 빌딩", "주제 선정", "베이스라인"],
  },
  "DLthon 1 모델 개발": {
    objectives: ["모델 아키텍처 설계 및 구현", "학습 전략 수립 (앙상블, 전이학습)", "실험 관리와 버전 컨트롤"],
    keywords: ["모델 개발", "앙상블", "실험 관리"],
  },
  "DLthon 1 성능 최적화": {
    objectives: ["하이퍼파라미터 튜닝", "데이터 증강과 정규화 기법 적용", "성능 분석과 에러 분석"],
    keywords: ["최적화", "튜닝", "에러 분석"],
  },
  "Main Quest 02: DLthon 1 발표 + 제출": {
    objectives: ["최종 모델 제출 및 결과 정리", "프로젝트 발표와 데모", "회고 및 개선점 도출"],
    keywords: ["Main Quest", "발표", "회고"],
  },
  "DLthon 2 팀 빌딩 + LLM 주제 선정": {
    objectives: ["LLM 활용 프로젝트 기획", "데이터 소스 및 기술 스택 결정", "프로토타입 설계"],
    keywords: ["LLM 프로젝트", "기획", "프로토타입"],
  },
  "DLthon 2 LLM 앱 개발": {
    objectives: ["LLM 기반 애플리케이션 구현", "프롬프트 엔지니어링과 체인 구성", "API 연동 및 UI 구축"],
    keywords: ["LLM 앱", "프롬프트 엔지니어링", "API"],
  },
  "DLthon 2 테스트 + 최적화": {
    objectives: ["LLM 앱 테스트와 품질 개선", "응답 품질 평가 및 최적화", "비용과 레이턴시 최적화"],
    keywords: ["테스트", "품질 개선", "최적화"],
  },
  "Main Quest 04: DLthon 2 발표 + 제출": {
    objectives: ["LLM 프로젝트 최종 발표", "데모 시연 및 기술적 Q&A", "팀 회고와 다음 목표 설정"],
    keywords: ["Main Quest", "발표", "데모", "회고"],
  },
};

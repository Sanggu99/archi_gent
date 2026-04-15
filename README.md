<div align="center">

<br/>

```
 █████╗ ██████╗  ██████╗██╗  ██╗██╗ ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔══██╗██╔════╝██║  ██║██║██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██████╔╝██║     ███████║██║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██╔══██╗██║     ██╔══██║██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║██║  ██║╚██████╗██║  ██║██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
```

### **AI 기반 건축 Mass Design 자동화 스튜디오**
*Generative Pre-design · Spatial Ontology · Real-time 3D Massing*

<br/>

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 📐 프로젝트 개요

> *"설계 초기 기획의 72시간을 10분으로."*

**Archigent**는 건축가의 디자인 철학(Ontology)과 법규 제약 조건을 Gemini AI로 결합해,  
**Feasibility Study 단계의 매싱 대안을 즉각적이고 다각도로 생성**하는 Generative Pre-design 도구입니다.

사용자가 대지 면적·용적률·건폐율을 입력하면, AI가 5가지 고유한 Massing Strategy로 건축 대안을 실시간 생성합니다.  
각 대안은 3D 뷰어, Spatial Graph, 법규 검토 리포트로 즉시 시각화됩니다.

---

## ✨ 주요 기능

### 🤖 AI Multi-Agent Generation
- **Gemini API** 기반 구조화된 JSON 생성
- FAR(용적률) · BCR(건폐율) · 높이제한 · 이격거리 · 용도지역을 AI 프롬프트에 주입
- 5가지 Massing Strategy를 **반드시 하나씩** 생성하도록 강제
- 토큰 제한(`65,536`) + 503 자동 재시도 로직으로 안정적 응답 보장

### 🏗️ 5가지 Massing Strategy
| Strategy | 형태 특징 | 레퍼런스 |
|---|---|---|
| **STACKED** | 수직 적층, 층마다 4% 테이퍼 | Jeanne Gang 스타일 |
| **HORIZONTAL** | 프로그램 비율순 선형 배열, 전체 연결 | SANAA / Toyo Ito |
| **COURTYARD** | U자형 3익 날개 구조, 중정 개방 | Álvaro Siza |
| **ROTATED** | 중심축 고정, 30° 누적 회전 | BIG / Zaha Hadid |
| **SKEWED** | 자체 폭 × 12% 비율 캔틸레버 돌출 | Morphosis |

### 📊 데이터 시각화
- **Main 3D Viewer** — `@react-three/fiber` 기반 실시간 매싱, GLTF Export
- **Spatial Ontology Graph** — `@xyflow/react` 기반 프로그램 연결 다이어그램
- **Scenario Fit Score** — 환경·경제·사회·기술 4축 레이더 차트
- **Regulation Compliance** — FAR / BCR / 높이 / 이격 / 용도지역 Pass/Fail 체크

---

## 🖥️ 기술 스택

```
Frontend          React 19 + TypeScript + Vite
3D Engine         Three.js + @react-three/fiber + @react-three/drei
Graph View        @xyflow/react (React Flow v12)
Backend           Express + tsx (TypeScript 직접 실행)
AI               Google Gemini API (@google/genai v1.46, v1beta)
Build             Vite SPA — Express Middleware 통합
```

---

## 🚀 로컬 실행

### Prerequisites
- **Node.js** 18+
- **Gemini API Key** ([Google AI Studio](https://aistudio.google.com)에서 발급)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
# .env 파일 생성 후 아래 내용 입력:
GEMINI_API_KEY=your_api_key_here

# 3. 서버 실행 (Vite 개발 서버 포함)
npx tsx server.ts
```

브라우저에서 `http://localhost:4000` 접속

---

## 🗂️ 프로젝트 구조

```
archigent/
├── server.ts                  # Express + Gemini API + Vite 통합 서버
├── src/
│   ├── App.tsx                # 루트 컴포넌트 / 상태 관리
│   ├── types.ts               # 공유 TypeScript 타입 정의
│   └── components/
│       ├── Main3DViewer.tsx   # Three.js 3D 매싱 뷰어 + GLTF Export
│       ├── NodeLinkView.tsx   # Spatial Ontology Graph
│       ├── AnalysisPanel.tsx  # 프로그램 분석 패널
│       ├── ScenarioFitScore.tsx  # 레이더 차트 점수
│       ├── VariantSnapshots.tsx  # 대안 썸네일 목록
│       ├── ProjectContextBar.tsx # 상단 입력 바
│       └── GeneratedAssetsList.tsx
├── .env                       # API 키 (Git 제외)
└── vite.config.ts
```

---

## 🔄 사용 흐름

```
1. Project Context 입력
   대지면적 · FAR · BCR · 높이제한 · 이격거리 · 용도지역 · 설계 목표 텍스트

        ↓

2. AI Multi-Agent Generation
   Gemini가 5가지 Massing Strategy × 각 6개 프로그램 생성 (~30–40초)

        ↓

3. 결과 시각화
   3D 매싱 | Spatial Graph | 점수 레이더 | Compliance 리포트

        ↓

4. 대안 선택 & Export
   GLTF 파일 다운로드 / 법규 검토 결과 확인
```

---

## 📈 개발 배경 & 임팩트

| 구분 | 기존 방식 | Archigent |
|---|---|---|
| 초기 대안 도출 | 건축가 수작업 2–5일 | **AI 자동 생성 < 1분** |
| 법규 검토 | 수동 확인 | **자동 Pass/Fail 리포트** |
| 대안 수 | 3–5개 (최선 노력) | **5개 보장 (전략별 1개)** |
| 3D 시각화 | 별도 모델링 툴 필요 | **브라우저 실시간** |

> 기존 실무 기준 **72시간 이상 소요되던 Feasibility Study 초기 기획 프로세스를 10분 이내로 단축** (약 99% 효율 향상)

---

## 🔮 향후 개발 방향

- [ ] **Podium + Tower 복합 타입** — 저층부(BCR 최대) + 고층부(FAR 활용) 2단계 전략
- [ ] **Program → Physical Adjacency** — Graph 연결이 3D 매싱 배치에 직접 반영
- [ ] **IFC / Revit Export** — 생성된 매싱을 설계 소프트웨어와 직접 연동
- [ ] **Vision AI Context** — 대지 사진·드론 데이터 분석으로 주변 맥락 반영
- [ ] **Energy Simulation** — Ladybug 로직 통합, 생성 단계 에너지 성능 실시간 검증

---

<div align="center">

**Archigent** — *건축과 AI의 경계에서*

Made with ☕ + 🤖

</div>

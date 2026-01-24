# 꿈결 (Kkum-Gyeol) 프로젝트

## 개요
꿈 일기를 기록하고 AI가 분석 및 시각화하는 앱

## 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **인증/DB**: Firebase (Auth, Firestore)
- **AI**: Gemini API (gemini-2.0-flash), Imagen API (imagen-4.0-generate-001)
- **SDK**: @google/genai
- **배포**: Vercel (kkum-gyeol.vercel.app)

## 주요 파일 구조
```
src/
├── app/
│   ├── api/
│   │   ├── analyze-dream/route.js  # 꿈 분석 (Gemini)
│   │   └── generate-image/route.js # 이미지 생성 (Imagen)
│   ├── layout.js
│   └── page.js
├── components/
│   ├── common/                     # 공통 컴포넌트
│   └── views/
│       ├── RecordDreamView.jsx     # 꿈 기록 화면
│       ├── StatsView.jsx           # 무의식 리포트 (5감정 레이더)
│       └── ...
├── constants/index.js              # ART_STYLES, SUBCONSCIOUS_QUOTES
├── services/
│   ├── api.js                      # API 호출 함수
│   └── firebase.js                 # Firebase 설정
└── lib/utils.js                    # 유틸리티 함수
```

## 개발 명령어
- `npm run dev` - 로컬 개발 서버 (localhost:3000)
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 검사

## 환경 변수 (.env.local)
```
GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 개발 워크플로우
1. Gemini 웹 채팅에서 App.jsx 생성
2. `gemini_App_jsx_code/`에 원본 저장 (예: App_20260123.jsx)
3. 모듈화된 코드에 변경사항 적용- "새 App.jsx와 현재 코드를 비교해서 변경된 부분만 반영해줘" 하면 됨
4. `git commit && git push` → Vercel 자동 배포

## 주요 기능
- **꿈 분석**: 프로이트 해석, 일반 해몽, 상징 추출
- **감정 분석**: 5가지 (joy, peace, sadness, vitality, anxiety)
- **이미지 생성**: 9가지 화풍 선택 가능
- **무의식 리포트**: 7개 꿈 데이터 기반 레이더 차트

## Imagen 모델 옵션
- `imagen-4.0-generate-001` (현재 사용)
- `imagen-4.0-ultra-generate-001` (고품질)
- `imagen-4.0-fast-generate-001` (빠른 생성)

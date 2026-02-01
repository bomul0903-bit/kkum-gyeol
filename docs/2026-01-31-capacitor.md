# Capacitor 적용 관련 정리

## Capacitor 란?
- Ionic에서 만든 오픈소스 런타임
- 웹앱을 네이티브 앱(iOS/Android) 컨테이너(WebView)에 넣어주는 브릿지
- 기존 웹 코드 그대로 유지하면서 네이티브 기능(카메라, 푸시 알림 등) 접근 가능

## PWA vs Capacitor

| | PWA | Capacitor |
|---|---|---|
| 설치 | 브라우저 "홈 화면에 추가" | 앱스토어 다운로드 |
| 네이티브 API | 제한적 | 거의 모두 가능 |
| 푸시 알림 | iOS 제한적 | 완전 지원 |
| 앱스토어 등록 | Google Play만 TWA로 가능 | iOS/Android 모두 가능 |
| 업데이트 | 즉시 (웹 배포) | 앱스토어 심사 필요 |

## 꿈결에 적용 시 필요한 작업

### 1. Capacitor 설치/설정 (쉬움)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init 꿈결 com.kkumgyeol.app
npx cap add ios
npx cap add android
```

### 2. API 호출 URL 변경 (쉬움)
현재 서버사이드 API 라우트 사용 중 → Capacitor에서는 동작 안 함
```js
// 현재: 상대 경로
fetch('/api/analyze-dream', ...)

// 변경: Vercel 배포 URL로 직접 호출
fetch('https://kkum-gyeol.vercel.app/api/analyze-dream', ...)
```
Vercel이 API 서버 역할을 하는 구조

### 3. 빌드
- `next export`로 정적 빌드 → WebView에 로드
- iOS: Xcode에서 빌드 (Mac 필수)
- Android: Android Studio에서 빌드 (아무 OS 가능)

## 앱스토어 제출

### Google Play
- 개발자 계정: $25 (일회성, 업데이트 무료)
- Android Studio에서 `.aab` 빌드 → Google Play Console에 업로드
- 심사: 비교적 느슨, 수일 내 승인

### Apple App Store
- 개발자 계정: $99/년
- Mac + Xcode 필수
- 심사: 까다로움, 단순 웹뷰 래퍼는 리젝 가능 → 네이티브 기능 추가 권장

### 비용 비교

| 항목 | Google Play | App Store |
|---|---|---|
| 개발자 등록 | $25 (일회성) | $99/년 |
| 앱 업데이트 | 무료 | 무료 |
| 유료 앱/인앱 결제 수수료 | 15~30% | 15~30% |

## 결론
- 기술적으로 당장 적용 가능
- Google Play가 진입 장벽 낮음 (비용, OS 제한 없음, 심사 느슨)
- Apple은 Mac + 개발자 계정 + 네이티브 기능 추가 필요

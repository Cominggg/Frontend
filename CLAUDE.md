# coming-frontend

Jpop 아티스트 내한 공연 정보 통합 웹 플랫폼 (KOPIS + MusicBrainz + setlist.fm 연동).

## Stack
- React 19 + Vite 8, JavaScript (JSX, no TypeScript)
- ESLint with react-hooks and react-refresh plugins
- Axios (인증·에러 interceptor 중앙 처리)
- React Router v7 (PrivateRoute로 인증 필요 페이지 보호)
- React Query (서버 상태), Zustand (전역 상태)
- `@/` → `src/` 경로 alias (vite.config.js 설정)

## Commands
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## 디렉터리 구조
```
src/
  components/   # 도메인별 분리: artist·auth·calendar·concert·layout·release·ui
  pages/        # 라우트 단위 페이지
    admin/      # 관리자 전용 페이지 (AdminRoute로 보호)
  stores/       # Zustand 스토어 (authStore·loginModalStore·themeStore)
  services/     # api.js 단일 파일 — Axios 인스턴스 및 인터셉터 중앙 관리
  mocks/        # followedArtistMocks.js만 존재; 대부분 목 데이터는 각 페이지에 인라인 선언
  hooks/        # 커스텀 훅 (현재 빈 디렉터리)
  utils/        # 유틸 함수
  constants/    # 상수
```

## 환경 변수
- `VITE_API_BASE_URL` — 백엔드 주소 (기본값: `http://localhost:8080`, `.env` 파일에 설정)
  - 개발 서버는 `/api/**` 경로를 이 주소로 자동 프록시 (CORS 설정 불필요)

## 핵심 규칙
- `no-unused-vars` rule ignores names matching `^[A-Z_]`
- 스타일: CSS Modules 사용 (`Page.jsx` + `Page.module.css` 페어)
- 반응형 breakpoint: `767px`(모바일), `900px`, `1279px` — `480px`은 비표준이므로 사용 금지
- 목 데이터: 각 페이지 상단에 `const MOCK_*_MAP = {...}` 인라인 선언, `// TODO: API 연동 후 제거` 주석 표기
- 소셜 로그인: Google / Kakao만 지원 (Naver 없음)
- 비로그인 보호 기능 접근 시: 페이지 이동이 아닌 **로그인 모달** 표시 (redirect_uri로 현재 URL 유지)
- 로그인 모달: `loginModalStore`로 전역 제어
- 관리자 보호: `AdminRoute` 컴포넌트 사용 (`PrivateRoute`와 구분)
- Access Token은 Authorization 헤더, Refresh Token은 HttpOnly Cookie
- 401 응답 → Axios interceptor에서 자동 refresh, 실패 시 로그인 이동

## 명세 위치 (Cominggg/Specification)

명세는 외부 레포에 있다. `/read-spec` 스킬로 접근한다.

- ERD: `spec/erd.md`
- 인증 정책: `spec/auth-policy.md`
- API 전체: `spec/api/_index.md`

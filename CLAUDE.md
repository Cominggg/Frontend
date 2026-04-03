# coming-frontend

Jpop 아티스트 내한 공연 정보 통합 웹 플랫폼 (KOPIS + MusicBrainz + setlist.fm 연동).

## Stack
- React 19 + Vite 8, JavaScript (JSX, no TypeScript)
- ESLint with react-hooks and react-refresh plugins
- Axios (인증·에러 interceptor 중앙 처리)
- React Router v6 (PrivateRoute로 인증 필요 페이지 보호)
- React Query (서버 상태), Zustand 또는 Redux Toolkit (전역 상태 — 미확정)

## Commands
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## 핵심 규칙
- `no-unused-vars` rule ignores names matching `^[A-Z_]`
- 소셜 로그인: Google / Kakao만 지원 (Naver 없음)
- 비로그인 보호 기능 접근 시: 페이지 이동이 아닌 **로그인 모달** 표시 (redirect_uri로 현재 URL 유지)
- Access Token은 Authorization 헤더, Refresh Token은 HttpOnly Cookie
- 401 응답 → Axios interceptor에서 자동 refresh, 실패 시 로그인 이동

## 참조 문서
- [`docs/features.md`](docs/features.md) — 기능 ID별 명세, 우선순위(P0/P1/P2), 라우트 구조
- [`docs/api-endpoints.md`](docs/api-endpoints.md) — 전체 API 엔드포인트 목록
- [`docs/ux-conventions.md`](docs/ux-conventions.md) — 반응형, 로딩, 배지 색상, 에러 처리 등

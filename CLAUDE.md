# coming-frontend

Jpop 아티스트 내한 공연 정보 통합 웹 플랫폼 (KOPIS + MusicBrainz + setlist.fm 연동).

## Stack
- React 19 + Vite 8, JavaScript (JSX, no TypeScript)
- ESLint with react-hooks and react-refresh plugins
- Axios (인증·에러 interceptor 중앙 처리)
- React Router v6 (PrivateRoute로 인증 필요 페이지 보호)
- React Query (서버 상태), Zustand (전역 상태)

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

### 평소 참조 (로컬 요약본 — 항상 여기서 먼저 확인)
- [`docs/code-conventions.md`](docs/code-conventions.md) — 파일 구조, 네이밍, 컴포넌트·훅·API·CSS 작성 규칙
- [`docs/ux-conventions.md`](docs/ux-conventions.md) — 반응형, 로딩, 배지 색상, 에러 처리 등
- [`docs/features.md`](docs/features.md) — 기능 ID별 명세, 우선순위(P0/P1/P2), 라우트 구조 (프론트 요약)
- [`docs/api-endpoints.md`](docs/api-endpoints.md) — 프론트에서 사용하는 API 목록 (프론트 요약)

### 마스터 명세 (조건부 조회 — 아래 상황에서만 읽는다)
- 레포: `https://github.com/Cominggg/Specification`
- Raw 기본 경로: `https://raw.githubusercontent.com/Cominggg/Specification/main/spec/`
- **읽는 조건**: 새 기능 구현 시작 / 로컬 요약본으로 부족할 때 / `/sync-docs` 실행 시
- **파일 매핑**: 기능→`features.md`, API→`api.md`, 인증→`auth-policy.md`, UX→`ux-policy.md`, 관리자→`admin.md`
- 읽는 방법: `gh api repos/Cominggg/Specification/contents/spec/{파일명} --jq '.content' | base64 -d`
- 명세 수정 후 반드시 `CHANGELOG.md`도 갱신한다 (`/sync-docs` 스킬 사용)

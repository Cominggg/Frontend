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
- `npm run test` - run Vitest once (`npm run test:watch` for watch mode)

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

## 개발 워크플로우

### 전체 흐름

```
구현 (페이지·컴포넌트 단위) → 테스트 작성 → /fe-review → /simplify → /commit → /pr
```

### 테스트 작성 시점

- **각 유틸·훅·스토어·컴포넌트의 작업 범위 내 구현이 끝난 직후** 테스트를 작성한다. 신규 파일은 공개 동작 전체, 기존 파일은 추가·변경된 동작만 대상으로 한다.
- 스타일·반응형 전용 변경(`ui` 커밋)은 테스트 대상이 아니다. 브라우저 수동 확인으로 검증한다.
- 테스트 작성은 `write-tests` 에이전트(`.claude/agents/write-tests.md`)를 사용한다. 컨벤션(colocate 위치, 쿼리 우선순위, API 모킹 방식)도 이 문서가 기준이다.
- `/fe-review` 실행 전 `npm run test`가 통과된 상태여야 한다.

### 병렬 테스트 작성

- **서로 독립적인 대상이 3개 이상**(서로 import하지 않는 파일 3개 이상, 또는 3개 이상 도메인): `write-tests` 에이전트를 단일 응답에서 병렬 호출한다
- **1~2개**: 순차 작성한다 (cold start 중복 비용이 시간 이득을 초과)
- **에이전트 호출 전**: `vite.config.js`의 `test` 블록과 기존 테스트 예제 파일 1개를 먼저 읽고 프롬프트에 포함해 에이전트의 중복 탐색을 방지한다
- **의존 순서 유지**: 같은 흐름 안의 스토어·훅 → 이를 쓰는 컴포넌트 순서로 작성한다 (컴포넌트 테스트는 스토어·훅 계약을 전제)

### 커밋 전 체크리스트

- `/fe-review` 통과(🔴 critical 0건) 전에 `/commit`을 실행하지 않는다.
- 디자인·UX 판단이 필요한 화면 작업은 `web-design` 에이전트(`.claude/agents/web-design.md`)에 먼저 검토를 받는다.

## 명세 위치 (Cominggg/Specification)

명세는 외부 레포에 있다. `/read-spec` 스킬로 접근한다.

- ERD: `spec/erd.md`
- 인증 정책: `spec/auth-policy.md`
- API 전체: `spec/api/_index.md`

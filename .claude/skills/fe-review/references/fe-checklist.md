# FE 코드 리뷰 체크리스트

## 심각도 기준

| 심각도 | 의미 |
|--------|------|
| 🔴 critical | 즉시 수정 필요 (프로젝트 핵심 규칙 위반, 보안, 런타임 오류, 테스트 실패) |
| 🟡 warning  | 개선 권장 (일관성·유지보수성·접근성 저하) |
| 🔵 suggestion | 선택적 개선 (스타일, 재사용, 테스트 보강) |

---

## 1. 반응형 breakpoint

허용 값은 `767px`(모바일), `900px`, `1279px`(태블릿)뿐이다. `min-width`를 쓸 때는 같은 경계의 `768px`, `901px`, `1280px`만 허용한다.

### 🔴 critical
- `@media`에 허용 외 값 사용 — 특히 `480px`
  ```bash
  grep -nE "@media[^{]*[0-9]+px" {변경된 .css 파일}
  ```

### 🟡 warning
- 같은 파일 안에서 `max-width`와 `min-width` 기준을 섞어 경계가 겹치거나 빈다 (예: `max-width: 767px`과 `min-width: 767px`)
- JS에서 폭 분기(`matchMedia`, `innerWidth`)에 허용 외 값 사용

---

## 2. CSS Modules 페어링

규칙: `Xxx.jsx`의 스타일은 같은 디렉터리의 `Xxx.module.css`에 둔다.

### 🔴 critical
- 컴포넌트·페이지에서 전역 `.css` 파일을 import (전역 스타일은 `src/index.css`만)
- `className`에 CSS Modules가 아닌 전역 클래스 문자열을 사용해 스타일링 (`className="card"` 등)

### 🟡 warning
- `Xxx.jsx`가 이름이 다른 `Yyy.module.css`를 import (공유 스타일 파일 예외: `pages/admin/AdminFormPage.module.css`처럼 여러 페이지가 의도적으로 공유하는 경우)
- 어떤 `.jsx`도 import하지 않는 `.module.css` (고아 파일)
- `.module.css`에 정의했지만 JSX에서 쓰지 않는 클래스가 새로 추가됨

### 🔵 suggestion
- 정적 스타일을 인라인 `style={{...}}`로 작성 (동적 값이 아니면 모듈 CSS로 이동)

---

## 3. 목 데이터 잔존

규칙: API 미연동 화면의 목 데이터는 페이지 상단 `const MOCK_*_MAP = {...}` + `// TODO: API 연동 후 제거` 주석으로 선언한다.

```bash
grep -n "MOCK_" {검토 대상 .js/.jsx 파일}
```

### 🟡 warning
- `MOCK_*` 선언에 `// TODO: API 연동 후 제거` 주석이 없음
- 해당 데이터를 가져오는 서비스 함수가 `src/services/`에 이미 있는데 `MOCK_*`가 남아 있음 (연동 누락 의심)
- 이번 변경에서 API 연동을 완료했는데 기존 `MOCK_*` 선언·참조를 제거하지 않음

### 🔵 suggestion
- 목 데이터를 페이지 외부 파일에 새로 선언 (예외: 기존 `src/mocks/followedArtistMocks.js`)
- 이름이 `MOCK_*_MAP` 형식이 아님

---

## 4. 인증·권한 패턴

### 🔴 critical
- 관리자 경로(`/admin/**`)가 `AdminRoute`로 보호되지 않음, 또는 `PrivateRoute`로만 보호됨
- 로그인 필요 페이지 라우트가 `PrivateRoute`로 보호되지 않음
- 비로그인 사용자의 보호 기능 접근 시 **로그인 페이지로 이동**(`navigate`, `<Navigate>`, `location.href`)시킴 — 로그인 모달(`useLoginModalStore.open`)을 띄워야 한다
- Access Token·Refresh Token을 `localStorage`/`sessionStorage`/쿠키에 JS로 저장 (Access Token은 메모리(`authStore`), Refresh Token은 HttpOnly Cookie. `SESSION_HINT` 플래그는 예외)
- `Authorization` 헤더를 컴포넌트에서 직접 세팅 (`api.js` interceptor 담당)
- 보호 기능에서 `useLoginModalStore.open()`을 인자 없이 호출해 로그인 후 현재 페이지로 돌아오지 못함 (현재 경로 `pathname + search` 전달 필요 — CLAUDE.md 핵심 규칙 "redirect_uri로 현재 URL 유지")

### 🟡 warning
- 역할 비교를 `'ADMIN'`/`'PENDING'` 문자열로 새 위치에 흩뿌림 (기존 `AdminRoute`/`PrivateRoute` 재사용 검토)

### 🔵 suggestion
- Google·Kakao 외 소셜 로그인(Naver 등) 관련 UI·코드 추가 — 현재 지원 범위 밖

---

## 5. API·상태 관리

### 🔴 critical
- 컴포넌트·페이지에서 `axios`를 직접 import해 호출 (`src/services/api.js` 인스턴스와 interceptor 우회)
- 백엔드 주소를 하드코딩 (`http://localhost:8080` 등) — `/api` 상대 경로 + `VITE_API_BASE_URL` 사용

### 🟡 warning
- 서비스 함수(`src/services/{domain}Api.js`)를 거치지 않고 컴포넌트에서 `api.get('/...')` 직접 호출
- 서버 데이터를 Zustand 스토어에 캐싱 (React Query 담당)
- 변경(mutation) 후 관련 `queryKey` 무효화 누락으로 화면이 갱신되지 않음
- 경로 문자열을 하드코딩 (`'/artists/' + id`) — `ROUTES` 상수 사용

### 🔵 suggestion
- 기존 `ui/` 컴포넌트(`Button`, `Pagination`, `EmptyState`, `FilterTabs` 등)나 `hooks/`로 대체 가능한 코드를 새로 작성

---

## 6. 디자인 토큰·접근성

### 🟡 warning
- 변경된 CSS 라인에 색상 리터럴(`#hex`, `rgb()`) 하드코딩 — `src/index.css` 토큰 사용 (리터럴은 다크 모드에서 전환되지 않으므로 다크 대응 누락도 이 항목으로 본다)
- `src/index.css`에 새 색상 토큰을 라이트에만 정의하고 다크(`html[data-theme="dark"]`, `prefers-color-scheme: dark`)에 누락
- 클릭 가능한 `div`/`span` (`onClick`)에 `role`·`tabIndex`·키보드 핸들러 없음 — `button` 사용 권장
- 의미 있는 `<img>`에 `alt` 누락 (장식용은 `alt=""`)
- 아이콘만 있는 버튼에 `aria-label` 누락
- 새 모달이 `useModalA11y`를 쓰지 않음 (포커스 트랩·복귀 누락)

### 🔵 suggestion
- 터치 대상 크기 44px 미만 (시각 크기 유지 시 `::before` 히트 영역 확장 패턴 참고: `ui/FilterTabs.module.css`)
- `transition`/`animation` 추가 시 `prefers-reduced-motion` 미대응

---

## 7. 테스트·lint

### 🔴 critical
- `npm run test` 실패 (검토 대상과 무관한 기존 실패는 제외하고 따로 표기)
- 검토 대상 파일에 ESLint 에러 (변경하지 않은 파일의 기존 에러는 제외)

### 🟡 warning
- 신규·변경된 `src/utils/`, `src/hooks/`, `src/stores/` 함수에 대응하는 테스트 파일(`*.test.js`) 없음
- 테스트 컨벤션 위반 (`.claude/agents/write-tests.md` 기준): 구현 옆 colocate 아님, `getByTestId` 남용, `fireEvent` 사용, 스토어 리셋 누락

### 🔵 suggestion
- 사용자 상호작용이 있는 신규 컴포넌트에 테스트 없음
- happy path만 있고 빈 상태·에러 상태 테스트 없음

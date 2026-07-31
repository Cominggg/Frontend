# UX 컨벤션

## 반응형
- 데스크탑 우선 (max-width 기준)
- 브레이크포인트: max-width 1279px (tablet), max-width 900px (tablet-sm), max-width 767px (mobile)
- 예외: 앨범·수평 스트립 → min-width 768px에서 그리드 전환 (min-width 기준 사용)

## 로딩 상태
- 데이터 로딩: 스켈레톤 UI (Spinner 지양)
- 버튼 처리 중: disabled + 로딩 인디케이터

## 목록 표시
| 항목 | 방식 | 페이지당 건수 |
|------|------|---------------|
| 아티스트 목록 (ART-01) | 페이지네이션 | 25건 |
| 공연 목록 (CON-01) | 페이지네이션 | 20건 |
| 아티스트 공연 내역 (ART-03) | 페이지네이션 (2020년~) | 10건 |
| 마이페이지 — 다녀온 공연 (MY-01) | 페이지네이션 | 10건 |
| 마이페이지 — 예정 공연 (MY-03) | 페이지네이션 | 10건 |
| 마이페이지 — 내 문의 내역 (INQ-04) | 페이지네이션 | 10건 |
| 자동완성 드롭다운 | 최대 5건 | — |

## 홈 섹션 구성

### 섹션 순서
1. 히어로 캐러셀 (주요 공연·릴리즈 하이라이트)
2. 인기 공연 (CON-03, 조회수 순, 홈 노출 4건·1행, 전체보기 유도)
3. 다가오는 공연 (이번 주~이달 내한 공연 최대 5건, 날짜 오름차순, 전체보기 유도)
   - 섹션 헤더에 이달 예정 내한 공연 건수 칩 표시 (클릭 시 `/concerts` 이동)
   - 각 항목 날짜 옆 D-day 칩 표시 (D-N 형식, 당일 D-DAY, 지난 공연 미표시)
4. 새 앨범·싱글 (그리드, 데스크탑 768px+)
5. 관심 아티스트 공연 (비로그인 시 로그인 유도)

### 히어로 캐러셀 선정 기준
- 노출 대상: **예정 공연** (오늘 이후 공연일 기준) + **최신 릴리즈** (REL-01 데이터)
- 공연 슬라이드 정렬: 캘린더 추가 수 내림차순. 동률 또는 데이터 부족(5건 미만) 시 조회수 기준 fallback
- 릴리즈 슬라이드: 발매일 내림차순 최신 N건
- 자동 선정 (수동 큐레이션 없음)

### 원칙
- 로그인 유도 섹션은 콘텐츠 섹션을 모두 소비한 **맨 마지막**에 배치
- 비로그인 접근 버튼 클릭 시 로그인 모달 표시 (페이지 이동 없음)
- 홈의 목록은 "맛보기" 수준으로 제한 후 전체보기로 유도 (인기 공연: 4건)

## 이미지 Placeholder
- 공연 포스터 실패 → `/assets/poster-placeholder.png`
- 아티스트 이미지 실패 → `/assets/artist-placeholder.png`
- React `onError` 핸들러로 처리

## 공연 상태 배지 색상
| 상태 | 토큰 |
|------|------|
| 공연예정 | `var(--status-upcoming)` |
| 공연중 | `var(--status-ongoing)` |
| 공연완료 | `var(--status-done)` |
| 공연취소 | `var(--status-canceled)` |

## 디자인 토큰 레퍼런스

모든 색상·크기·간격은 `src/index.css` `:root`에 정의된 CSS 변수를 사용한다. 하드코딩 금지.

### 색상 — 기본 팔레트
| 토큰 | 용도 |
|------|------|
| `--color-bg` | 페이지 배경 |
| `--color-surface` | 카드·모달 배경 |
| `--color-surface-hover` | 호버 배경, 스켈레톤 |
| `--color-border` | 구분선·테두리 |
| `--color-accent` | 브랜드 강조색 (기본) |
| `--color-accent-light` | 밝은 강조색 |
| `--color-accent-dark` | 어두운 강조색 |
| `--color-accent-dim` | 강조색 반투명 배경 (8%) |
| `--color-text` | 기본 본문 텍스트 |
| `--color-text-muted` | 보조 텍스트·플레이스홀더 |
| `--color-on-accent` | 강조색 배경 위 텍스트 |
| `--color-destructive` | 삭제·오류 등 파괴적 액션 |

### 색상 — 도메인 토큰
| 토큰 | 용도 |
|------|------|
| `--calendar-sunday` | 캘린더 일요일 색상 |
| `--calendar-saturday` | 캘린더 토요일 색상 |
| `--ticketing-upcoming` | 티켓팅 오픈 예정 (주황) |
| `--ticketing-available` | 티켓팅 가능 (초록) |
| `--ticketing-available-hover` | 티켓팅 가능 호버 |
| `--oauth-google-text` | Google 버튼 텍스트 |
| `--oauth-google-border` | Google 버튼 테두리 |
| `--oauth-kakao-bg` | Kakao 버튼 배경 |
| `--oauth-kakao-text` | Kakao 버튼 텍스트 |
| `--admin-type-concert` | Admin 문의 타입 — CONCERT |
| `--admin-type-artist` | Admin 문의 타입 — ARTIST |
| `--admin-type-setlist` | Admin 문의 타입 — SETLIST |
| `--admin-status-pending` | Admin 문의 상태 — PENDING |
| `--admin-status-resolved` | Admin 문의 상태 — RESOLVED |
| `--admin-status-in-progress` | Admin 문의 상태 — IN_PROGRESS |

### 오버레이 및 섀도우
| 토큰 | 값 | 용도 |
|------|----|------|
| `--overlay` | `rgba(0,0,0,0.55)` | 모달 백드롭 |
| `--overlay-soft` | `rgba(0,0,0,0.45)` | 이미지 위 오버레이 |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.2)` | 모달 그림자 |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,0.14)` | 중간 그림자 |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.12)` | 작은 그림자 |

### border-radius 스케일
| 토큰 | 값 | 주요 용도 |
|------|----|-----------|
| `--radius-xs` | 4px | 칩·뱃지·포커스 링 |
| `--radius-sm` | 6px | 버튼·작은 카드 |
| `--radius-md` | 8px | 입력폼·중형 요소 |
| `--radius-lg` | 12px | 카드 |
| `--radius-xl` | 16px | 대형 카드·모달 |
| `--radius-full` | 9999px | 필·태그·아바타 |

### 레이아웃
| 토큰 | 값 |
|------|----|
| `--max-width` | 1280px |
| `--header-height` | 64px |
| `--bp-tablet` | 1279px |
| `--bp-mobile` | 767px |

> **다크 모드**: `--color-*` 기본 팔레트는 `@media (prefers-color-scheme: dark)` 및 `html[data-theme="dark"]`에서 자동 오버라이드됨.  
> 도메인 토큰(calendar·ticketing·oauth·admin) 및 overlay·shadow 토큰은 다크 모드 오버라이드 없이 고정값 사용.

## 매칭 신뢰도 노출 정책
- **HIGH 매칭**: 관리자 승인 없이 즉시 프론트 노출
- **LOW 매칭**: 관리자 승인 후 노출. 승인 대기 중 공연은 목록에서 제외

## Empty State 텍스트
- 검색 결과 없음: '검색 결과가 없습니다. 다른 검색어를 입력해 보세요.'
- 셋리스트 미등록: '아직 등록된 셋리스트가 없습니다.'

## 에러 처리 (Axios interceptor 중앙 처리)
| 상황 | 처리 방식 |
|------|-----------|
| 5xx | 토스트 메시지 + 재시도 버튼 |
| KOPIS API 장애 | 마지막 캐시 표시 + 상단 배너 경고 |
| MusicBrainz API 장애 | 링크 섹션만 숨김, 나머지 정상 표시 |
| 401 (토큰 만료) | Refresh Token 재발급 시도 → 실패 시 로그인 이동 |
| 네트워크 오프라인 | `navigator.onLine` 감지 → 전역 배너 |
| 비로그인 보호 기능 접근 | 로그인 유도 모달 (redirect_uri 포함, 현재 URL 유지) |
| 셋리스트 미구현 기간 (CON-05 P2) | 공연 상태가 '공연완료'일 때 셋리스트 탭 미표시, 공연 하단에 INQ-03 '셋리스트 정보 문의' 버튼 노출 |
| 문의 중복 등록 | '이미 접수된 문의가 있습니다.' 토스트 |

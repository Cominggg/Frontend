# UX 컨벤션

## 반응형
- 데스크탑 우선 (max-width 기준)
- 브레이크포인트: max-width 1279px (tablet), max-width 767px (mobile)

## 로딩 상태
- 데이터 로딩: 스켈레톤 UI (Spinner 지양)
- 버튼 처리 중: disabled + 로딩 인디케이터

## 목록 표시
- 목록 (아티스트·공연): 페이지네이션 없이 전체 표시
- 아티스트 공연 내역: 전체 표시 (2020년~)
- 자동완성 드롭다운: 최대 5건

## 이미지 Placeholder
- 공연 포스터 실패 → `/assets/poster-placeholder.png`
- 아티스트 이미지 실패 → `/assets/artist-placeholder.png`
- React `onError` 핸들러로 처리

## 공연 상태 배지 색상
| 상태 | 색상 | 헥스 |
|------|------|------|
| 공연예정 | Blue | `#1565C0` |
| 공연중 | Green | `#2E7D32` |
| 공연완료 | Gray | `#757575` |
| 공연취소 | Red | `#C62828` |

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
| 문의 중복 등록 | '이미 접수된 문의가 있습니다.' 토스트 |

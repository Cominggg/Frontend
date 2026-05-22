# API Endpoints

Base: `/api`

## 공통 응답 규칙
- 날짜: `YYYY-MM-DD` (ISO 8601). FE에서 `YYYY.MM.DD` 변환
- 필드명: snake_case → camelCase (`venue_name`→`venue`, `start_date`→`startDate`, `end_date`→`endDate`, `poster_url`→`posterUrl`, `first_release_date`→`releaseDate`, `cover_url`→`coverUrl`)
- `isFollowing`: 인증 시 `user_follow_artist` 기준, 비인증 시 `false`
- `isInCalendar`: 인증 시 `user_concert_calendar` 기준, 비인증 시 `false`

## 인증
```text
GET    /api/auth/login/{provider}         provider: google|kakao
GET    /api/auth/callback/{provider}
POST   /api/auth/refresh
POST   /api/auth/logout                   (인증)
DELETE /api/auth/withdraw                 (인증)
GET    /api/auth/me                       (인증) → { id, nickname, avatarUrl, role }
PUT    /api/auth/me                       (인증) multipart/form-data
```

## 아티스트
```text
GET    /api/artists                       name, page, size(기본 25). 응답당 isFollowing 포함. imageUrl 항상 null
GET    /api/artists/:id                   응답: followerCount, isFollowing, links[{id,label,url}]
GET    /api/artists/:id/concerts          tab: all|upcoming|past, page, size(기본 10)
GET    /api/artists/:id/releases          type: ALBUM|SINGLE|EP, page, size(기본 10). 응답당 tracks[{position,title,length_ms}] 포함
GET    /api/releases                      artistId, type(ALBUM|SINGLE|EP|기타), page, size(기본 20). 정렬: releaseDate 내림차순 고정 (REL-03)
GET    /api/releases/:id                  트랙리스트·커버 포함 (REL-02)
POST   /api/artists/:id/follow            (인증)
DELETE /api/artists/:id/follow            (인증)
GET    /api/artists/following             (인증) 응답당 hasUpcomingConcert 포함. 마이페이지 MY-02 재사용
```

## 공연
```text
GET  /api/concerts                        dateFrom(YYYY-MM-DD), dateTo(YYYY-MM-DD), artistId, region,
                                          status(UPCOMING|ONGOING|ENDED|CANCELLED), page, size(기본 20)
                                          홈 "다가오는 공연": dateFrom={오늘}&size=6 재사용
GET  /api/concerts/stats                  year(int), month(int) → { "concertCount": N }
GET  /api/concerts/:id                    조회수 +1. 응답: isInCalendar, thumbnailUrl, posterUrls[], ticketLinks[{id,label,url}]
GET  /api/concerts/:id/setlist            → { "tracks": [{ "order": 1, "title": "곡명" }] }. 없으면 tracks:[]
GET  /api/concerts/popular                고정 건수 반환. 홈 캐러셀(상위 5건 FE 슬라이싱)·인기공연 섹션 재사용
GET  /api/concerts/following              (인증) 홈 "관심 아티스트 공연" 탭·공연 목록 필터 재사용
```

## 캘린더
```text
GET    /api/calendar                      year, month → [{ concertId, artistName, title, startDate, endDate, status, posterUrl, venue }]
GET    /api/calendar/my                   (인증) page, size(기본 10). /api/calendar와 동일 구조. 마이페이지 MY-03 재사용
POST   /api/calendar/:concertId           (인증)
DELETE /api/calendar/:concertId           (인증)
```

## 마이페이지
```text
GET  /api/my/history                      (인증) page, size(기본 10). 캘린더 저장 공연 중 startDate < 오늘
                                          → { id, artistName, title, startDate, endDate, venue, status }
```

## 데이터 문의
```text
POST /api/inquiries                       (인증) { type(ARTIST|CONCERT|SETLIST), targetId, title, content }
                                          동일 targetId PENDING 존재 시 409
GET  /api/inquiries/my                    (인증) page, size, status. admin_note → resultMessage(RESOLVED)/rejectReason(REJECTED) 분리 응답
GET  /api/inquiries/my/:id                (인증) 동일 분리 응답 구조
```

## 관리자 (ROLE_ADMIN)
```text
GET    /api/admin/review-queue
POST   /api/admin/review-queue/:id/approve
POST   /api/admin/review-queue/:id/reject
POST   /api/admin/artists
PUT    /api/admin/artists/:id
POST   /api/admin/concerts
PUT    /api/admin/concerts/:id            title·cast·날짜·장소·poster_url·price·예매처 링크. 상태 변경 불포함
DELETE /api/admin/concerts/:id            연관 데이터 cascade 삭제
PUT    /api/admin/concerts/:id/state      상태 강제 변경
GET    /api/admin/inquiries               type, status, page, size 필터
GET    /api/admin/inquiries/:id
PATCH  /api/admin/inquiries/:id/status    status(IN_PROGRESS|RESOLVED|REJECTED), rejectReason
```

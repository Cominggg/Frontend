# API Endpoints

Base: `/api`

## 인증
```text
GET    /api/auth/login/{provider}         provider: google|kakao
GET    /api/auth/callback/{provider}
POST   /api/auth/refresh
POST   /api/auth/logout                   (인증)
DELETE /api/auth/withdraw                 (인증)
GET    /api/auth/me                       (인증)
PUT    /api/auth/me                       (인증) multipart/form-data
```

## 아티스트
```text
GET    /api/artists                       name, genre, debutYear, page, size(기본 25)
GET    /api/artists/:id
GET    /api/artists/:id/concerts          tab: all|upcoming|past, page, size(기본 10)
GET    /api/artists/:id/releases          type: ALBUM|SINGLE|EP, page, size(기본 10)
POST   /api/artists/:id/follow            (인증)
DELETE /api/artists/:id/follow            (인증)
GET    /api/artists/following             (인증)
```

## 공연
```text
GET  /api/concerts                        date, artistId, region, page, size(기본 20)
GET  /api/concerts/:id
GET  /api/concerts/:id/setlist
GET  /api/concerts/popular
GET  /api/concerts/following              (인증)
```

## 캘린더
```text
GET    /api/calendar                      year, month
GET    /api/calendar/my                   (인증) page, size(기본 10)
POST   /api/calendar/:concertId           (인증)
DELETE /api/calendar/:concertId           (인증)
```

## 마이페이지
```text
GET  /api/my/history                      (인증) page, size(기본 10)
```

## 데이터 문의
```text
POST /api/inquiries                       (인증) type(ARTIST|CONCERT|SETLIST), targetId, title, content
GET  /api/inquiries/my                    (인증) page, size, status
GET  /api/inquiries/my/:id                (인증)
```

## 관리자 (ROLE_ADMIN)
```text
GET    /api/admin/review-queue
POST   /api/admin/review-queue/:id/approve
POST   /api/admin/review-queue/:id/reject
POST   /api/admin/artists
PUT    /api/admin/artists/:id
POST   /api/admin/concerts
PUT    /api/admin/concerts/:id/state
GET    /api/admin/inquiries
GET    /api/admin/inquiries/:id
PATCH  /api/admin/inquiries/:id/status
```

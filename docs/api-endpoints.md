# API Endpoints

Base: `/api`

## 인증
```
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/login/{provider}         provider: google|kakao
GET  /api/auth/callback/{provider}
```

## 아티스트
```
GET    /api/artists                     name, genre, debutYear, page, size
GET    /api/artists/:id
POST   /api/artists/:id/follow          (인증)
DELETE /api/artists/:id/follow          (인증)
```

## 공연
```
GET  /api/concerts                      date, artistId, region, page, size
GET  /api/concerts/:id
GET  /api/concerts/:id/setlist
GET  /api/concerts/popular
GET  /api/concerts/following            (인증)
```

## 캘린더
```
GET    /api/calendar                    year, month
GET    /api/calendar/my                 (인증)
POST   /api/calendar/:concertId         (인증)
DELETE /api/calendar/:concertId         (인증)
```

## 마이페이지
```
GET  /api/my/history                    (인증)
```

## 검색
```
GET  /api/search                        q, type(artist|concert|all)
```

## 데이터 문의
```
POST /api/inquiries                     (인증) type(ARTIST|CONCERT|SETLIST), targetId, title, content
GET  /api/inquiries/my                  (인증) page, size, status
GET  /api/inquiries/my/:id              (인증)
```

## 관리자 (ROLE_ADMIN)
```
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

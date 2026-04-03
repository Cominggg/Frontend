# 코드 컨벤션

## 파일 & 폴더 구조

```
src/
├── assets/               # 정적 파일 (이미지, 폰트)
├── components/           # 재사용 컴포넌트
│   ├── ui/               # 범용 UI (Button, Badge, Modal, Toast 등)
│   └── {feature}/        # 기능별 컴포넌트 (artist/, concert/, calendar/ 등)
├── pages/                # 라우트 단위 페이지 컴포넌트
├── hooks/                # 커스텀 훅
├── services/             # Axios 인스턴스 및 API 함수
├── stores/               # 전역 상태 (Zustand or Redux Toolkit)
├── utils/                # 순수 유틸 함수
└── constants/            # 상수 (배지 색상, 경로 등)
```

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `ArtistCard.jsx` |
| 훅 파일 | camelCase, `use` 접두사 | `useArtistList.js` |
| 일반 JS 파일 | camelCase | `formatDate.js` |
| CSS 모듈 | 컴포넌트명과 동일 | `ArtistCard.module.css` |
| 상수 | UPPER_SNAKE_CASE | `CONCERT_STATUS` |
| 이벤트 핸들러 prop | `on` 접두사 | `onFollow`, `onClick` |
| 이벤트 핸들러 함수 | `handle` 접두사 | `handleFollow`, `handleClick` |

## 컴포넌트 작성 규칙

```jsx
// 1. import 순서: 외부 라이브러리 → 내부 컴포넌트 → 훅 → 유틸/상수 → 스타일
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import ArtistCard from '@/components/artist/ArtistCard'
import Badge from '@/components/ui/Badge'
import { useArtistFollow } from '@/hooks/useArtistFollow'
import { formatDate } from '@/utils/formatDate'
import { CONCERT_STATUS_COLOR } from '@/constants/concert'
import styles from './ArtistDetail.module.css'

// 2. 컴포넌트는 함수 선언식으로 작성
function ArtistDetail({ artistId }) {
  // 2-1. 훅 호출 먼저
  const { data, isLoading } = useQuery(...)
  const { isFollowing, handleFollow } = useArtistFollow(artistId)

  // 2-2. 파생 상태·계산값
  const upcomingConcerts = data?.concerts.filter(...)

  // 2-3. 이벤트 핸들러
  function handleFollowClick() {
    handleFollow()
  }

  // 2-4. 조건부 렌더링 (early return)
  if (isLoading) return <SkeletonUI />

  // 2-5. JSX 반환
  return (
    <div className={styles.container}>
      ...
    </div>
  )
}

export default ArtistDetail
```

## Axios & API 호출

```js
// services/api.js — Axios 인스턴스 (interceptor 설정 포함)
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// request interceptor: Access Token 주입
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// response interceptor: 401 → refresh → 재시도 / 5xx → 토스트
api.interceptors.response.use(
  (response) => response,
  async (error) => { ... }
)

export default api
```

```js
// services/artist.js — 기능별 API 함수 모음
import api from './api'

export function fetchArtists(params) {
  return api.get('/artists', { params })
}

export function fetchArtistDetail(id) {
  return api.get(`/artists/${id}`)
}
```

## React Query 패턴

```js
// hooks/useArtistList.js
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchArtists } from '@/services/artist'

export function useArtistList(filters) {
  return useInfiniteQuery({
    queryKey: ['artists', filters],
    queryFn: ({ pageParam = 0 }) => fetchArtists({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
  })
}
```

- **queryKey**: `[도메인, 파라미터]` 형태 (`['artists', filters]`, `['concerts', id]`)
- 목록 조회: `useInfiniteQuery` (무한 스크롤)
- 단건 조회: `useQuery`
- 변이: `useMutation` + `onSuccess`에서 관련 쿼리 invalidate

## 전역 상태 (Zustand 확정 시 기준)

```js
// stores/authStore.js
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

export default useAuthStore
```

- 전역 상태 범위: **인증 정보**, **공통 필터값**
- 서버 데이터는 React Query로 관리 (전역 상태에 담지 않음)

## CSS

- **CSS Modules** 사용 (`컴포넌트명.module.css`)
- 클래스명: camelCase (`styles.cardTitle`)
- 전역 스타일: `src/index.css` (CSS 변수, 리셋, 타이포그래피)
- 인라인 스타일은 동적 값(배지 색상 등)에만 허용

```jsx
// 배지 색상처럼 동적인 경우만 인라인 허용
<span style={{ color: CONCERT_STATUS_COLOR[status] }}>{status}</span>
```

## 이미지 에러 처리

```jsx
// onError로 placeholder 대체 — 공통 패턴
<img
  src={posterUrl}
  alt={concertName}
  onError={(e) => { e.target.src = '/assets/poster-placeholder.png' }}
/>
```

## 비로그인 접근 처리

- 인증 필요 기능(팔로우, 캘린더 추가, 문의 등록): **페이지 이동 없이 로그인 모달** 표시
- 모달에 `redirect_uri`로 현재 URL 포함
- 페이지 단위 인증 보호: `PrivateRoute` 컴포넌트 사용

```jsx
// 비로그인 시 모달 트리거 패턴
function handleFollow() {
  if (!user) {
    openLoginModal({ redirectUri: location.pathname })
    return
  }
  // 팔로우 로직
}
```

## 조건부 렌더링

```jsx
// 단순 조건: && 사용
{isLoading && <SkeletonUI />}

// 분기: 삼항 연산자 사용
{isFollowing ? <UnfollowButton /> : <FollowButton />}

// 복잡한 분기: early return 또는 별도 변수
const content = isLoading ? <SkeletonUI /> : <ArtistCard data={data} />
```

## 상수 관리

```js
// constants/concert.js
export const CONCERT_STATUS_COLOR = {
  '공연예정': '#1565C0',
  '공연중':   '#2E7D32',
  '공연완료': '#757575',
  '공연취소': '#C62828',
}

// constants/routes.js
export const ROUTES = {
  HOME: '/',
  ARTISTS: '/artists',
  ARTIST_DETAIL: (id) => `/artists/${id}`,
  CONCERTS: '/concerts',
  CONCERT_DETAIL: (id) => `/concerts/${id}`,
  CALENDAR: '/calendar',
  SEARCH: '/search',
  MY: '/my',
  ADMIN: '/admin',
}
```

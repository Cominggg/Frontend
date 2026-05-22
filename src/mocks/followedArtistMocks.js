// TODO: API 연동 후 제거
export const MOCK_FOLLOWED_ARTISTS = new Set(['YOASOBI', 'Ado', 'King Gnu', 'RADWIMPS'])

// TODO: API 연동 후 제거 (관심 아티스트 팔로우 공연 — 로그인 상태일 때 홈에서 노출)
export const MOCK_FOLLOWED_CONCERTS = [
  {
    id: 1,
    posterUrl: null,
    artistName: 'YOASOBI',
    title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    startDate: '2025.08.15',
    endDate: '2025.08.16',
    venue: 'KSPO DOME, 서울',
    status: 'UPCOMING',
  },
  {
    id: 3,
    posterUrl: null,
    artistName: 'Ado',
    title: 'Ado WORLD TOUR "Hibana" in Seoul',
    startDate: '2025.06.21',
    endDate: null,
    venue: '고척스카이돔, 서울',
    status: 'UPCOMING',
  },
  {
    id: 4,
    posterUrl: null,
    artistName: 'King Gnu',
    title: 'King Gnu LIVE TOUR 2025',
    startDate: '2025.09.06',
    endDate: '2025.09.07',
    venue: '올림픽공원 체조경기장, 서울',
    status: 'UPCOMING',
  },
  {
    id: 5,
    posterUrl: null,
    artistName: 'RADWIMPS',
    title: 'RADWIMPS LIVE TOUR 2025',
    startDate: '2025.07.12',
    endDate: null,
    venue: '올림픽공원 체조경기장, 서울',
    status: 'UPCOMING',
  },
]

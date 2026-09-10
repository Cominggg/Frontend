export const MENTION_TYPE_OPTIONS = [
  { stage: 'type', type: 'CONCERT', label: '공연' },
  { stage: 'type', type: 'ARTIST', label: '아티스트' },
  { stage: 'type', type: 'RELEASE', label: '음악' },
]

const TYPE_LABEL_TO_TYPE = { 공연: 'CONCERT', 아티스트: 'ARTIST', 음악: 'RELEASE' }

// '/공연 vaundy' 형태의 슬래시 커맨드 쿼리를 단계별로 해석한다
// 1단계(type): 타입 선택 전 — 입력값으로 타입 목록을 좁혀 보여준다
// 2단계(search): '{타입} ' 뒤로 검색어를 입력하면 해당 타입 내에서 검색한다
export function parseSlashQuery(query) {
  const spaceIdx = query.indexOf(' ')
  if (spaceIdx === -1) return { stage: 'type', typeQuery: query }

  const typeToken = query.slice(0, spaceIdx)
  const type = TYPE_LABEL_TO_TYPE[typeToken]
  if (!type) return { stage: 'type', typeQuery: query }

  return { stage: 'search', type, searchTerm: query.slice(spaceIdx + 1) }
}

export function filterTypeOptions(typeQuery) {
  if (!typeQuery) return MENTION_TYPE_OPTIONS
  return MENTION_TYPE_OPTIONS.filter((o) => o.label.includes(typeQuery))
}

// TODO: API 연동 후 제거 — GET /api/mentions/search 배포 완료 시 실 API 호출로 교체
const MOCK_MENTION_MAP = {
  CONCERT: [
    { id: 1, title: '요네즈 켄시 KOREA LIVE 2026', subtitle: '2026.11.14 · KSPO DOME', thumbnailUrl: null },
    { id: 4, title: '아이묭 서울 단독 공연', subtitle: '2026.10.02 · 예스24 라이브홀', thumbnailUrl: null },
    { id: 7, title: '요루시카 아시아 투어', subtitle: '2026.12.05 · 올림픽공원 체조경기장', thumbnailUrl: null },
  ],
  ARTIST: [
    { id: 2, title: '요네즈 켄시', subtitle: null, thumbnailUrl: null },
    { id: 5, title: '아이묭', subtitle: null, thumbnailUrl: null },
    { id: 8, title: '요루시카', subtitle: null, thumbnailUrl: null },
  ],
  RELEASE: [
    { id: 3, title: 'LOST CORNER', subtitle: '요네즈 켄시', thumbnailUrl: null },
    { id: 6, title: 'BOOM BOOM', subtitle: '아이묭', thumbnailUrl: null },
    { id: 9, title: '幻燈', subtitle: '요루시카', thumbnailUrl: null },
  ],
}

export function searchMentions(type, term) {
  const pool = MOCK_MENTION_MAP[type] ?? []
  const q = term.trim().toLowerCase()
  const filtered = q ? pool.filter((item) => item.title.toLowerCase().includes(q)) : pool
  return filtered.slice(0, 10).map((item) => ({ stage: 'search', type, ...item }))
}

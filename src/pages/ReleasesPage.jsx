import { useState, useMemo } from 'react'

import ReleaseCard from '@/components/release/ReleaseCard'
import ReleaseCardSkeleton from '@/components/release/ReleaseCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import styles from './ReleasesPage.module.css'

// TODO: API 연동 후 제거
const MOCK_RELEASES = [
  { id: 1,  coverUrl: null, artistName: 'Kenshi Yonezu',    title: 'LOST CORNER',    type: 'ALBUM',  releaseDate: '2024.08.28' },
  { id: 2,  coverUrl: null, artistName: 'Mrs. GREEN APPLE', title: 'Soranji',        type: 'SINGLE', releaseDate: '2025.03.20' },
  { id: 3,  coverUrl: null, artistName: 'YOASOBI',          title: 'THE BOOK 4',     type: 'ALBUM',  releaseDate: '2025.02.15' },
  { id: 4,  coverUrl: null, artistName: 'ZUTOMAYO',         title: 'Lose',           type: 'SINGLE', releaseDate: '2025.01.30' },
  { id: 5,  coverUrl: null, artistName: 'Ado',              title: 'Hibana',         type: 'SINGLE', releaseDate: '2025.03.05' },
  { id: 6,  coverUrl: null, artistName: 'Official髭男dism', title: 'Subtitle II',    type: 'ALBUM',  releaseDate: '2025.02.28' },
  { id: 7,  coverUrl: null, artistName: 'King Gnu',         title: 'MIRROR',         type: 'ALBUM',  releaseDate: '2025.01.15' },
  { id: 8,  coverUrl: null, artistName: 'Eve',              title: 'Heart',          type: 'EP',     releaseDate: '2025.03.12' },
  { id: 9,  coverUrl: null, artistName: 'Aimer',            title: 'Blanc',          type: 'ALBUM',  releaseDate: '2024.11.27' },
  { id: 10, coverUrl: null, artistName: 'Fujii Kaze',       title: 'Grace',          type: 'ALBUM',  releaseDate: '2024.09.04' },
  { id: 11, coverUrl: null, artistName: 'Creepy Nuts',      title: 'Bling-Bang-Bang-Born', type: 'SINGLE', releaseDate: '2024.01.19' },
  { id: 12, coverUrl: null, artistName: 'ONE OK ROCK',      title: 'Luxury Disease', type: 'ALBUM',  releaseDate: '2022.09.09' },
]

const TYPE_FILTERS = ['전체', 'ALBUM', 'SINGLE', 'EP', '기타']
const MAIN_TYPES = ['ALBUM', 'SINGLE', 'EP']
const PAGE_SIZE = 20

function ReleasesPage() {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('전체')
  const [page, setPage] = useState(1)
  // TODO: React Query 연동 후 useQuery의 isLoading으로 교체
  const isLoading = false

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...MOCK_RELEASES]
      .filter((r) => {
        const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.artistName.toLowerCase().includes(q)
        const matchesType =
          selectedType === '전체' ||
          (selectedType === '기타' ? !MAIN_TYPES.includes(r.type) : r.type === selectedType)
        return matchesQuery && matchesType
      })
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
  }, [query, selectedType])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleTypeChange(type) {
    setSelectedType(type)
    setPage(1)
  }

  function handleQueryChange(e) {
    setQuery(e.target.value)
    setPage(1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>음악</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${filtered.length}건`}
          </p>
        </div>

        {/* 검색 */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="아티스트 또는 음반명 검색..."
            value={query}
            onChange={handleQueryChange}
            aria-label="음악 검색"
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => { setQuery(''); setPage(1) }}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 타입 필터 */}
        <div className={styles.filterBar} role="tablist" aria-label="음반 타입 필터">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={selectedType === t}
              className={`${styles.filterTab} ${selectedType === t ? styles.filterTabActive : ''}`}
              onClick={() => handleTypeChange(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ReleaseCardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <div className={styles.grid}>
            {paginated.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            }
            message="아직 수집된 음반 정보가 없습니다."
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <div className={styles.pagination} aria-label="페이지 네비게이션">
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="이전 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(n)}
                aria-current={n === page ? 'page' : undefined}
              >
                {n}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              aria-label="다음 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ReleasesPage

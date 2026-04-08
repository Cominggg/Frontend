import { useState, useMemo } from 'react'

import ArtistCard from '@/components/artist/ArtistCard'
import ArtistCardSkeleton from '@/components/artist/ArtistCardSkeleton'
import styles from './ArtistsPage.module.css'

// TODO: API 연동 후 제거
const MOCK_ARTISTS = [
  { id: 1,  name: 'YOASOBI',           imageUrl: null, genres: ['J-Pop', 'Anime'],       hasUpcomingConcert: true,  isFollowing: false },
  { id: 2,  name: 'Kenshi Yonezu',     imageUrl: null, genres: ['J-Pop', 'Rock'],         hasUpcomingConcert: true,  isFollowing: true  },
  { id: 3,  name: 'Ado',               imageUrl: null, genres: ['J-Pop', 'Anime'],        hasUpcomingConcert: true,  isFollowing: false },
  { id: 4,  name: 'King Gnu',          imageUrl: null, genres: ['J-Rock', 'Indie'],       hasUpcomingConcert: true,  isFollowing: false },
  { id: 5,  name: 'Official髭男dism',  imageUrl: null, genres: ['J-Pop', 'R&B'],          hasUpcomingConcert: false, isFollowing: false },
  { id: 6,  name: 'RADWIMPS',          imageUrl: null, genres: ['J-Rock', 'Anime'],       hasUpcomingConcert: true,  isFollowing: true  },
  { id: 7,  name: 'Mrs. GREEN APPLE',  imageUrl: null, genres: ['J-Pop', 'J-Rock'],       hasUpcomingConcert: true,  isFollowing: false },
  { id: 8,  name: 'Fujii Kaze',        imageUrl: null, genres: ['J-Pop', 'Soul'],         hasUpcomingConcert: true,  isFollowing: false },
  { id: 9,  name: 'ZUTOMAYO',          imageUrl: null, genres: ['J-Pop', 'Electronic'],   hasUpcomingConcert: true,  isFollowing: false },
  { id: 10, name: 'Creepy Nuts',       imageUrl: null, genres: ['Hip-Hop', 'J-Pop'],      hasUpcomingConcert: true,  isFollowing: false },
  { id: 11, name: 'ONE OK ROCK',       imageUrl: null, genres: ['J-Rock', 'Alternative'], hasUpcomingConcert: false, isFollowing: false },
  { id: 12, name: 'Eve',               imageUrl: null, genres: ['J-Pop', 'Anime'],        hasUpcomingConcert: false, isFollowing: false },
  { id: 13, name: 'Yorushika',         imageUrl: null, genres: ['Indie', 'J-Pop'],        hasUpcomingConcert: false, isFollowing: false },
  { id: 14, name: 'Aimer',             imageUrl: null, genres: ['J-Pop', 'Anime'],        hasUpcomingConcert: false, isFollowing: false },
  { id: 15, name: 'Aimyon',            imageUrl: null, genres: ['J-Pop', 'Indie'],        hasUpcomingConcert: false, isFollowing: false },
  { id: 16, name: 'mol-74',            imageUrl: null, genres: ['Indie', 'J-Rock'],       hasUpcomingConcert: false, isFollowing: false },
  { id: 17, name: 'syudou',            imageUrl: null, genres: ['J-Pop', 'Electronic'],   hasUpcomingConcert: false, isFollowing: false },
  { id: 18, name: 'back number',       imageUrl: null, genres: ['J-Rock', 'J-Pop'],       hasUpcomingConcert: false, isFollowing: false },
]

const ALL_GENRES = ['전체', 'J-Pop', 'J-Rock', 'Anime', 'Indie', 'Electronic', 'Hip-Hop', 'R&B', 'Soul', 'Alternative']

function ArtistsPage() {
  const [query, setQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('전체')
  // TODO: React Query 연동 후 useQuery의 isLoading으로 교체
  const isLoading = false

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_ARTISTS.filter((a) => {
      const matchesQuery = !q || a.name.toLowerCase().includes(q)
      const matchesGenre = selectedGenre === '전체' || a.genres.includes(selectedGenre)
      return matchesQuery && matchesGenre
    })
  }, [query, selectedGenre])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>아티스트</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${filtered.length}명`}
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
            placeholder="아티스트 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="아티스트 검색"
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 장르 필터 */}
        <div className={styles.genreBar} role="tablist" aria-label="장르 필터">
          {ALL_GENRES.map((genre) => (
            <button
              key={genre}
              role="tab"
              aria-selected={selectedGenre === genre}
              className={`${styles.genreTab} ${selectedGenre === genre ? styles.genreTabActive : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* 아티스트 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ArtistCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <p className={styles.emptyText}>검색 결과가 없습니다. 다른 검색어를 입력해 보세요.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default ArtistsPage

import { useState } from 'react'

import { searchDbArtists, addConcertArtist } from '@/services/adminApi'
import styles from './AddArtistModal.module.css'

function AddArtistModal({ concertId, onClose, onAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError('')
    try {
      const data = await searchDbArtists(query.trim(), { size: 10 })
      setResults(data.content ?? [])
    } catch {
      setError('아티스트 검색에 실패했습니다.')
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(artistId, artistName) {
    setAdding(true)
    setError('')
    try {
      await addConcertArtist(concertId, artistId)
      onAdded({ artistId, name: artistName })
      onClose()
    } catch (err) {
      const code = err.response?.data?.code
      setError(code === 'CONCERT_ARTIST_ALREADY_EXISTS' ? '이미 추가된 아티스트입니다.' : '추가에 실패했습니다.')
      setAdding(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.addModalHeader}>
          <h3 className={styles.addModalTitle}>아티스트 직접 지정</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="아티스트명 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.searchBtn} disabled={searching || !query.trim()}>
            {searching ? '검색 중...' : '검색'}
          </button>
        </form>
        {error && <p className={styles.addError}>{error}</p>}
        {results.length > 0 && (
          <ul className={styles.searchResults}>
            {results.map((a) => (
              <li key={a.id}>
                <button
                  className={styles.searchResultItem}
                  onClick={() => handleAdd(a.id, a.name)}
                  disabled={adding}
                >
                  <span className={styles.searchResultName}>{a.name}</span>
                  <span className={styles.searchResultId}>ID: {a.id}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {results.length === 0 && !searching && query && <p className={styles.noResults}>검색 결과가 없습니다.</p>}
      </div>
    </div>
  )
}

export default AddArtistModal

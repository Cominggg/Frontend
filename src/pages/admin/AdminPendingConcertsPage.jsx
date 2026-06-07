import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import Pagination from '@/components/ui/Pagination'
import { getArtists } from '@/services/artistApi'
import { getPendingConcerts, approveConcert, rejectConcert, addConcertArtist } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminPendingConcertsPage.module.css'

const MATCH_LABEL = { prfcast: '출연진', prfnm: '공연명', manual: '수동' }

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
      const data = await getArtists({ query: query.trim(), size: 10 })
      setResults(data.content ?? [])
    } catch {
      setError('아티스트 검색에 실패했습니다.')
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(artistId) {
    setAdding(true)
    setError('')
    try {
      await addConcertArtist(concertId, artistId)
      onAdded()
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
                  onClick={() => handleAdd(a.id)}
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

function ConcertCard({ concert, onRefresh }) {
  const [acting, setActing] = useState(null)
  const [showAddArtist, setShowAddArtist] = useState(false)

  async function handle(action, label) {
    setActing(label)
    try {
      await action(concert.id)
      onRefresh()
    } catch {
      setActing(null)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        {concert.posterUrl && (
          <img src={concert.posterUrl} alt={concert.title} className={styles.poster} />
        )}
        <div className={styles.cardInfo}>
          <h3 className={styles.concertTitle}>{concert.title}</h3>
          <p className={styles.concertMeta}>
            {concert.startDate}{concert.endDate && concert.endDate !== concert.startDate ? ` ~ ${concert.endDate}` : ''}
            {' · '}{concert.venueName}
          </p>
        </div>
      </div>

      <div className={styles.candidates}>
        <p className={styles.candidatesLabel}>후보 아티스트</p>
        {(concert.candidates ?? []).length === 0 ? (
          <p className={styles.noCandidates}>후보 없음</p>
        ) : (
          <ul className={styles.candidateList}>
            {(concert.candidates ?? []).map((c) => (
              <li key={c.artistId} className={styles.candidateItem}>
                <span className={styles.candidateName}>{c.name}</span>
                <span className={`${styles.matchBadge} ${styles[`match_${c.matchedBy}`]}`}>
                  {MATCH_LABEL[c.matchedBy] ?? c.matchedBy}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={styles.addArtistBtn}
          onClick={() => setShowAddArtist(true)}
        >
          + 아티스트 직접 지정
        </button>
      </div>

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.btnReject}
          disabled={!!acting}
          onClick={() => handle(rejectConcert, 'reject')}
        >
          {acting === 'reject' ? '처리 중...' : '거절'}
        </button>
        <button
          type="button"
          className={styles.btnApprove}
          disabled={!!acting}
          onClick={() => handle(approveConcert, 'approve')}
        >
          {acting === 'approve' ? '처리 중...' : '승인'}
        </button>
      </div>

      {showAddArtist && (
        <AddArtistModal
          concertId={concert.id}
          onClose={() => setShowAddArtist(false)}
          onAdded={onRefresh}
        />
      )}
    </div>
  )
}

function AdminPendingConcertsPage() {
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPendingConcerts({ page: page - 1, size: 10 })
      setConcerts(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setConcerts([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          대시보드
        </Link>
        <h1 className={styles.pageTitle}>PENDING 공연 검토 큐</h1>
        <p className={styles.pageDesc}>파이프라인이 수집·매칭한 PENDING 상태 공연을 검토합니다. 승인 시 날짜 기반으로 상태가 자동 계산됩니다.</p>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : concerts.length === 0 ? (
        <div className={styles.empty}><p className={styles.emptyText}>검토 대기 중인 공연이 없습니다.</p></div>
      ) : (
        <div className={styles.list}>
          {concerts.map((concert) => (
            <ConcertCard
              key={concert.id}
              concert={concert}
              onRefresh={() => {
                if (concerts.length === 1 && page > 1) setPage((p) => p - 1)
                else fetchPending()
              }}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default AdminPendingConcertsPage

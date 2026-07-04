import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import Pagination from '@/components/ui/Pagination'
import AddArtistModal from '@/components/concert/AddArtistModal'
import { getExcludedConcerts, updateConcertState, removeConcertArtist } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminExcludedConcertsPage.module.css'

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']

function ExcludedConcertCard({ concert, onRefresh, onRemoved }) {
  const [pendingStatus, setPendingStatus] = useState('UPCOMING')
  const [stateChanging, setStateChanging] = useState(false)
  const [stateMsg, setStateMsg] = useState('')
  const [showAddArtist, setShowAddArtist] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  async function handleStateChange() {
    setStateChanging(true)
    setStateMsg('')
    try {
      await updateConcertState(concert.id, { status: pendingStatus })
      onRemoved()
    } catch {
      setStateMsg('상태 변경에 실패했습니다.')
    } finally {
      setStateChanging(false)
    }
  }

  async function handleRemoveArtist(artistId) {
    setRemovingId(artistId)
    try {
      await removeConcertArtist(concert.id, artistId)
      onRefresh()
    } finally {
      setRemovingId(null)
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
          <Link
            to={ROUTES.ADMIN_CONCERT_EDIT(concert.id)}
            className={styles.editLink}
          >
            수정 →
          </Link>
        </div>
      </div>

      <div className={styles.artistSection}>
        <p className={styles.sectionLabel}>연결된 아티스트</p>
        {concert.artists.length === 0 ? (
          <p className={styles.noArtists}>연결된 아티스트 없음</p>
        ) : (
          <ul className={styles.artistList}>
            {concert.artists.map((a) => (
              <li key={a.artistId} className={styles.artistItem}>
                <span className={styles.artistName}>{a.name}</span>
                <span className={styles.artistId}>ID: {a.artistId}</span>
                <button
                  type="button"
                  className={styles.removeArtistBtn}
                  disabled={removingId === a.artistId}
                  onClick={() => handleRemoveArtist(a.artistId)}
                  aria-label={`${a.name} 연결 해제`}
                >
                  {removingId === a.artistId ? '...' : '×'}
                </button>
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

      <div className={styles.stateSection}>
        <p className={styles.sectionLabel}>상태 복원</p>
        <div className={styles.statusOptions}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.statusOption} ${pendingStatus === s ? styles.statusOptionActive : ''}`}
              onClick={() => setPendingStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className={styles.stateRow}>
          <button
            type="button"
            className={styles.btnStateChange}
            disabled={stateChanging}
            onClick={handleStateChange}
          >
            {stateChanging ? '변경 중...' : '상태 변경'}
          </button>
          {stateMsg && <span className={styles.stateMsg}>{stateMsg}</span>}
        </div>
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

function AdminExcludedConcertsPage() {
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchExcluded = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getExcludedConcerts({ page: page - 1, size: 10 })
      setConcerts(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setError(true)
      setConcerts([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchExcluded()
  }, [fetchExcluded])

  function handleConcertRemoved(concertId) {
    setConcerts((prev) => {
      const next = prev.filter((c) => c.id !== concertId)
      if (next.length === 0 && page > 1) setPage((p) => p - 1)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          대시보드
        </Link>
        <h1 className={styles.pageTitle}>EXCLUDED 공연 관리</h1>
        <p className={styles.pageDesc}>거절 처리된 공연에 아티스트를 직접 연결하거나 상태를 복원합니다.</p>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : error ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>목록을 불러오지 못했습니다.</p>
          <button type="button" className={styles.retryBtn} onClick={fetchExcluded}>다시 시도</button>
        </div>
      ) : concerts.length === 0 ? (
        <div className={styles.empty}><p className={styles.emptyText}>EXCLUDED 상태의 공연이 없습니다.</p></div>
      ) : (
        <div className={styles.list}>
          {concerts.map((concert) => (
            <ExcludedConcertCard
              key={concert.id}
              concert={concert}
              onRefresh={fetchExcluded}
              onRemoved={() => handleConcertRemoved(concert.id)}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default AdminExcludedConcertsPage

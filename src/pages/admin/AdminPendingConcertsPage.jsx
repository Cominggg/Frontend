import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import Pagination from '@/components/ui/Pagination'
import AppDatePicker from '@/components/ui/AppDatePicker'
import AddArtistModal from '@/components/concert/AddArtistModal'
import { getPendingConcerts, approveConcert, rejectConcert, removeConcertCandidate, addConcertCandidate } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminPendingConcertsPage.module.css'

const EMPTY_TICKET = { ticketOpenAt: '', bookingLinks: [] }

function BookingLinksEditor({ links, onChange }) {
  function add() { onChange([...links, { name: '', url: '' }]) }
  function remove(i) { onChange(links.filter((_, idx) => idx !== i)) }
  function update(i, key, value) {
    onChange(links.map((l, idx) => idx === i ? { ...l, [key]: value } : l))
  }

  return (
    <div className={styles.bookingLinks}>
      {links.map((link, i) => (
        <div key={i} className={styles.bookingLinkRow}>
          <input
            type="text"
            className={styles.linkInput}
            placeholder="예매처 이름 (예: 인터파크)"
            value={link.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <input
            type="url"
            className={styles.linkInput}
            placeholder="https://..."
            value={link.url}
            onChange={(e) => update(i, 'url', e.target.value)}
          />
          {link.url.trim() && (
            <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.linkOpenBtn} aria-label="새 탭에서 열기">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <button type="button" className={styles.linkRemoveBtn} onClick={() => remove(i)} aria-label="삭제">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" className={styles.linkAddBtn} onClick={add}>
        + 예매처 추가
      </button>
    </div>
  )
}

function ConcertCard({ concert, onRemoved, onCandidateRemoved, onCandidateAdded }) {
  const [acting, setActing] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [showAddArtist, setShowAddArtist] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [ticket, setTicket] = useState(EMPTY_TICKET)

  function setTicketField(key, value) {
    setTicket((prev) => ({ ...prev, [key]: value }))
  }

  function openApproveForm() {
    setTicket({
      ticketOpenAt: concert.ticketOpenAt ? concert.ticketOpenAt.slice(0, 16) : '',
      bookingLinks: concert.bookingLinks ?? [],
    })
    setApproveOpen(true)
  }

  function cancelApprove() {
    setApproveOpen(false)
    setTicket(EMPTY_TICKET)
  }

  async function handleReject() {
    setActing('reject')
    try {
      await rejectConcert(concert.id)
      onRemoved()
    } catch {
      setActing(null)
    }
  }

  async function handleRemoveArtist(artistId) {
    setRemovingId(artistId)
    try {
      await removeConcertCandidate(concert.id, artistId)
      onCandidateRemoved(artistId)
    } catch {
      // 제거 실패 시 로딩 상태만 복구
    } finally {
      setRemovingId(null)
    }
  }

  async function handleApproveConfirm() {
    setActing('approve')
    try {
      const body = {
        ticketOpenAt: ticket.ticketOpenAt ? `${ticket.ticketOpenAt}:00` : null,
        bookingLinks: ticket.bookingLinks.filter((l) => l.url.trim()),
      }
      await approveConcert(concert.id, body)
      onRemoved()
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
                <span className={styles.candidateName}><ArtistAliasName name={c.name} koreanName={c.koreanName} /></span>
                <button
                  type="button"
                  className={styles.candidateRemoveBtn}
                  disabled={removingId === c.artistId}
                  onClick={() => handleRemoveArtist(c.artistId)}
                  aria-label={`${c.koreanName ?? c.name} 제거`}
                >
                  {removingId === c.artistId ? '...' : '×'}
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

      {approveOpen && (
        <div className={styles.approveForm}>
          <p className={styles.approveFormTitle}>티켓 예매 정보 <span className={styles.optional}>(선택)</span></p>
          <div className={styles.approveFields}>
            <div className={styles.approveField}>
              <label className={styles.approveLabel}>예매 오픈 일시</label>
              <AppDatePicker
                value={ticket.ticketOpenAt}
                onChange={(v) => setTicketField('ticketOpenAt', v)}
                showTime
                placeholder="날짜 및 시간 선택"
              />
            </div>
            <div className={styles.approveField}>
              <label className={styles.approveLabel}>예매 링크</label>
              <BookingLinksEditor
                links={ticket.bookingLinks}
                onChange={(v) => setTicketField('bookingLinks', v)}
              />
            </div>
          </div>
          <div className={styles.approveFormActions}>
            <button
              type="button"
              className={styles.btnCancel}
              disabled={!!acting}
              onClick={cancelApprove}
            >
              취소
            </button>
            <button
              type="button"
              className={styles.btnApproveConfirm}
              disabled={!!acting}
              onClick={handleApproveConfirm}
            >
              {acting === 'approve' ? '처리 중...' : '승인 확정'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.btnReject}
          disabled={!!acting}
          onClick={handleReject}
        >
          {acting === 'reject' ? '처리 중...' : '거절'}
        </button>
        {!approveOpen && (
          <button
            type="button"
            className={styles.btnApprove}
            disabled={!!acting}
            onClick={openApproveForm}
          >
            승인
          </button>
        )}
      </div>

      {showAddArtist && (
        <AddArtistModal
          concertId={concert.id}
          onClose={() => setShowAddArtist(false)}
          onAdded={onCandidateAdded}
          addFn={addConcertCandidate}
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

  function handleConcertRemoved(concertId) {
    setConcerts((prev) => {
      const next = prev.filter((c) => c.id !== concertId)
      if (next.length === 0) {
        if (page > 1) setPage((p) => p - 1)
        setTotalPages((t) => Math.max(0, t - 1))
      }
      return next
    })
  }

  function handleCandidateRemoved(concertId, artistId) {
    setConcerts((prev) =>
      prev.map((c) =>
        c.id === concertId
          ? { ...c, candidates: (c.candidates ?? []).filter((ca) => ca.artistId !== artistId) }
          : c
      )
    )
  }

  function handleCandidateAdded(concertId, artist) {
    setConcerts((prev) =>
      prev.map((c) =>
        c.id === concertId
          ? { ...c, candidates: [...(c.candidates ?? []), artist] }
          : c
      )
    )
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
              onRemoved={() => handleConcertRemoved(concert.id)}
              onCandidateRemoved={(artistId) => handleCandidateRemoved(concert.id, artistId)}
              onCandidateAdded={(artist) => handleCandidateAdded(concert.id, artist)}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default AdminPendingConcertsPage

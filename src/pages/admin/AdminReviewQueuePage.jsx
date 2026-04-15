import { useState } from 'react'

import styles from './AdminReviewQueuePage.module.css'

// TODO: API 연동 후 제거
const MOCK_QUEUE = [
  {
    id: 1,
    concertTitle: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    concertDate: '2025.08.15',
    venue: 'KSPO DOME, 서울',
    kopisId: 'PF202401001',
    matchedArtist: { id: 1, name: 'YOASOBI', mbid: 'a1234567-89ab-cdef-0123-456789abcdef' },
    confidence: 'HIGH',
    status: 'PENDING',
    createdAt: '2025.04.12',
  },
  {
    id: 2,
    concertTitle: 'Ado WORLD TOUR "Hibana" in Seoul',
    concertDate: '2025.06.21',
    venue: '고척스카이돔, 서울',
    kopisId: 'PF202401002',
    matchedArtist: { id: 3, name: 'Ado', mbid: 'b2345678-89ab-cdef-0123-456789abcdef' },
    confidence: 'LOW',
    status: 'PENDING',
    createdAt: '2025.04.11',
  },
  {
    id: 3,
    concertTitle: 'RADWIMPS LIVE TOUR 2025',
    concertDate: '2025.07.12',
    venue: '올림픽공원 체조경기장, 서울',
    kopisId: 'PF202401003',
    matchedArtist: { id: 6, name: 'RADWIMPS', mbid: 'c3456789-89ab-cdef-0123-456789abcdef' },
    confidence: 'HIGH',
    status: 'PENDING',
    createdAt: '2025.04.10',
  },
  {
    id: 4,
    concertTitle: 'King Gnu LIVE TOUR 2025',
    concertDate: '2025.09.06',
    venue: '올림픽공원 체조경기장, 서울',
    kopisId: 'PF202401004',
    matchedArtist: { id: 4, name: 'King Gnu', mbid: 'd4567890-89ab-cdef-0123-456789abcdef' },
    confidence: 'HIGH',
    status: 'APPROVED',
    createdAt: '2025.04.09',
  },
  {
    id: 5,
    concertTitle: 'Mrs. GREEN APPLE ARENA TOUR 2025',
    concertDate: '2025.10.04',
    venue: 'KSPO DOME, 서울',
    kopisId: 'PF202401005',
    matchedArtist: { id: 7, name: 'Mrs. GREEN APPLE', mbid: 'e5678901-89ab-cdef-0123-456789abcdef' },
    confidence: 'LOW',
    status: 'REJECTED',
    createdAt: '2025.04.08',
  },
]

const STATUS_FILTERS = ['전체', 'PENDING', 'APPROVED', 'REJECTED']

const STATUS_LABEL = { PENDING: '대기 중', APPROVED: '승인됨', REJECTED: '거부됨' }
const CONFIDENCE_LABEL = { HIGH: 'HIGH', LOW: 'LOW' }

function AliasModal({ item, onClose, onSubmit }) {
  const [alias, setAlias] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!alias.trim()) return
    onSubmit(item.id, alias.trim())
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Alias 추가</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className={styles.modalSub}>
          <strong>{item.matchedArtist.name}</strong>의 KOPIS 표기명을 alias로 추가합니다.
        </p>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>
            KOPIS 표기명
            <input
              type="text"
              className={styles.formInput}
              placeholder="예: よあそび, Yo Asobi"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              autoFocus
            />
          </label>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>취소</button>
            <button type="submit" className={styles.btnPrimary} disabled={!alias.trim()}>추가</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdminReviewQueuePage() {
  const [items, setItems] = useState(MOCK_QUEUE)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [aliasTarget, setAliasTarget] = useState(null)

  const filtered = items.filter(
    (it) => statusFilter === '전체' || it.status === statusFilter
  )

  function handleApprove(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: 'APPROVED' } : it))
  }

  function handleReject(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: 'REJECTED' } : it))
  }

  function handleAliasSubmit(id, alias) {
    // TODO: POST /api/admin/review-queue/:id/approve + alias payload
    console.log('alias 추가:', id, alias)
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: 'APPROVED' } : it))
  }

  const pendingCount = items.filter((it) => it.status === 'PENDING').length

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>매칭 검토 큐</h1>
          <p className={styles.pageDesc}>KOPIS 공연과 MusicBrainz 아티스트 매칭 결과를 검토합니다.</p>
        </div>
        {pendingCount > 0 && (
          <span className={styles.pendingBadge}>{pendingCount}건 대기 중</span>
        )}
      </div>

      {/* 상태 필터 */}
      <div className={styles.filterBar} role="tablist" aria-label="상태 필터">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={statusFilter === f}
            className={`${styles.filterTab} ${statusFilter === f ? styles.filterTabActive : ''}`}
            onClick={() => setStatusFilter(f)}
          >
            {f === '전체' ? '전체' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>검토할 항목이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((item) => (
            <div key={item.id} className={styles.card}>
              {/* 상단: 신뢰도 + 상태 */}
              <div className={styles.cardMeta}>
                <span className={`${styles.confidenceBadge} ${styles[`confidence${item.confidence}`]}`}>
                  {CONFIDENCE_LABEL[item.confidence]}
                </span>
                <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                  {STATUS_LABEL[item.status]}
                </span>
                <span className={styles.cardDate}>{item.createdAt}</span>
              </div>

              {/* 공연 정보 */}
              <div className={styles.concertInfo}>
                <p className={styles.concertTitle}>{item.concertTitle}</p>
                <div className={styles.concertDetails}>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {item.concertDate}
                  </span>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.venue}
                  </span>
                  <span className={styles.kopisId}>KOPIS: {item.kopisId}</span>
                </div>
              </div>

              {/* 매칭 아티스트 */}
              <div className={styles.matchRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                </svg>
                <span className={styles.matchLabel}>매칭 아티스트:</span>
                <span className={styles.matchArtist}>{item.matchedArtist.name}</span>
                <span className={styles.matchMbid}>{item.matchedArtist.mbid}</span>
              </div>

              {/* 액션 버튼 */}
              {item.status === 'PENDING' && (
                <div className={styles.actions}>
                  <button
                    className={styles.btnApprove}
                    onClick={() => handleApprove(item.id)}
                  >
                    승인
                  </button>
                  <button
                    className={styles.btnAlias}
                    onClick={() => setAliasTarget(item)}
                  >
                    Alias 추가 후 승인
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => handleReject(item.id)}
                  >
                    거부
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {aliasTarget && (
        <AliasModal
          item={aliasTarget}
          onClose={() => setAliasTarget(null)}
          onSubmit={handleAliasSubmit}
        />
      )}
    </div>
  )
}

export default AdminReviewQueuePage

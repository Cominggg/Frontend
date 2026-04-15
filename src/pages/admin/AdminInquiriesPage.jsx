import { useState } from 'react'

import styles from './AdminInquiriesPage.module.css'

// TODO: API 연동 후 제거
const MOCK_INQUIRIES = [
  {
    id: 1,
    type: 'CONCERT',
    title: 'YOASOBI 공연 날짜가 잘못되었습니다',
    content: '2025.08.15 ~ 08.16로 되어 있는데, 실제로는 08.15 단일 공연입니다. 수정 부탁드립니다.',
    targetId: 1,
    targetName: 'YOASOBI ARENA TOUR 2025',
    status: 'PENDING',
    userEmail: 'user1@example.com',
    createdAt: '2025.04.12',
    adminNote: '',
  },
  {
    id: 2,
    type: 'ARTIST',
    title: 'Kenshi Yonezu 데뷔일 수정 요청',
    content: '데뷔일이 2012.02.29로 되어 있으나 2012.02.18이 정확합니다.',
    targetId: 2,
    targetName: 'Kenshi Yonezu',
    status: 'PENDING',
    userEmail: 'user2@example.com',
    createdAt: '2025.04.11',
    adminNote: '',
  },
  {
    id: 3,
    type: 'SETLIST',
    title: 'ZUTOMAYO 서울 공연 셋리스트 등록 요청',
    content: '2026.03.14 공연 셋리스트를 제보합니다. setlist.fm 링크 첨부합니다.',
    targetId: 8,
    targetName: 'ZUTOMAYO INTENSE II in Seoul',
    status: 'RESOLVED',
    userEmail: 'user3@example.com',
    createdAt: '2025.04.09',
    adminNote: '확인 후 셋리스트 등록 완료.',
  },
  {
    id: 4,
    type: 'CONCERT',
    title: 'Ado 공연 예매처 링크 오류',
    content: '인터파크 링크가 404 오류입니다. 수정 부탁드립니다.',
    targetId: 3,
    targetName: 'Ado WORLD TOUR "Hibana" in Seoul',
    status: 'REJECTED',
    userEmail: 'user4@example.com',
    createdAt: '2025.04.08',
    adminNote: '해당 공연은 인터파크 취급 없음. 원래 YES24만 제공됩니다.',
  },
  {
    id: 5,
    type: 'ARTIST',
    title: 'RADWIMPS 멤버 정보 오류',
    content: '멤버 정보가 누락되어 있습니다. 노다 요지로, 무카이 타쿠야, 야마구치 요우키, 미타케 가즈마가 정확합니다.',
    targetId: 6,
    targetName: 'RADWIMPS',
    status: 'PENDING',
    userEmail: 'user5@example.com',
    createdAt: '2025.04.07',
    adminNote: '',
  },
  {
    id: 6,
    type: 'CONCERT',
    title: 'King Gnu 공연 장소 수정',
    content: '올림픽공원 체조경기장이 아니라 KSPO DOME입니다.',
    targetId: 4,
    targetName: 'King Gnu LIVE TOUR 2025',
    status: 'PENDING',
    userEmail: 'user6@example.com',
    createdAt: '2025.04.06',
    adminNote: '',
  },
  {
    id: 7,
    type: 'CONCERT',
    title: '공연 가격 정보 미등록',
    content: 'Mrs. GREEN APPLE 공연 가격이 미정으로 나오는데 이미 공지되었습니다. 전석 143,000원입니다.',
    targetId: 6,
    targetName: 'Mrs. GREEN APPLE ARENA TOUR 2025',
    status: 'PENDING',
    userEmail: 'user7@example.com',
    createdAt: '2025.04.05',
    adminNote: '',
  },
]

const TYPE_LABEL = { CONCERT: '공연', ARTIST: '아티스트', SETLIST: '셋리스트' }
const STATUS_LABEL = { PENDING: '대기 중', RESOLVED: '처리완료', REJECTED: '반려' }
const STATUS_FILTERS = ['전체', 'PENDING', 'RESOLVED', 'REJECTED']
const TYPE_FILTERS = ['전체', 'CONCERT', 'ARTIST', 'SETLIST']

function DetailModal({ item, onClose, onResolve, onReject }) {
  const [note, setNote] = useState(item.adminNote)
  const [processing, setProcessing] = useState(false)

  function handle(action) {
    setProcessing(true)
    // TODO: PATCH /api/admin/inquiries/:id/status { status, adminNote: note }
    setTimeout(() => {
      action(item.id, note)
      onClose()
    }, 600)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <span className={`${styles.typeBadge} ${styles[`type${item.type}`]}`}>
              {TYPE_LABEL[item.type]}
            </span>
            <h2 className={styles.modalTitle}>{item.title}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <dl className={styles.modalMeta}>
          <div><dt>대상</dt><dd>{item.targetName}</dd></div>
          <div><dt>제출자</dt><dd>{item.userEmail}</dd></div>
          <div><dt>제출일</dt><dd>{item.createdAt}</dd></div>
        </dl>

        <div className={styles.contentBox}>
          <p className={styles.contentText}>{item.content}</p>
        </div>

        <label className={styles.noteLabel}>
          처리 메모
          <textarea
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="처리 내용 또는 반려 사유를 입력하세요."
            rows={3}
            disabled={item.status !== 'PENDING'}
          />
        </label>

        {item.status === 'PENDING' && (
          <div className={styles.modalActions}>
            <button
              className={styles.btnReject}
              disabled={processing}
              onClick={() => handle(onReject)}
            >
              반려
            </button>
            <button
              className={styles.btnResolve}
              disabled={processing}
              onClick={() => handle(onResolve)}
            >
              처리완료
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminInquiriesPage() {
  const [items, setItems] = useState(MOCK_INQUIRIES)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [selected, setSelected] = useState(null)

  const filtered = items.filter((it) => {
    const matchStatus = statusFilter === '전체' || it.status === statusFilter
    const matchType = typeFilter === '전체' || it.type === typeFilter
    return matchStatus && matchType
  })

  function handleResolve(id, note) {
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, status: 'RESOLVED', adminNote: note } : it)
    )
  }

  function handleReject(id, note) {
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, status: 'REJECTED', adminNote: note } : it)
    )
  }

  const pendingCount = items.filter((it) => it.status === 'PENDING').length

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>문의 관리</h1>
          <p className={styles.pageDesc}>사용자가 제출한 데이터 문의를 검토하고 처리합니다.</p>
        </div>
        {pendingCount > 0 && (
          <span className={styles.pendingBadge}>{pendingCount}건 미처리</span>
        )}
      </div>

      {/* 필터 */}
      <div className={styles.filters}>
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
        <div className={styles.typeBar}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.typeChip} ${typeFilter === f ? styles.typeChipActive : ''}`}
              onClick={() => setTypeFilter(f)}
            >
              {f === '전체' ? '전체' : TYPE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>해당 조건의 문의가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((item) => (
            <button
              key={item.id}
              className={styles.row}
              onClick={() => setSelected(item)}
            >
              <div className={styles.rowLeft}>
                <div className={styles.rowMeta}>
                  <span className={`${styles.typeBadge} ${styles[`type${item.type}`]}`}>
                    {TYPE_LABEL[item.type]}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  <span className={styles.rowDate}>{item.createdAt}</span>
                </div>
                <p className={styles.rowTitle}>{item.title}</p>
                <p className={styles.rowTarget}>{item.targetName}</p>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.rowChevron} aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onResolve={handleResolve}
          onReject={handleReject}
        />
      )}
    </div>
  )
}

export default AdminInquiriesPage

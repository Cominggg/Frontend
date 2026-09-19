import { useState } from 'react'
import { formatRelativeDate } from '@/utils/date'
import styles from './PinnedNotices.module.css'

// TODO: API 연동 후 제거 — noticeApi.js의 getPinnedNotices(GET /api/notices?limit=N)로 교체 (BE #123 완료 후)
const MOCK_PINNED_NOTICES = [
  {
    id: 1,
    title: '커뮤니티 이용 안내 및 신고 기능 오픈',
    content: '안녕하세요, 커밍입니다.\n\n커뮤니티를 더 안전하게 이용하실 수 있도록 게시글·댓글 신고 기능이 추가되었습니다. 다른 이용자에게 불편을 주는 게시물을 발견하시면 신고 기능을 이용해주세요.',
    createdAt: '2026-09-15T09:00:00',
  },
  {
    id: 2,
    title: '9월 정기 점검 안내',
    content: '보다 안정적인 서비스 제공을 위해 정기 점검을 진행합니다.\n\n일시: 2026-09-25 02:00 ~ 04:00\n점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
    createdAt: '2026-09-18T14:00:00',
  },
]

function PinnedNotices() {
  const [openId, setOpenId] = useState(null)
  const notices = MOCK_PINNED_NOTICES
  const openNotice = notices.find((n) => n.id === openId) ?? null

  if (notices.length === 0) return null

  return (
    <div className={styles.wrap}>
      {notices.map((notice) => (
        <button
          key={notice.id}
          type="button"
          className={styles.card}
          onClick={() => setOpenId(notice.id)}
        >
          <span className={styles.badge}>공지</span>
          <span className={styles.title}>{notice.title}</span>
          <span className={styles.date}>{formatRelativeDate(notice.createdAt)}</span>
        </button>
      ))}

      {openNotice && (
        <div className={styles.overlay} onClick={() => setOpenId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{openNotice.title}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setOpenId(null)}
                aria-label="닫기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className={styles.modalDate}>{formatRelativeDate(openNotice.createdAt)}</p>
            <p className={styles.modalContent}>{openNotice.content}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PinnedNotices

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { getInquiries, getPendingConcerts, triggerConcertCollect } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminPage.module.css'

const STATIC_CARDS = [
  {
    to: ROUTES.ADMIN_ARTIST_NEW,
    label: '아티스트 등록',
    desc: '새 아티스트를 직접 등록하거나 기존 정보를 수정합니다.',
    countKey: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_CONCERT_NEW,
    label: '공연 등록',
    desc: '새 공연을 수동 등록하거나 공연 상태를 강제 변경합니다.',
    countKey: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_PENDING_CONCERTS,
    label: 'PENDING 공연 검토',
    desc: '파이프라인이 수집·매칭한 PENDING 공연을 검토하고 승인 또는 거절합니다.',
    countKey: 'pendingConcerts',
    countLabel: '대기',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_INQUIRIES,
    label: '문의 관리',
    desc: '사용자가 제출한 데이터 문의를 조회하고 처리 상태를 변경합니다.',
    countKey: 'pendingInquiries',
    countLabel: '미처리',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

function AdminPage() {
  const [counts, setCounts] = useState({ pendingInquiries: null, pendingConcerts: null })
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    Promise.allSettled([
      getInquiries({ status: 'PENDING', size: 1 }),
      getPendingConcerts({ size: 1 }),
    ]).then(([inquiryResult, concertResult]) => {
      setCounts({
        pendingInquiries: inquiryResult.status === 'fulfilled' ? inquiryResult.value.totalElements : null,
        pendingConcerts: concertResult.status === 'fulfilled' ? concertResult.value.totalElements : null,
      })
    })
  }, [])

  async function handleTriggerConcertCollect() {
    setTriggering(true)
    setTriggerMsg('')
    try {
      await triggerConcertCollect()
      setTriggerMsg('공연 수집 트리거가 전송되었습니다.')
    } catch {
      setTriggerMsg('트리거 전송에 실패했습니다.')
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>Coming 관리자 콘솔에 오신 것을 환영합니다.</p>
      </div>

      <div className={styles.grid}>
        {STATIC_CARDS.map((card) => {
          const count = card.countKey ? counts[card.countKey] : null
          return (
            <Link key={card.to} to={card.to} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{card.icon}</div>
                {count != null && count > 0 && (
                  <span className={styles.cardBadge}>
                    {count} {card.countLabel}
                  </span>
                )}
              </div>
              <p className={styles.cardLabel}>{card.label}</p>
              <p className={styles.cardDesc}>{card.desc}</p>
              <div className={styles.cardArrow} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>

      <section className={styles.pipeline}>
        <h2 className={styles.pipelineTitle}>파이프라인 트리거</h2>
        <p className={styles.pipelineDesc}>Data 파이프라인에 수집을 직접 요청합니다. 비동기 처리되며 응답은 트리거 성공 여부만 나타냅니다.</p>
        <div className={styles.triggerRow}>
          <button
            type="button"
            className={styles.triggerBtn}
            onClick={handleTriggerConcertCollect}
            disabled={triggering}
          >
            {triggering ? '전송 중...' : 'KOPIS 공연 수집'}
          </button>
          {triggerMsg && <span className={styles.triggerMsg}>{triggerMsg}</span>}
        </div>
      </section>
    </div>
  )
}

export default AdminPage

import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './AdminPage.module.css'

const CARDS = [
  {
    to: ROUTES.ADMIN_ARTIST_NEW,
    label: '아티스트 등록',
    desc: '새 아티스트를 직접 등록하거나 기존 정보를 수정합니다.',
    count: null,
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
    count: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_INQUIRIES,
    label: '문의 관리',
    desc: '사용자가 제출한 데이터 문의를 조회하고 처리 상태를 변경합니다.',
    count: 7,
    countLabel: '미처리',
    urgent: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>Coming 관리자 콘솔에 오신 것을 환영합니다.</p>
      </div>

      <div className={styles.grid}>
        {CARDS.map((card) => (
          <Link key={card.to} to={card.to} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{card.icon}</div>
              {card.count != null && (
                <span className={`${styles.cardBadge} ${card.urgent ? styles.cardBadgeUrgent : ''}`}>
                  {card.count} {card.countLabel}
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
        ))}
      </div>
    </div>
  )
}

export default AdminPage

import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/date'
import styles from './ArtistConcertItem.module.css'

function ArtistConcertItem({ concert }) {
  const { id, title, startDate, endDate, venue, status } = concert
  const dateRange =
    endDate && endDate !== startDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : formatDate(startDate)

  return (
    <Link to={ROUTES.CONCERT_DETAIL(id)} className={styles.item}>
      <div className={styles.badgeCol}>
        <Badge status={status} />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dateRange}
          </span>
          <span className={styles.metaItem}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {venue}
          </span>
        </div>
      </div>
      <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  )
}

export default ArtistConcertItem

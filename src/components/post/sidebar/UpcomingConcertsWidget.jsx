import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { ROUTES } from '@/constants/routes'
import { getConcerts } from '@/services/concertApi'
import styles from './UpcomingConcertsWidget.module.css'

const UPCOMING_COUNT = 3

function formatShortDate(startDate) {
  const [, month, day] = startDate.split('-').map(Number)
  return `${month}.${String(day).padStart(2, '0')}`
}

function UpcomingConcertsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-concerts-sidebar'],
    queryFn: () => getConcerts({ status: 'UPCOMING', sort: 'startDate,asc', size: UPCOMING_COUNT }),
    staleTime: 5 * 60 * 1000,
  })

  const concerts = data?.content ?? []

  if (!isLoading && concerts.length === 0) return null

  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>다가오는 공연</h2>
      {isLoading ? (
        <div className={styles.widgetList}>
          {Array.from({ length: UPCOMING_COUNT }).map((_, i) => (
            <div key={i} className={styles.upcomingSkeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.widgetList}>
          {concerts.map((concert) => (
            <Link key={concert.id} to={ROUTES.CONCERT_DETAIL(concert.id)} className={styles.upcomingRow}>
              <span className={styles.upcomingDate}>{formatShortDate(concert.startDate)}</span>
              <span className={styles.upcomingInfo}>
                <span className={styles.upcomingTitle}>{concert.title}</span>
                <span className={styles.upcomingVenue}>{concert.venue}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingConcertsWidget

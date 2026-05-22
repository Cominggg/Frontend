import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './DayConcertList.module.css'

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const STATUS_COLORS = {
  UPCOMING:  '#1565C0',
  ONGOING:   '#2E7D32',
  ENDED:     '#757575',
  CANCELLED: '#C62828',
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DayConcertList({ selectedDate, events, onCalendarToggle }) {
  if (!selectedDate) return null

  const str = toDateStr(selectedDate)
  const dayEvents = events.filter(
    (ev) => ev.startDate <= str && str <= (ev.endDate || ev.startDate),
  )

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          <span className={styles.weekday}>{WEEKDAY_NAMES[selectedDate.getDay()]}요일</span>
        </h3>
        <span className={styles.count}>{dayEvents.length}건</span>
      </div>

      {dayEvents.length > 0 ? (
        <ul className={styles.list}>
          {dayEvents.map((ev) => {
            const statusColor = STATUS_COLORS[ev.status] ?? '#757575'
            const dateRange =
              ev.endDate && ev.endDate !== ev.startDate
                ? `${ev.startDate} ~ ${ev.endDate}`
                : ev.startDate

            return (
              <li key={ev.id}>
                <Link to={ROUTES.CONCERT_DETAIL(ev.concertId)} className={styles.item}>
                  <span className={styles.colorBar} style={{ backgroundColor: ev.color }} />

                  <div className={styles.poster}>
                    <img
                      src={ev.posterUrl || '/assets/poster-placeholder.png'}
                      alt={ev.title}
                      onError={(e) => {
                        e.target.src = '/assets/poster-placeholder.png'
                      }}
                    />
                  </div>

                  <div className={styles.info}>
                    <p className={styles.artist}>{ev.artistName}</p>
                    <p className={styles.concertTitle}>{ev.title}</p>
                    <p className={styles.meta}>
                      {dateRange}
                      <span className={styles.sep}>·</span>
                      {ev.venue}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <span
                      className={styles.badge}
                      style={{ color: statusColor, borderColor: statusColor }}
                    >
                      {ev.status}
                    </span>
                    <button
                      className={`${styles.calBtn} ${ev.inMyCalendar ? styles.calBtnAdded : ''}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCalendarToggle(ev) }}
                      aria-label={ev.inMyCalendar ? '내 캘린더에서 제거' : '내 캘린더에 추가'}
                    >
                      {ev.inMyCalendar ? <CheckIcon /> : <PlusIcon />}
                      <span>{ev.inMyCalendar ? '추가됨' : '내 캘린더'}</span>
                    </button>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>이 날의 공연이 없습니다.</p>
        </div>
      )}
    </div>
  )
}

export default DayConcertList

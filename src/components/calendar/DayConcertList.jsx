import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { CONCERT_STATUS_COLOR, CONCERT_STATUS_LABEL } from '@/constants/concert'
import styles from './DayConcertList.module.css'

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

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
  const dayEvents = events.filter((ev) => {
    if (ev.type === 'TICKETING') {
      return ev.ticketOpenAt?.split('T')[0] === str
    }
    return ev.startDate <= str && str <= (ev.endDate || ev.startDate)
  })

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
            const isTicketing = ev.type === 'TICKETING'
            const statusColor = CONCERT_STATUS_COLOR[ev.status] ?? '#757575'
            const statusLabel = CONCERT_STATUS_LABEL[ev.status] ?? ev.status
            const dateRange =
              ev.endDate && ev.endDate !== ev.startDate
                ? `${ev.startDate} ~ ${ev.endDate}`
                : ev.startDate

            return (
              <li key={`${ev.concertId}-${ev.type}`}>
                <Link to={ROUTES.CONCERT_DETAIL(ev.concertId)} className={styles.item}>
                  <span
                    className={styles.colorBar}
                    style={{
                      backgroundColor: isTicketing ? 'transparent' : ev.color,
                      borderLeft: isTicketing ? `3px dashed ${ev.color}` : undefined,
                    }}
                  />

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
                    {isTicketing ? (
                      <span className={styles.ticketingBadge}>예매 오픈</span>
                    ) : (
                      <span
                        className={styles.badge}
                        style={{ color: statusColor, borderColor: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    )}
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

import { useMemo } from 'react'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import { isSameDay } from '@/utils/date'
import styles from './CalendarGrid.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_VISIBLE = 2

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildWeeks(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())
  const end = new Date(lastDay)
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

  const weeks = []
  const cur = new Date(start)
  while (cur <= end) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function getTicketingDate(ticketOpenAt) {
  if (!ticketOpenAt) return null
  return ticketOpenAt.split('T')[0]
}

function getEventsForDay(events, date) {
  const str = toDateStr(date)
  return events.filter((ev) => {
    if (ev.type === 'TICKETING') {
      return getTicketingDate(ev.ticketOpenAt) === str
    }
    return ev.startDate <= str && str <= (ev.endDate || ev.startDate)
  })
}

function CalendarGrid({ year, month, events, selectedDate, onDayClick }) {
  const today = new Date()
  const weeks = useMemo(() => buildWeeks(year, month), [year, month])

  return (
    <div className={styles.grid}>
      {/* 요일 헤더 */}
      <div className={styles.header}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`${styles.headerCell} ${i === 0 ? styles.sun : ''} ${i === 6 ? styles.sat : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 주 행 */}
      {weeks.map((week, wi) => (
        <div key={wi} className={styles.weekRow}>
          {week.map((date, di) => {
            const isOther = date.getMonth() !== month
            const isToday = isSameDay(date, today)
            const isSel = selectedDate && isSameDay(date, selectedDate)
            const isSun = di === 0
            const isSat = di === 6
            const dayEvents = getEventsForDay(events, date)
            const visible = dayEvents.slice(0, MAX_VISIBLE)
            const hiddenCount = dayEvents.length - visible.length

            return (
              <div
                key={di}
                className={[
                  styles.cell,
                  isOther ? styles.cellOther : '',
                  isSel ? styles.cellSel : '',
                  isSun ? styles.sun : '',
                  isSat ? styles.sat : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onDayClick(date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onDayClick(date)}
                aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${dayEvents.length ? `, 공연 ${dayEvents.length}건` : ''}`}
                aria-pressed={!!isSel}
              >
                <span className={`${styles.num} ${isToday ? styles.numToday : ''}`}>
                  {date.getDate()}
                </span>

                <div className={styles.events}>
                  {visible.map((ev) => (
                    <div
                      key={`${ev.concertId}-${ev.type}`}
                      className={`${styles.pill} ${ev.type === 'TICKETING' ? styles.pillTicketing : ''}`}
                      style={{ '--pill-color': ev.color }}
                    >
                      {ev.type === 'TICKETING'
                        ? (
                          <svg className={styles.pillTicketIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-5V9z"/>
                          </svg>
                        )
                        : <span className={styles.pillDot} />
                      }
                      <span className={styles.pillText}><ArtistAliasName name={ev.artistName} koreanName={ev.artistKoreanName} /></span>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <span className={styles.more}>외 {hiddenCount}건</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default CalendarGrid

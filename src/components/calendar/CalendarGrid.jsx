import { useMemo } from 'react'

import styles from './CalendarGrid.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_VISIBLE = 2

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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

function getEventsForDay(events, date) {
  const str = toDateStr(date)
  return events.filter((ev) => ev.startDate <= str && str <= (ev.endDate || ev.startDate))
}

function CalendarGrid({ year, month, events, selectedDate, onDayClick }) {
  const today = useMemo(() => new Date(), [])
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
                      key={ev.id}
                      className={styles.pill}
                      style={{ '--pill-color': ev.color }}
                    >
                      <span className={styles.pillDot} />
                      <span className={styles.pillText}>{ev.artistName}</span>
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

import { useState, useMemo } from 'react'

import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayConcertList from '@/components/calendar/DayConcertList'
import { isSameDay } from '@/utils/date'
import styles from './CalendarPage.module.css'

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const PALETTE = ['#e11d48', '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#f97316', '#14b8a6', '#ec4899']

// TODO: Replace with React Query → GET /api/calendar?year=&month=
const MOCK_EVENTS = [
  { id: 1, concertId: 1, artistName: 'YOASOBI',          title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',                       startDate: '2025-08-15', endDate: '2025-08-16', status: '공연예정', posterUrl: null,                                                                                                                    venue: 'KSPO DOME, 서울' },
  { id: 2, concertId: 2, artistName: 'King Gnu',          title: 'King Gnu LIVE TOUR 2025',                                     startDate: '2025-08-06', endDate: '2025-08-07', status: '공연예정', posterUrl: null,                                                                                                                    venue: '올림픽공원 체조경기장, 서울' },
  { id: 3, concertId: 3, artistName: 'Ado',               title: 'Ado WORLD TOUR "Hibana" in Seoul',                            startDate: '2025-08-21', endDate: null,         status: '공연예정', posterUrl: null,                                                                                                                    venue: '고척스카이돔, 서울' },
  { id: 4, concertId: 4, artistName: 'RADWIMPS',          title: 'RADWIMPS LIVE TOUR 2025',                                     startDate: '2025-08-12', endDate: null,         status: '공연예정', posterUrl: null,                                                                                                                    venue: '올림픽공원 체조경기장, 서울' },
  { id: 5, concertId: 5, artistName: 'Creepy Nuts',       title: 'Creepy Nuts LIVE 2025 "2 Baddies"',                          startDate: '2025-08-30', endDate: null,         status: '공연예정', posterUrl: null,                                                                                                                    venue: '올림픽공원 체조경기장, 서울' },
  { id: 6, concertId: 6, artistName: 'Mrs. GREEN APPLE',  title: 'Mrs. GREEN APPLE TOUR 2025',                                 startDate: '2025-08-14', endDate: '2025-08-15', status: '공연예정', posterUrl: null,                                                                                                                    venue: 'KSPO DOME, 서울' },
  { id: 7, concertId: 7, artistName: 'Official髭男dism',  title: 'Official髭男dism one-man live tour 2025',                     startDate: '2025-08-28', endDate: '2025-08-30', status: '공연예정', posterUrl: null,                                                                                                                    venue: '인스파이어 아레나, 인천' },
  { id: 8, concertId: 8, artistName: 'ZUTOMAYO',          title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」in Seoul',         startDate: '2026-03-14', endDate: '2026-03-15', status: '공연완료', posterUrl: 'https://etbr-cms-site.s3.ap-northeast-1.amazonaws.com/zutomayo.net/share/intense2/ZUTOMAYO_SEOUL_2026031415.jpg', venue: '고려대학교 화정체육관, 서울' },
]

// TODO: Initialize from GET /api/calendar/my
const INITIAL_MY_CALENDAR_IDS = new Set([1, 3])

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState('all') // 'all' | 'my'
  const [myCalendarIds, setMyCalendarIds] = useState(INITIAL_MY_CALENDAR_IDS)

  // TODO: const { user } = useAuthStore()
  const isLoggedIn = false

  // 공연별 고정 색상 할당
  const colorMap = useMemo(() => {
    const map = {}
    let idx = 0
    MOCK_EVENTS.forEach((ev) => {
      if (!(ev.concertId in map)) map[ev.concertId] = PALETTE[idx++ % PALETTE.length]
    })
    return map
  }, [])

  const events = useMemo(() => {
    const enriched = MOCK_EVENTS.map((ev) => ({
      ...ev,
      color: colorMap[ev.concertId],
      inMyCalendar: myCalendarIds.has(ev.concertId),
    }))
    return viewMode === 'my' ? enriched.filter((ev) => ev.inMyCalendar) : enriched
  }, [viewMode, myCalendarIds, colorMap])

  const isViewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
    setSelectedDate(null)
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
    setSelectedDate(null)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(today)
  }

  function handleDayClick(date) {
    setSelectedDate((prev) => (prev && isSameDay(prev, date) ? null : date))
  }

  function handleViewMode(mode) {
    if (mode === 'my' && !isLoggedIn) {
      // TODO: openLoginModal({ redirectUri: '/calendar' })
      return
    }
    setViewMode(mode)
  }

  function handleCalendarToggle(ev) {
    if (!isLoggedIn) {
      // TODO: openLoginModal({ redirectUri: '/calendar' })
      return
    }
    // TODO: call POST /api/calendar/:concertId or DELETE /api/calendar/:concertId
    setMyCalendarIds((prev) => {
      const next = new Set(prev)
      if (next.has(ev.concertId)) next.delete(ev.concertId)
      else next.add(ev.concertId)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>캘린더</h1>
          <div className={styles.viewToggle} role="tablist" aria-label="캘린더 보기 선택">
            <button
              role="tab"
              aria-selected={viewMode === 'all'}
              className={`${styles.toggleBtn} ${viewMode === 'all' ? styles.toggleBtnActive : ''}`}
              onClick={() => handleViewMode('all')}
            >
              전체 공연
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'my'}
              className={`${styles.toggleBtn} ${viewMode === 'my' ? styles.toggleBtnActive : ''}`}
              onClick={() => handleViewMode('my')}
            >
              내 캘린더
            </button>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <div className={styles.monthNav}>
          <div className={styles.navControls}>
            <button className={styles.navBtn} onClick={prevMonth} aria-label="이전 달">
              <ChevronLeft />
            </button>
            <button className={styles.navBtn} onClick={nextMonth} aria-label="다음 달">
              <ChevronRight />
            </button>
            {!isViewingCurrentMonth && (
              <button className={styles.todayBtn} onClick={goToday}>
                오늘
              </button>
            )}
          </div>
          <h2 className={styles.monthTitle}>
            {year}년 {MONTH_NAMES[month]}
          </h2>
        </div>

        {/* 캘린더 그리드 */}
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />

        {/* 선택된 날짜 공연 목록 */}
        <DayConcertList
          selectedDate={selectedDate}
          events={events}
          onCalendarToggle={handleCalendarToggle}
        />

      </div>
    </div>
  )
}

export default CalendarPage

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayConcertList from '@/components/calendar/DayConcertList'
import { getCalendar, addToCalendar, removeFromCalendar } from '@/services/calendarApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { isSameDay } from '@/utils/date'
import usePageTitle from '@/hooks/usePageTitle'
import styles from './CalendarPage.module.css'

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const PALETTE = ['#e11d48', '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#f97316', '#14b8a6', '#ec4899']

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

  usePageTitle('캘린더 — Coming')

  const user = useAuthStore((s) => s.user)
  const isLoggedIn = !!user
  const openLoginModal = useLoginModalStore((s) => s.open)
  const queryClient = useQueryClient()

  const calendarMonth = month + 1 // API는 1-12, JS Date는 0-11

  const { data: rawEvents = [] } = useQuery({
    queryKey: ['calendar', year, calendarMonth],
    queryFn: () => getCalendar({ year, month: calendarMonth }),
  })

  const colorMap = useMemo(() => {
    const map = {}
    let idx = 0
    rawEvents.forEach((ev) => {
      if (!(ev.concertId in map)) map[ev.concertId] = PALETTE[idx++ % PALETTE.length]
    })
    return map
  }, [rawEvents])

  const events = useMemo(() => {
    const enriched = rawEvents.map((ev) => ({
      ...ev,
      color: colorMap[ev.concertId],
      inMyCalendar: ev.isInCalendar,
    }))
    return viewMode === 'my' ? enriched.filter((ev) => ev.inMyCalendar) : enriched
  }, [rawEvents, viewMode, colorMap])

  const isViewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  const toggleMutation = useMutation({
    mutationFn: ({ concertId, inCalendar }) =>
      inCalendar ? removeFromCalendar(concertId) : addToCalendar(concertId),
    onMutate: async ({ concertId, inCalendar }) => {
      await queryClient.cancelQueries({ queryKey: ['calendar', year, calendarMonth] })
      const prev = queryClient.getQueryData(['calendar', year, calendarMonth])
      queryClient.setQueryData(['calendar', year, calendarMonth], (old) =>
        (old ?? []).map((ev) =>
          ev.concertId === concertId ? { ...ev, isInCalendar: !inCalendar } : ev
        )
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['calendar', year, calendarMonth], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', year, calendarMonth] })
    },
  })

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
      openLoginModal({ redirectUri: '/calendar' })
      return
    }
    setViewMode(mode)
  }

  function handleCalendarToggle(ev) {
    if (!isLoggedIn) {
      openLoginModal({ redirectUri: '/calendar' })
      return
    }
    toggleMutation.mutate({ concertId: ev.concertId, inCalendar: ev.inMyCalendar })
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

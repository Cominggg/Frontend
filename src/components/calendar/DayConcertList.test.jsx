import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DayConcertList from './DayConcertList'

const SELECTED_DATE = new Date(2026, 8, 26) // 2026-09-26 (토)

function makeConcert(overrides = {}) {
  return {
    concertId: 1,
    type: 'CONCERT',
    title: 'YOASOBI ASIA TOUR 2026 in Seoul',
    artists: [{ artistId: 1, name: 'YOASOBI', koreanName: '요아소비' }],
    startDate: '2026-09-26',
    endDate: '2026-09-27',
    venue: 'KSPO DOME',
    status: 'UPCOMING',
    color: '#1565C0',
    posterUrl: 'https://example.com/posters/yoasobi.jpg',
    inMyCalendar: false,
    ...overrides,
  }
}

function renderList(props = {}) {
  return render(
    <MemoryRouter>
      <DayConcertList
        selectedDate={SELECTED_DATE}
        events={[]}
        onCalendarToggle={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('DayConcertList', () => {
  describe('렌더링 조건', () => {
    it('selectedDate가 없으면 아무것도 렌더하지 않음', () => {
      const { container } = renderList({ selectedDate: null, events: [makeConcert()] })

      expect(container).toBeEmptyDOMElement()
    })

    it('선택 날짜를 월·일·요일로 표시', () => {
      renderList()

      expect(screen.getByRole('heading', { name: /9월 26일\s*토요일/ })).toBeInTheDocument()
    })

    it('이벤트가 없으면 빈 상태 문구 표시', () => {
      renderList({ events: [] })

      expect(screen.getByText('이 날의 공연이 없습니다.')).toBeInTheDocument()
      expect(screen.getByText('0건')).toBeInTheDocument()
    })
  })

  describe('날짜 필터', () => {
    it.each([
      ['시작일', '2026-09-26', '2026-09-28'],
      ['기간 중간', '2026-09-25', '2026-09-27'],
      ['종료일', '2026-09-24', '2026-09-26'],
    ])('선택 날짜가 공연 %s이면 표시', (_, startDate, endDate) => {
      renderList({ events: [makeConcert({ startDate, endDate })] })

      expect(screen.getByRole('link', { name: /YOASOBI ASIA TOUR/ })).toBeInTheDocument()
    })

    it('endDate가 없으면 startDate 당일만 표시', () => {
      renderList({ events: [makeConcert({ startDate: '2026-09-26', endDate: null })] })

      expect(screen.getByRole('link', { name: /YOASOBI ASIA TOUR/ })).toBeInTheDocument()
    })

    it.each([
      ['이전에 끝난', '2026-09-20', '2026-09-25'],
      ['이후에 시작하는', '2026-09-27', '2026-09-28'],
    ])('선택 날짜 %s 공연은 제외', (_, startDate, endDate) => {
      renderList({ events: [makeConcert({ startDate, endDate })] })

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('이 날의 공연이 없습니다.')).toBeInTheDocument()
    })

    it('TICKETING은 공연 기간과 무관하게 ticketOpenAt 날짜가 같으면 표시', () => {
      renderList({
        events: [makeConcert({
          type: 'TICKETING',
          startDate: '2026-11-01',
          endDate: '2026-11-02',
          ticketOpenAt: '2026-09-26T20:00:00',
        })],
      })

      expect(screen.getByRole('link', { name: /YOASOBI ASIA TOUR/ })).toBeInTheDocument()
      expect(screen.getByText('티켓팅 오픈')).toBeInTheDocument()
    })

    it('TICKETING은 공연 기간에 포함돼도 ticketOpenAt 날짜가 다르면 제외', () => {
      renderList({
        events: [makeConcert({
          type: 'TICKETING',
          startDate: '2026-09-26',
          endDate: '2026-09-27',
          ticketOpenAt: '2026-09-01T20:00:00',
        })],
      })

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('해당 날짜 이벤트 건수를 표시', () => {
      renderList({
        events: [
          makeConcert({ concertId: 1 }),
          makeConcert({ concertId: 2, title: 'Ado WORLD TOUR 2026', artists: [{ artistId: 2, name: 'Ado' }] }),
          makeConcert({ concertId: 3, title: 'Aimer Live in Seoul', startDate: '2026-10-10', endDate: '2026-10-10' }),
        ],
      })

      expect(screen.getByText('2건')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(2)
    })

    it('항목 링크는 공연 상세 경로를 가리킴', () => {
      renderList({ events: [makeConcert({ concertId: 42 })] })

      expect(screen.getByRole('link', { name: /YOASOBI ASIA TOUR/ })).toHaveAttribute('href', '/concerts/42')
    })
  })

  describe('포스터', () => {
    it('posterUrl이 있으면 공연 제목을 alt로 lazy 로딩 이미지 렌더', () => {
      renderList({ events: [makeConcert()] })

      const img = screen.getByRole('img', { name: 'YOASOBI ASIA TOUR 2026 in Seoul' })
      expect(img).toHaveAttribute('src', 'https://example.com/posters/yoasobi.jpg')
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
    })

    it('posterUrl이 http KOPIS 주소면 https://kopis.or.kr 주소로 이미지 요청', () => {
      renderList({ events: [makeConcert({ posterUrl: 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF123456.jpg' })] })

      const img = screen.getByRole('img', { name: 'YOASOBI ASIA TOUR 2026 in Seoul' })
      expect(img).toHaveAttribute('src', 'https://kopis.or.kr/upload/pfmPoster/PF_PF123456.jpg')
    })

    it('posterUrl이 null이면 이미지를 렌더하지 않음', () => {
      renderList({ events: [makeConcert({ posterUrl: null })] })

      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('이미지 로드가 실패하면 이미지를 제거', () => {
      renderList({ events: [makeConcert()] })

      fireEvent.error(screen.getByRole('img', { name: 'YOASOBI ASIA TOUR 2026 in Seoul' }))

      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it.each([
      ['posterUrl이 null이면', { posterUrl: null }, false],
      ['이미지 로드가 실패하면', {}, true],
    ])('%s placeholder 이미지로 대체하지 않음', (_, overrides, triggerError) => {
      const { container } = renderList({ events: [makeConcert(overrides)] })

      if (triggerError) fireEvent.error(screen.getByRole('img'))

      expect(container.innerHTML).not.toContain('poster-placeholder')
    })
  })

  describe('캘린더 버튼', () => {
    it.each([
      [false, '내 캘린더에 추가'],
      [true, '내 캘린더에서 제거'],
    ])('inMyCalendar가 %s이면 aria-label은 %s', (inMyCalendar, label) => {
      renderList({ events: [makeConcert({ inMyCalendar })] })

      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })

    it('클릭하면 해당 이벤트로 onCalendarToggle 호출', async () => {
      const user = userEvent.setup()
      const onCalendarToggle = vi.fn()
      const concert = makeConcert()
      renderList({ events: [concert], onCalendarToggle })

      await user.click(screen.getByRole('button', { name: '내 캘린더에 추가' }))

      expect(onCalendarToggle).toHaveBeenCalledTimes(1)
      expect(onCalendarToggle).toHaveBeenCalledWith(concert)
    })
  })
})

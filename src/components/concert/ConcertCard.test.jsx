import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConcertCard from './ConcertCard'

function makeConcert(overrides = {}) {
  return {
    id: 1,
    posterUrl: 'https://example.com/poster/yoasobi.jpg',
    artists: [{ artistId: 1, name: 'YOASOBI' }],
    title: 'YOASOBI ASIA TOUR 2026 IN SEOUL',
    startDate: '2026-09-26',
    endDate: '2026-09-27',
    venue: 'KSPO DOME',
    status: 'UPCOMING',
    ticketOpenAt: null,
    averageRating: null,
    ...overrides,
  }
}

function renderCard(props) {
  return render(
    <MemoryRouter>
      <ConcertCard {...props} />
    </MemoryRouter>,
  )
}

describe('ConcertCard', () => {
  it('priority를 지정하지 않으면 포스터를 지연 로드', () => {
    const concert = makeConcert()
    renderCard({ concert })

    const poster = screen.getByRole('img', { name: concert.title })

    expect(poster).toHaveAttribute('loading', 'lazy')
    expect(poster).toHaveAttribute('fetchpriority', 'auto')
  })

  it('priority를 지정하면 포스터를 우선 로드', () => {
    const concert = makeConcert()
    renderCard({ concert, priority: true })

    const poster = screen.getByRole('img', { name: concert.title })

    expect(poster).toHaveAttribute('loading', 'eager')
    expect(poster).toHaveAttribute('fetchpriority', 'high')
  })

  it.each([false, true])('posterUrl이 없으면 priority가 %s여도 포스터 이미지 없음', (priority) => {
    const concert = makeConcert({ posterUrl: null })
    renderCard({ concert, priority })

    expect(screen.queryByRole('img', { name: concert.title })).not.toBeInTheDocument()
  })
})

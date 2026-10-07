import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import ConcertDetailPage from './ConcertDetailPage'
import { getConcert } from '@/services/concertApi'

vi.mock('@/services/concertApi', () => ({
  getConcert: vi.fn(),
  getConcertSetlist: vi.fn(),
}))
vi.mock('@/services/calendarApi', () => ({
  addToCalendar: vi.fn(),
  removeFromCalendar: vi.fn(),
}))

// 소개 이미지 로드 순서와 무관한 하위 컴포넌트는 자체 API 호출을 하므로 제외
vi.mock('@/components/rating/RatingSection', () => ({ default: () => null }))
vi.mock('@/components/post/RelatedPostsSection', () => ({ default: () => null }))
vi.mock('@/components/ui/InquiryModal', () => ({ default: () => null }))

const CONCERT_1 = {
  id: 1,
  title: 'YOASOBI ASIA TOUR 2026 in Seoul',
  posterUrl: 'https://example.com/posters/yoasobi.jpg',
  imageUrls: [
    'https://example.com/intro/yoasobi-1.jpg',
    'https://example.com/intro/yoasobi-2.jpg',
  ],
  artists: [{ artistId: 1, name: 'YOASOBI', koreanName: '요아소비' }],
  startDate: '2026-09-26',
  endDate: '2026-09-27',
  venue: 'KSPO DOME',
  status: 'UPCOMING',
  price: null,
  isInCalendar: false,
  ticketLinks: [],
  ticketOpenAt: null,
  averageRating: null,
  ratingCount: 0,
}

const CONCERT_2 = {
  ...CONCERT_1,
  id: 2,
  title: 'Ado WORLD TOUR 2026 in Seoul',
  posterUrl: 'https://example.com/posters/ado.jpg',
  imageUrls: ['https://example.com/intro/ado-1.jpg'],
  artists: [{ artistId: 2, name: 'Ado', koreanName: '아도' }],
}

const CONCERTS = { 1: CONCERT_1, 2: CONCERT_2 }

function ConcertNavigator() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/concerts/2')}>다른 공연으로 이동</button>
}

function renderPage(route = '/concerts/1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ConcertNavigator />
        <Routes>
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function mockConcert(overrides = {}) {
  getConcert.mockImplementation((id) => Promise.resolve({ ...CONCERTS[id], ...overrides }))
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ConcertDetailPage 소개 이미지 지연 렌더링', () => {
  it('포스터 load 전이면 소개 이미지 미렌더링', async () => {
    mockConcert()
    renderPage()

    await screen.findByRole('img', { name: 'YOASOBI' })

    expect(screen.queryByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` })).not.toBeInTheDocument()
  })

  it('포스터 load 전이면 소개 이미지가 없어도 빈 문구 미렌더링', async () => {
    mockConcert({ imageUrls: [] })
    renderPage()

    await screen.findByRole('img', { name: 'YOASOBI' })

    expect(screen.queryByText('공연 정보가 존재하지 않습니다')).not.toBeInTheDocument()
  })

  it('포스터가 load되면 소개 이미지 렌더링', async () => {
    mockConcert()
    renderPage()
    const poster = await screen.findByRole('img', { name: 'YOASOBI' })

    fireEvent.load(poster)

    expect(screen.getByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: `${CONCERT_1.title} 공연 정보 2` })).toBeInTheDocument()
  })

  it('포스터가 load되고 소개 이미지가 없으면 빈 문구 렌더링', async () => {
    mockConcert({ imageUrls: [] })
    renderPage()
    const poster = await screen.findByRole('img', { name: 'YOASOBI' })

    fireEvent.load(poster)

    expect(screen.getByText('공연 정보가 존재하지 않습니다')).toBeInTheDocument()
  })

  it('포스터 로드에 실패하면 플레이스홀더로 바뀌고 소개 이미지 즉시 렌더링', async () => {
    mockConcert()
    renderPage()
    const poster = await screen.findByRole('img', { name: 'YOASOBI' })

    fireEvent.error(poster)

    expect(screen.queryByRole('img', { name: 'YOASOBI' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` })).toBeInTheDocument()
  })

  it('posterUrl이 없으면 처음부터 소개 이미지 렌더링', async () => {
    mockConcert({ posterUrl: null })
    renderPage()

    expect(await screen.findByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` })).toBeInTheDocument()
  })

  it('소개 이미지에는 loading="lazy" 적용', async () => {
    mockConcert({ posterUrl: null })
    renderPage()

    const introImage = await screen.findByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` })

    expect(introImage).toHaveAttribute('loading', 'lazy')
  })

  it('다른 공연으로 이동하면 새 포스터 load 전까지 새 소개 이미지 미렌더링', async () => {
    const user = userEvent.setup()
    mockConcert()
    renderPage()
    fireEvent.load(await screen.findByRole('img', { name: 'YOASOBI' }))

    await user.click(screen.getByRole('button', { name: '다른 공연으로 이동' }))
    await screen.findByRole('img', { name: 'Ado' })

    expect(screen.queryByRole('img', { name: `${CONCERT_2.title} 공연 정보 1` })).not.toBeInTheDocument()
  })

  it('다른 공연으로 이동한 뒤 새 포스터가 load되면 새 소개 이미지 렌더링', async () => {
    const user = userEvent.setup()
    mockConcert()
    renderPage()
    fireEvent.load(await screen.findByRole('img', { name: 'YOASOBI' }))
    await user.click(screen.getByRole('button', { name: '다른 공연으로 이동' }))
    const newPoster = await screen.findByRole('img', { name: 'Ado' })

    fireEvent.load(newPoster)

    expect(screen.getByRole('img', { name: `${CONCERT_2.title} 공연 정보 1` })).toBeInTheDocument()
  })
})

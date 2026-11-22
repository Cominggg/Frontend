import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import ConcertDetailPage from './ConcertDetailPage'
import { getConcert, getConcertSetlist } from '@/services/concertApi'
import useAuthStore from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

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

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
})

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

describe('ConcertDetailPage KOPIS 이미지 주소', () => {
  it('posterUrl이 http KOPIS 주소면 https://kopis.or.kr 주소로 포스터 요청', async () => {
    mockConcert({ posterUrl: 'http://www.kopis.or.kr/upload/pfmPoster/PF_PF123456.jpg' })
    renderPage()

    const poster = await screen.findByRole('img', { name: 'YOASOBI' })

    expect(poster).toHaveAttribute('src', 'https://kopis.or.kr/upload/pfmPoster/PF_PF123456.jpg')
  })

  it('imageUrls가 http KOPIS 주소면 https://kopis.or.kr 주소로 소개 이미지 요청', async () => {
    mockConcert({ imageUrls: ['http://www.kopis.or.kr/upload/pfmIntroImage/PF_PF123456_0.jpg'] })
    renderPage()
    const poster = await screen.findByRole('img', { name: 'YOASOBI' })

    fireEvent.load(poster)

    expect(screen.getByRole('img', { name: `${CONCERT_1.title} 공연 정보 1` }))
      .toHaveAttribute('src', 'https://kopis.or.kr/upload/pfmIntroImage/PF_PF123456_0.jpg')
  })
})

describe('ConcertDetailPage 예매처 링크', () => {
  it('ticketLinks가 있으면 예매처 링크가 캘린더 버튼보다 문서 순서상 앞에 위치', async () => {
    mockConcert({ ticketLinks: [{ id: 1, label: '인터파크', url: 'https://tickets.example.com/yoasobi' }] })
    renderPage()

    const ticketLink = await screen.findByRole('link', { name: '인터파크' })
    const calendarButton = screen.getByRole('button', { name: '내 캘린더에 추가' })

    expect(ticketLink.compareDocumentPosition(calendarButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('ticketLinks가 비어 있으면 예매처 미렌더링', async () => {
    mockConcert({ ticketLinks: [] })
    renderPage()

    await screen.findByRole('heading', { name: CONCERT_1.title })

    expect(screen.queryByText('예매처')).not.toBeInTheDocument()
  })

  it('종료된 공연이면 ticketLinks가 있어도 예매처 미렌더링', async () => {
    mockConcert({
      status: 'ENDED',
      ticketLinks: [{ id: 1, label: '인터파크', url: 'https://tickets.example.com/yoasobi' }],
    })
    renderPage()

    await screen.findByRole('heading', { name: CONCERT_1.title })

    expect(screen.queryByText('예매처')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '인터파크' })).not.toBeInTheDocument()
  })

  it('ticketLinks가 비어 있어도 캘린더 버튼 렌더링', async () => {
    mockConcert({ ticketLinks: [] })
    renderPage()

    expect(await screen.findByRole('button', { name: '내 캘린더에 추가' })).toBeInTheDocument()
  })
})

describe('ConcertDetailPage 관리자 수정 링크', () => {
  function loginAs(role) {
    useAuthStore.setState({ user: { id: 1, nickname: '테스트유저', role }, accessToken: 'token', isInitialized: true })
  }

  it('ADMIN이면 관리자 수정 링크가 해당 공연 수정 경로로 연결', async () => {
    loginAs('ADMIN')
    mockConcert()
    renderPage()

    const editLink = await screen.findByRole('link', { name: '관리자 수정' })

    expect(editLink).toHaveAttribute('href', ROUTES.ADMIN_CONCERT_EDIT(1))
  })

  it('일반 사용자면 관리자 수정 링크 미렌더링', async () => {
    loginAs('USER')
    mockConcert()
    renderPage()

    await screen.findByRole('heading', { name: CONCERT_1.title })

    expect(screen.queryByRole('link', { name: '관리자 수정' })).not.toBeInTheDocument()
  })
})

describe('ConcertDetailPage 셋리스트 탭', () => {
  const SETLIST = {
    tracks: [
      { order: 1, title: '夜に駆ける' },
      { order: 2, title: 'アイドル' },
    ],
    sourceUrl: 'https://www.setlist.fm/setlist/yoasobi/2026/kspo-dome-seoul-korea-1234abcd.html',
  }
  const SETLIST_UNAVAILABLE = Object.assign(new Error('503'), {
    response: { status: 503, data: { code: 'SETLIST_TEMPORARILY_UNAVAILABLE' } },
  })

  async function openSetlistTab(user) {
    await user.click(await screen.findByRole('button', { name: '셋리스트' }))
  }

  it('로딩 중이면 불러오는 중 상태 표시', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockReturnValue(new Promise(() => {}))
    renderPage()

    await openSetlistTab(user)

    expect(screen.getByRole('status')).toHaveTextContent('셋리스트를 불러오는 중이에요...')
  })

  it('로딩 중이면 빈 셋리스트 문구 미렌더링', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockReturnValue(new Promise(() => {}))
    renderPage()

    await openSetlistTab(user)

    expect(screen.queryByText('아직 등록된 셋리스트가 없습니다.')).not.toBeInTheDocument()
  })

  it('조회에 실패하면 에러 문구와 다시 시도 버튼 표시', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockRejectedValue(SETLIST_UNAVAILABLE)
    renderPage()

    await openSetlistTab(user)

    expect(await screen.findByText('셋리스트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('조회에 실패하면 셋리스트 문의 버튼 미렌더링', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockRejectedValue(SETLIST_UNAVAILABLE)
    renderPage()

    await openSetlistTab(user)
    await screen.findByRole('button', { name: '다시 시도' })

    expect(screen.queryByRole('button', { name: '셋리스트 문의' })).not.toBeInTheDocument()
  })

  it('다시 시도를 클릭하면 셋리스트를 재요청', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockRejectedValue(SETLIST_UNAVAILABLE)
    renderPage()
    await openSetlistTab(user)
    const retryButton = await screen.findByRole('button', { name: '다시 시도' })
    getConcertSetlist.mockResolvedValue(SETLIST)

    await user.click(retryButton)

    expect(getConcertSetlist).toHaveBeenCalledTimes(2)
  })

  it('다시 시도 후 조회에 성공하면 트랙 목록 표시', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockRejectedValue(SETLIST_UNAVAILABLE)
    renderPage()
    await openSetlistTab(user)
    const retryButton = await screen.findByRole('button', { name: '다시 시도' })
    getConcertSetlist.mockResolvedValue(SETLIST)

    await user.click(retryButton)

    expect(await screen.findByText('夜に駆ける')).toBeInTheDocument()
    expect(screen.getByText('アイドル')).toBeInTheDocument()
  })

  it('트랙이 비어 있으면 빈 셋리스트 문구 표시', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue({ tracks: [], sourceUrl: null })
    renderPage()

    await openSetlistTab(user)

    expect(await screen.findByText('아직 등록된 셋리스트가 없습니다.')).toBeInTheDocument()
  })

  it('트랙이 비어 있으면 셋리스트 문의 버튼 렌더링', async () => {
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue({ tracks: [], sourceUrl: null })
    renderPage()

    await screen.findByRole('heading', { name: CONCERT_1.title })

    expect(await screen.findByRole('button', { name: '셋리스트 문의' })).toBeInTheDocument()
  })

  it('트랙이 있으면 순서대로 트랙 목록 표시', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue(SETLIST)
    renderPage()

    await openSetlistTab(user)

    const tracks = await screen.findAllByRole('listitem')
    expect(tracks).toHaveLength(2)
    expect(tracks[0]).toHaveTextContent('夜に駆ける')
    expect(tracks[1]).toHaveTextContent('アイドル')
  })

  it('트랙이 있으면 셋리스트 문의 버튼 렌더링', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue(SETLIST)
    renderPage()

    await openSetlistTab(user)
    await screen.findByText('夜に駆ける')

    expect(screen.getByRole('button', { name: '셋리스트 문의' })).toBeInTheDocument()
  })

  it('sourceUrl이 있으면 출처 링크가 sourceUrl로 연결', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue(SETLIST)
    renderPage()

    await openSetlistTab(user)

    expect(await screen.findByRole('link', { name: 'YOASOBI setlist on setlist.fm' }))
      .toHaveAttribute('href', SETLIST.sourceUrl)
  })

  it('sourceUrl이 null이면 출처 링크가 setlist.fm 홈으로 연결', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue({ ...SETLIST, sourceUrl: null })
    renderPage()

    await openSetlistTab(user)

    expect(await screen.findByRole('link', { name: 'YOASOBI setlist on setlist.fm' }))
      .toHaveAttribute('href', 'https://www.setlist.fm/')
  })

  it('출처 링크 rel에 nofollow 미포함', async () => {
    const user = userEvent.setup()
    mockConcert({ status: 'ENDED' })
    getConcertSetlist.mockResolvedValue(SETLIST)
    renderPage()

    await openSetlistTab(user)
    const sourceLink = await screen.findByRole('link', { name: 'YOASOBI setlist on setlist.fm' })

    expect(sourceLink.getAttribute('rel')).not.toMatch(/nofollow/)
  })

  it('종료되지 않은 공연이면 셋리스트 탭 미렌더링', async () => {
    mockConcert()
    renderPage()

    await screen.findByRole('heading', { name: CONCERT_1.title })

    expect(screen.queryByRole('button', { name: '셋리스트' })).not.toBeInTheDocument()
  })
})

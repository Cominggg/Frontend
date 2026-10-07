import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import ReleaseDetailPage from './ReleaseDetailPage'
import styles from './ReleaseDetailPage.module.css'
import { getRelease } from '@/services/releaseApi'

vi.mock('@/services/releaseApi', () => ({
  getRelease: vi.fn(),
}))

// 하이라이트와 무관한 하위 섹션은 자체 API 호출을 하므로 제외
vi.mock('@/components/rating/RatingSection', () => ({ default: () => null }))
vi.mock('@/components/post/RelatedPostsSection', () => ({ default: () => null }))

const TRACK_HIGHLIGHT_DURATION_MS = 2000

const RELEASE = {
  id: 10,
  artistId: 1,
  artistName: 'YOASOBI',
  artistKoreanName: '요아소비',
  title: 'THE BOOK',
  type: 'Album',
  releaseDate: '2021-01-06',
  coverUrl: null,
  totalTracks: 2,
  spotifyId: null,
  averageRating: null,
  ratingCount: 0,
  tracks: [
    { id: 101, position: 1, title: '夜に駆ける', lengthMs: 261000, spotifyId: null },
    { id: 102, position: 2, title: 'ハルジオン', lengthMs: 202000, spotifyId: null },
  ],
}

function HashNavigator() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/releases/10#track-101')}>트랙 A로 이동</button>
      <button onClick={() => navigate('/releases/10#track-102')}>트랙 B로 이동</button>
    </>
  )
}

function renderPage(route) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <HashNavigator />
        <Routes>
          <Route path="/releases/:id" element={<ReleaseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// 해시 딥링크의 앵커(id="track-{id}")가 하이라이트 대상의 공개 계약이다
function getTrackRow(title) {
  return screen.getByText(title).closest('[id^="track-"]')
}

async function expireHighlight() {
  await act(async () => {
    vi.advanceTimersByTime(TRACK_HIGHLIGHT_DURATION_MS)
  })
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  Element.prototype.scrollIntoView = vi.fn()
  getRelease.mockResolvedValue(RELEASE)
})

afterEach(() => {
  vi.useRealTimers()
  delete Element.prototype.scrollIntoView
  vi.clearAllMocks()
})

describe('ReleaseDetailPage 트랙 하이라이트', () => {
  it('#track-{id} 해시로 진입하면 해당 트랙 하이라이트', async () => {
    renderPage('/releases/10#track-101')

    expect(await screen.findByText('夜に駆ける')).toBeInTheDocument()
    expect(getTrackRow('夜に駆ける')).toHaveClass(styles.trackItemHighlight)
    expect(getTrackRow('ハルジオン')).not.toHaveClass(styles.trackItemHighlight)
  })

  it('하이라이트 후 2000ms가 지나면 하이라이트 해제', async () => {
    renderPage('/releases/10#track-101')
    await screen.findByText('夜に駆ける')

    await expireHighlight()

    expect(getTrackRow('夜に駆ける')).not.toHaveClass(styles.trackItemHighlight)
  })

  it('만료된 트랙 A에서 B로 갔다가 B 만료 전에 A로 돌아오면 A 다시 하이라이트', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage('/releases/10#track-101')
    await screen.findByText('夜に駆ける')
    await expireHighlight()
    await user.click(screen.getByRole('button', { name: '트랙 B로 이동' }))
    expect(getTrackRow('ハルジオン')).toHaveClass(styles.trackItemHighlight)

    await user.click(screen.getByRole('button', { name: '트랙 A로 이동' }))

    expect(getTrackRow('夜に駆ける')).toHaveClass(styles.trackItemHighlight)
  })
})

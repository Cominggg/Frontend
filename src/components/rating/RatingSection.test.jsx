import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RatingSection from './RatingSection'
import useAuthStore from '@/stores/authStore'

vi.mock('@/services/ratingApi', () => ({
  getMyConcertRating: vi.fn(),
  rateConcert: vi.fn(),
  getMyReleaseRating: vi.fn(),
  rateRelease: vi.fn(),
}))

function renderSection(props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RatingSection entityType="CONCERT" entityId={1} average={4.5} count={120} {...props} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
})

describe('RatingSection', () => {
  describe('disabledMessage', () => {
    it('canRate가 false이면 disabledMessage 표시', () => {
      renderSection({ embedded: true, canRate: false, disabledMessage: '공연 종료 후 별점을 남길 수 있어요' })

      expect(screen.getByText('공연 종료 후 별점을 남길 수 있어요')).toBeInTheDocument()
    })
  })
})

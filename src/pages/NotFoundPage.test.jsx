import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'
import { ROUTES } from '@/constants/routes'

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
}

describe('NotFoundPage', () => {
  it('렌더링하면 제목을 heading으로 표시', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toBeInTheDocument()
  })

  it.each([
    ['홈으로 돌아가기', ROUTES.HOME],
    ['공연 목록 보기', ROUTES.CONCERTS],
  ])('렌더링하면 %s 링크가 %s로 연결', (name, href) => {
    renderPage()

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  })
})

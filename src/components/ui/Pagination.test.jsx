import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import Pagination from './Pagination'

function LocationDisplay() {
  const { pathname, search } = useLocation()
  return <output aria-label="현재 위치">{`${pathname}${search}`}</output>
}

function renderPagination(props, { route = '/concerts?status=UPCOMING&page=2' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/concerts"
          element={(
            <>
              <Pagination {...props} />
              <LocationDisplay />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Pagination', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pageParam이 없으면 페이지 컨트롤을 버튼으로 렌더링', () => {
    renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn() })

    expect(screen.getByRole('button', { name: '3페이지' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  describe('pageParam 지정', () => {
    it('페이지 번호를 링크로 렌더링', () => {
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' })

      expect(screen.getAllByRole('link', { name: /^\d+페이지$/ })).toHaveLength(10)
    })

    it('이전·다음 페이지를 링크로 렌더링', () => {
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' })

      expect(screen.getByRole('link', { name: '이전 페이지' })).toHaveAttribute('href', '/concerts?status=UPCOMING')
      expect(screen.getByRole('link', { name: '다음 페이지' })).toHaveAttribute('href', '/concerts?status=UPCOMING&page=3')
    })

    it('기존 쿼리 파라미터를 유지하면서 page만 교체', () => {
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' })

      expect(screen.getByRole('link', { name: '5페이지' })).toHaveAttribute('href', '/concerts?status=UPCOMING&page=5')
    })

    it('1페이지 링크면 page 파라미터 제거', () => {
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' })

      expect(screen.getByRole('link', { name: '1페이지' })).toHaveAttribute('href', '/concerts?status=UPCOMING')
    })

    it('다른 파라미터가 없을 때 1페이지 링크면 현재 경로', () => {
      renderPagination(
        { currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' },
        { route: '/concerts?page=2' },
      )

      expect(screen.getByRole('link', { name: '1페이지' })).toHaveAttribute('href', '/concerts')
    })

    it('1페이지면 이전 페이지는 비활성 버튼', () => {
      renderPagination(
        { currentPage: 1, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' },
        { route: '/concerts' },
      )

      expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
      expect(screen.queryByRole('link', { name: '이전 페이지' })).not.toBeInTheDocument()
    })

    it('마지막 페이지면 다음 페이지는 비활성 버튼', () => {
      renderPagination(
        { currentPage: 12, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' },
        { route: '/concerts?page=12' },
      )

      expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled()
      expect(screen.queryByRole('link', { name: '다음 페이지' })).not.toBeInTheDocument()
    })

    it('링크를 클릭하면 onPageChange 호출', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange, pageParam: 'page' })

      await user.click(screen.getByRole('link', { name: '3페이지' }))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('링크를 클릭하면 URL 이동 없이 현재 화면 유지', async () => {
      const user = userEvent.setup()
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange: vi.fn(), pageParam: 'page' })

      await user.click(screen.getByRole('link', { name: '3페이지' }))

      expect(screen.getByRole('status', { name: '현재 위치' })).toHaveTextContent('/concerts?status=UPCOMING&page=2')
    })

    it.each([
      ['Control'],
      ['Meta'],
      ['Shift'],
      ['Alt'],
    ])('%s 키를 누른 채 클릭하면 onPageChange 호출 안 함', async (key) => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 2, totalPages: 12, onPageChange, pageParam: 'page' })

      await user.keyboard(`{${key}>}`)
      await user.click(screen.getByRole('link', { name: '3페이지' }))
      await user.keyboard(`{/${key}}`)

      expect(onPageChange).not.toHaveBeenCalled()
    })
  })
})

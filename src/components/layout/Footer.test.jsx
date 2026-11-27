import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it.each([
    ['서비스 이용약관', '/terms'],
    ['개인정보처리방침', '/privacy'],
    ['운영정책', '/operation-policy'],
    ['데이터 출처', '/credits'],
    ['회원 탈퇴 안내', '/account/delete'],
    ['문의', 'mailto:coming0626@gmail.com'],
  ])('정책 링크에 %s 링크가 있으면 %s로 연결', (name, href) => {
    renderFooter()

    const nav = screen.getByRole('navigation', { name: '정책 링크' })

    expect(within(nav).getByRole('link', { name })).toHaveAttribute('href', href)
  })

  it('공식 채널의 디스코드 링크는 새 탭으로 열림', () => {
    renderFooter()

    const nav = screen.getByRole('navigation', { name: '공식 채널' })
    const link = within(nav).getByRole('link', { name: /디스코드/ })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

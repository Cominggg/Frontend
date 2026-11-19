import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CreditsPage from './CreditsPage'

describe('CreditsPage', () => {
  it('렌더링하면 데이터 출처 제목 표시', () => {
    render(<CreditsPage />)

    expect(screen.getByRole('heading', { level: 1, name: '데이터 출처' })).toBeInTheDocument()
  })

  it('렌더링하면 KOPIS 공식 출처 문구 표시', () => {
    render(<CreditsPage />)

    expect(
      screen.getByText('출처: (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr)'),
    ).toBeInTheDocument()
  })

  it('렌더링하면 제공처 링크 4개가 순서대로 각 주소로 연결', () => {
    render(<CreditsPage />)

    const links = within(screen.getByRole('list')).getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(links[0]).toHaveAccessibleName('KOPIS')
    expect(links[0]).toHaveAttribute('href', 'https://www.kopis.or.kr')
    // 로고만 있는 링크라 aria-label로 이름을 준다
    expect(links[1]).toHaveAccessibleName('Spotify')
    expect(within(links[1]).getAllByAltText('Spotify')).toHaveLength(2)
    expect(links[1]).toHaveAttribute('href', 'https://www.spotify.com')
    expect(links[2]).toHaveAccessibleName('setlist.fm')
    expect(links[2]).toHaveAttribute('href', 'https://www.setlist.fm/')
    expect(links[3]).toHaveAccessibleName('MusicBrainz')
    expect(links[3]).toHaveAttribute('href', 'https://musicbrainz.org')
  })

  it('렌더링하면 모든 제공처 링크가 새 탭·noopener로 열림', () => {
    render(<CreditsPage />)

    within(screen.getByRole('list'))
      .getAllByRole('link')
      .forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
  })

  it('setlist.fm 링크이면 rel에 nofollow 미포함', () => {
    render(<CreditsPage />)

    const link = screen.getByRole('link', { name: 'setlist.fm' })

    expect(link.getAttribute('rel')).not.toMatch(/nofollow/)
  })

  it('MusicBrainz 항목이면 CC0 라이선스 표기', () => {
    render(<CreditsPage />)

    const item = screen.getByRole('link', { name: 'MusicBrainz' }).closest('li')

    expect(within(item).getByText(/\(CC0\)/)).toBeInTheDocument()
    expect(within(item).queryByText(/CC BY-NC-SA/)).not.toBeInTheDocument()
  })
})

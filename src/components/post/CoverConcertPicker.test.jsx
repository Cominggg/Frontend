import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoverConcertPicker from './CoverConcertPicker'

const CONCERTS = [
  { entityType: 'CONCERT', entityId: 1, title: 'YOASOBI ASIA TOUR 2026', thumbnailUrl: null },
  { entityType: 'CONCERT', entityId: 2, title: 'Ado WORLD TOUR 2026', thumbnailUrl: 'https://example.com/ado.jpg' },
]

describe('CoverConcertPicker', () => {
  it('대표 공연 그룹으로 공연 라디오를 표시', () => {
    render(<CoverConcertPicker concerts={CONCERTS} selectedId={null} onSelect={vi.fn()} />)

    const group = screen.getByRole('group', { name: '대표 공연' })

    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  it('selectedId가 null이면 첫 공연이 선택됨', () => {
    render(<CoverConcertPicker concerts={CONCERTS} selectedId={null} onSelect={vi.fn()} />)

    expect(screen.getByRole('radio', { name: 'YOASOBI ASIA TOUR 2026' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' })).not.toBeChecked()
  })

  it('selectedId가 있으면 해당 공연이 선택됨', () => {
    render(<CoverConcertPicker concerts={CONCERTS} selectedId={2} onSelect={vi.fn()} />)

    expect(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'YOASOBI ASIA TOUR 2026' })).not.toBeChecked()
  })

  it('다른 공연을 클릭하면 onSelect에 entityId 전달', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CoverConcertPicker concerts={CONCERTS} selectedId={null} onSelect={onSelect} />)

    await user.click(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' }))

    expect(onSelect).toHaveBeenCalledWith(2)
  })
})

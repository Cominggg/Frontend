import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FORMAT_OPTIONS } from './mentionSearch'
import SlashCommandMenu from './SlashCommandMenu'

const [HEADING2, HEADING3, BULLET] = FORMAT_OPTIONS
const ITEMS = [HEADING2, HEADING3, BULLET]

function renderMenu(items = ITEMS) {
  const ref = createRef()
  const command = vi.fn()
  render(<SlashCommandMenu ref={ref} items={items} command={command} />)
  return { ref, command }
}

function pressKey(ref, key) {
  let handled
  act(() => {
    handled = ref.current.onKeyDown({ event: { key } })
  })
  return handled
}

describe('SlashCommandMenu', () => {
  it('서식 그룹 라벨과 항목 표시', () => {
    renderMenu()

    expect(screen.getByText('서식')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('항목을 클릭하면 command에 항목 전달', async () => {
    const user = userEvent.setup()
    const { command } = renderMenu()

    await user.click(screen.getByRole('button', { name: /작은 소제목/ }))

    expect(command).toHaveBeenCalledWith(HEADING3)
  })

  it('Enter를 누르면 첫 항목으로 command 호출', () => {
    const { ref, command } = renderMenu()

    pressKey(ref, 'Enter')

    expect(command).toHaveBeenCalledWith(HEADING2)
  })

  it('ArrowDown 후 Enter면 다음 항목 선택', () => {
    const { ref, command } = renderMenu()

    pressKey(ref, 'ArrowDown')
    pressKey(ref, 'Enter')

    expect(command).toHaveBeenCalledWith(HEADING3)
  })

  it('마지막에서 ArrowDown을 누르면 처음으로 순환', () => {
    const { ref, command } = renderMenu()

    pressKey(ref, 'ArrowDown')
    pressKey(ref, 'ArrowDown')
    pressKey(ref, 'ArrowDown')
    pressKey(ref, 'Enter')

    expect(command).toHaveBeenCalledWith(HEADING2)
  })

  it('처음에서 ArrowUp을 누르면 마지막으로 순환', () => {
    const { ref, command } = renderMenu()

    pressKey(ref, 'ArrowUp')
    pressKey(ref, 'Enter')

    expect(command).toHaveBeenCalledWith(BULLET)
  })

  it('항목에 마우스를 올린 뒤 Enter면 그 항목 선택', async () => {
    const user = userEvent.setup()
    const { ref, command } = renderMenu()

    await user.hover(screen.getByRole('button', { name: /글머리 목록/ }))
    pressKey(ref, 'Enter')

    expect(command).toHaveBeenCalledWith(BULLET)
  })

  it('처리하지 않는 키면 false 반환', () => {
    const { ref } = renderMenu()

    expect(pressKey(ref, 'a')).toBe(false)
  })

  it('항목이 없으면 맞는 서식이 없어요 표시', () => {
    renderMenu([])

    expect(screen.getByText('맞는 서식이 없어요')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('항목이 없으면 키 입력에 false 반환', () => {
    const { ref, command } = renderMenu([])

    expect(pressKey(ref, 'Enter')).toBe(false)
    expect(command).not.toHaveBeenCalled()
  })
})

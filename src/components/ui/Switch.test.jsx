import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Switch from './Switch'

describe('Switch', () => {
  it('checked 상태를 aria-checked로 노출', () => {
    render(<Switch checked ariaLabel="알림 받기" onChange={() => {}} />)

    expect(screen.getByRole('switch', { name: '알림 받기' })).toHaveAttribute('aria-checked', 'true')
  })

  it('클릭하면 onChange 호출', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch checked={false} ariaLabel="알림 받기" onChange={onChange} />)

    await user.click(screen.getByRole('switch', { name: '알림 받기' }))

    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

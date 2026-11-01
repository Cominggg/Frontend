import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SuspensionNoticeModal from './SuspensionNoticeModal'
import useSuspensionStore from '@/stores/suspensionStore'

const NOTICE = { suspendedUntil: '2026-11-05T14:30:00', reason: 'ABUSE' }

function renderModal(notice = NOTICE) {
  useSuspensionStore.setState({ notice })
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<SuspensionNoticeModal />} />
        <Route path="/operation-policy" element={<h1>운영정책</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useSuspensionStore.setState(useSuspensionStore.getInitialState(), true)
})

describe('SuspensionNoticeModal', () => {
  describe('렌더링', () => {
    it('notice가 null이면 렌더링하지 않음', () => {
      renderModal(null)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('notice가 있으면 정지 안내 다이얼로그 표시', () => {
      renderModal()

      expect(screen.getByRole('dialog', { name: '이용이 정지된 계정입니다' })).toBeInTheDocument()
    })

    it('정지 종료 시각이 있으면 문자열 그대로 "까지" 형식으로 표시', () => {
      renderModal()

      expect(screen.getByText('2026.11.05 14:30까지')).toBeInTheDocument()
    })

    it('정지 종료 시각이 null이면 영구 정지 표시', () => {
      renderModal({ suspendedUntil: null, reason: 'ABUSE' })

      expect(screen.getByText('영구 정지')).toBeInTheDocument()
    })

    it('사유가 신고 사유 코드이면 한글 라벨 표시', () => {
      renderModal()

      expect(screen.getByText('욕설/비방')).toBeInTheDocument()
    })

    it.each([
      ['null', null],
      ['알 수 없는 코드', 'UNKNOWN_REASON'],
    ])('사유가 %s이면 운영정책 위반 표시', (_, reason) => {
      renderModal({ ...NOTICE, reason })

      expect(screen.getByText('운영정책 위반')).toBeInTheDocument()
    })

    it('이의 신청 메일 링크 표시', () => {
      renderModal()

      expect(screen.getByRole('link', { name: 'coming0626@gmail.com' })).toHaveAttribute(
        'href',
        'mailto:coming0626@gmail.com',
      )
    })

    it('정지 중에는 탈퇴를 메일로 요청하도록 안내', () => {
      renderModal()

      expect(screen.getByText(/탈퇴를 원하시면 같은 주소로 요청/)).toBeInTheDocument()
    })

    it('운영정책 보기 링크는 운영정책 페이지를 가리킴', () => {
      renderModal()

      expect(screen.getByRole('link', { name: '운영정책 보기' })).toHaveAttribute('href', '/operation-policy')
    })
  })

  describe('닫기', () => {
    it('확인 버튼을 클릭하면 닫힘', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.click(screen.getByRole('button', { name: '확인' }))

      expect(useSuspensionStore.getState().notice).toBeNull()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('Escape를 누르면 닫힘', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.keyboard('{Escape}')

      expect(useSuspensionStore.getState().notice).toBeNull()
    })

    it('운영정책 보기를 클릭하면 닫히고 운영정책 페이지로 이동', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.click(screen.getByRole('link', { name: '운영정책 보기' }))

      expect(useSuspensionStore.getState().notice).toBeNull()
      expect(screen.getByRole('heading', { name: '운영정책' })).toBeInTheDocument()
    })
  })
})

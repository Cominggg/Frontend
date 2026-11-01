import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CommentItem from './CommentItem'

vi.mock('@/services/reportApi', () => ({
  createReport: vi.fn(),
}))

function makeComment(overrides = {}) {
  return {
    id: 1,
    authorNickname: '테스트유저',
    isDeleted: false,
    isAuthor: false,
    content: 'YOASOBI 내한 기대돼요',
    createdAt: '2026-09-26T10:00:00',
    likeCount: 5,
    isLiked: false,
    replies: [],
    ...overrides,
  }
}

function makeReply(overrides = {}) {
  return {
    id: 11,
    authorNickname: '답글유저',
    isDeleted: false,
    isAuthor: false,
    content: '저도 갈 거예요',
    createdAt: '2026-09-26T11:00:00',
    likeCount: 2,
    isLiked: false,
    ...overrides,
  }
}

function renderCommentItem(comment) {
  return render(
    <CommentItem
      comment={comment}
      isLoggedIn
      onRequireLogin={vi.fn()}
      onReply={vi.fn()}
      onToggleLike={vi.fn()}
      onToggleReplyLike={vi.fn()}
      onDelete={vi.fn()}
      onDeleteReply={vi.fn()}
    />,
  )
}

describe('CommentItem', () => {
  describe('탈퇴 회원의 정상 댓글 (isDeleted false, 닉네임 null)', () => {
    const comment = makeComment({ authorNickname: null, isDeleted: false })

    it('작성자 이름을 탈퇴 회원으로 표시', () => {
      renderCommentItem(comment)

      expect(screen.getByText('탈퇴 회원')).toBeInTheDocument()
    })

    it('본문을 표시', () => {
      renderCommentItem(comment)

      expect(screen.getByText('YOASOBI 내한 기대돼요')).toBeInTheDocument()
    })

    it.each([
      ['좋아요', '5'],
      ['답글 달기', '답글 달기'],
      ['신고', '신고'],
    ])('%s 버튼 표시', (_label, name) => {
      renderCommentItem(comment)

      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  describe('삭제된 댓글 (isDeleted true, 닉네임 있음)', () => {
    const comment = makeComment({ isDeleted: true, content: '삭제된 댓글입니다' })

    it('닉네임을 표시', () => {
      renderCommentItem(comment)

      expect(screen.getByText('테스트유저')).toBeInTheDocument()
    })

    it('액션 버튼을 표시하지 않음', () => {
      renderCommentItem(comment)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('isDeleted 필드가 없는 응답 (BE 배포 전)', () => {
    it('닉네임이 null이면 삭제로 간주해 액션 버튼을 표시하지 않음', () => {
      const { isDeleted: _omit, ...comment } = makeComment({ authorNickname: null })
      renderCommentItem(comment)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('닉네임이 있으면 액션 버튼 표시', () => {
      const { isDeleted: _omit, ...comment } = makeComment()
      renderCommentItem(comment)

      expect(screen.getByRole('button', { name: '답글 달기' })).toBeInTheDocument()
    })
  })

  describe('답글', () => {
    function renderWithReply(reply) {
      return renderCommentItem(makeComment({ isDeleted: true, replies: [reply] }))
    }

    it('isDeleted false + 닉네임 null 답글이면 탈퇴 회원으로 표시', () => {
      renderWithReply(makeReply({ authorNickname: null, isDeleted: false }))

      expect(screen.getByText('탈퇴 회원')).toBeInTheDocument()
    })

    it.each([
      ['좋아요', '2'],
      ['신고', '신고'],
    ])('isDeleted false + 닉네임 null 답글이면 %s 버튼 표시', (_label, name) => {
      renderWithReply(makeReply({ authorNickname: null, isDeleted: false }))

      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })

    it('isDeleted true 답글이면 닉네임을 표시', () => {
      renderWithReply(makeReply({ isDeleted: true }))

      expect(screen.getByText('답글유저')).toBeInTheDocument()
    })

    it('isDeleted true 답글이면 액션 버튼을 표시하지 않음', () => {
      renderWithReply(makeReply({ isDeleted: true }))

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('isDeleted 필드가 없고 닉네임 null 답글이면 액션 버튼을 표시하지 않음', () => {
      const { isDeleted: _omit, ...reply } = makeReply({ authorNickname: null })
      renderWithReply(reply)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})

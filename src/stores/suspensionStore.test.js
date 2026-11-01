import { beforeEach, describe, expect, it } from 'vitest'
import useSuspensionStore from './suspensionStore'

beforeEach(() => {
  useSuspensionStore.setState(useSuspensionStore.getInitialState(), true)
})

describe('useSuspensionStore', () => {
  it('초기 상태면 notice가 null', () => {
    expect(useSuspensionStore.getState().notice).toBeNull()
  })

  describe('open', () => {
    it('정지 기한과 사유를 넘기면 notice에 저장', () => {
      useSuspensionStore.getState().open({ suspendedUntil: '2026-11-05T12:00:00', reason: 'SPAM' })

      expect(useSuspensionStore.getState().notice).toEqual({ suspendedUntil: '2026-11-05T12:00:00', reason: 'SPAM' })
    })

    it('정지 기한 없이 열면 suspendedUntil이 null', () => {
      useSuspensionStore.getState().open({ reason: 'ABUSE' })

      expect(useSuspensionStore.getState().notice).toEqual({ suspendedUntil: null, reason: 'ABUSE' })
    })

    it('인자 없이 열면 기한과 사유 모두 null', () => {
      useSuspensionStore.getState().open()

      expect(useSuspensionStore.getState().notice).toEqual({ suspendedUntil: null, reason: null })
    })
  })

  describe('close', () => {
    it('닫으면 notice가 null', () => {
      useSuspensionStore.getState().open({ suspendedUntil: '2026-11-05T12:00:00', reason: 'SPAM' })

      useSuspensionStore.getState().close()

      expect(useSuspensionStore.getState().notice).toBeNull()
    })
  })
})

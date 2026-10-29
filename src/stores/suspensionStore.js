import { create } from 'zustand'

// suspendedUntil: KST LocalDateTime 문자열(오프셋 없음), null이면 영구 정지
// reason: 신고 사유 enum(REPORT_REASON_LABEL 키)
const useSuspensionStore = create((set) => ({
  notice: null,
  open: ({ suspendedUntil = null, reason = null } = {}) => set({ notice: { suspendedUntil, reason } }),
  close: () => set({ notice: null }),
}))

export default useSuspensionStore

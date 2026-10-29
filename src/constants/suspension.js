import { formatDateTime } from '@/utils/date'

// 관리자 정지 기간 선택지 — BE는 days 7·30·null(영구)만 받는다
export const SUSPENSION_PERIODS = [
  { value: '7', label: '7일', days: 7 },
  { value: '30', label: '30일', days: 30 },
  { value: 'PERMANENT', label: '영구', days: null },
]

// suspendedUntil은 오프셋 없는 KST 시각이므로 Date로 변환하지 않고 문자열 그대로 표시한다
export function formatSuspensionPeriod(suspendedUntil) {
  return suspendedUntil ? `${formatDateTime(suspendedUntil)}까지` : '영구 정지'
}

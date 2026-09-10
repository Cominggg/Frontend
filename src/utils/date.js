export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// 'YYYY-MM-DD' → 'YYYY.MM.DD'
export function formatDate(isoStr) {
  if (!isoStr) return ''
  return isoStr.replace(/-/g, '.')
}

// ISO datetime → 'YYYY.MM.DD HH:mm'
export function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const [datePart, timePart] = isoStr.split('T')
  const date = datePart.replace(/-/g, '.')
  const time = timePart ? timePart.slice(0, 5) : ''
  return time ? `${date} ${time}` : date
}

// ISO datetime → 'N일 전', '어제', '오늘'
export function formatRelativeDate(isoStr) {
  if (!isoStr) return ''
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 86400000)
  if (diff <= 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff < 7) return `${diff}일 전`
  if (diff < 28) return `${Math.floor(diff / 7)}주 전`
  return `${Math.floor(diff / 30)}개월 전`
}

// 게시글 목록·백링크용 날짜 표기 정책 (고정 시각 표기 — 재렌더 없이도 값이 낡지 않음)
// 24시간 이내 → 'HH:mm', 올해 → 'MM.dd', 해가 다르면 → 'yy.MM.dd'
export function formatPostDate(isoStr) {
  if (!isoStr) return ''
  const date = new Date(isoStr)
  const now = new Date()

  if (now - date < 86400000) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }
  return `${String(date.getFullYear()).slice(-2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

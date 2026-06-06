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

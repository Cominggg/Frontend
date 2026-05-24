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

export const PLACEHOLDER_PALETTE = [
  ['#6d28d9', '#a78bfa'],
  ['#1d4ed8', '#60a5fa'],
  ['#9f1239', '#fb7185'],
  ['#15803d', '#4ade80'],
  ['#b45309', '#fbbf24'],
  ['#0f766e', '#2dd4bf'],
  ['#7c3aed', '#c084fc'],
  ['#1e40af', '#818cf8'],
]

// 이름 문자열을 안정적으로 팔레트 인덱스에 매핑한다 — 같은 이름은 어디서
// 호출하든, 몇 번째로 등장하든 항상 같은 인덱스를 받는다.
export function hashStringToIndex(str, paletteLength) {
  const safeStr = typeof str === 'string' ? str : ''
  let hash = 0
  for (let i = 0; i < safeStr.length; i++) {
    hash = (hash * 31 + safeStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % paletteLength
}

export function getArtistColor(name) {
  return PLACEHOLDER_PALETTE[hashStringToIndex(name, PLACEHOLDER_PALETTE.length)]
}

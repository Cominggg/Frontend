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

export function getArtistColor(name) {
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

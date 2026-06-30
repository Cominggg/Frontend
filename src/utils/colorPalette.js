export const PLACEHOLDER_PALETTE = [
  ['#7c3aed', '#c4b5fd'], // violet
  ['#0369a1', '#7dd3fc'], // blue
  ['#be123c', '#fda4af'], // rose
  ['#15803d', '#86efac'], // green
  ['#b45309', '#fcd34d'], // amber
  ['#0f766e', '#5eead4'], // teal
]

export function getArtistColor(name) {
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

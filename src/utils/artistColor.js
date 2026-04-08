export const PLACEHOLDER_PALETTE = [
  ['#7c3aed', '#c4b5fd'],
  ['#0369a1', '#7dd3fc'],
  ['#be123c', '#fda4af'],
  ['#15803d', '#86efac'],
  ['#b45309', '#fcd34d'],
  ['#0f766e', '#5eead4'],
  ['#9333ea', '#d8b4fe'],
  ['#1d4ed8', '#93c5fd'],
]

export function getArtistColor(name) {
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

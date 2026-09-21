import { useState } from 'react'
import styles from './StarRating.module.css'

const STAR_COUNT = 5
const STAR_INDEXES = Array.from({ length: STAR_COUNT }, (_, i) => i)
const STAR_PATH = 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279-6.064-5.828 8.332-1.151z'

function Star() {
  return (
    <svg viewBox="0 0 24 24" className={styles.starIcon} aria-hidden="true">
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  )
}

function pickScore(e, starIndex) {
  const rect = e.currentTarget.getBoundingClientRect()
  const isHalf = e.clientX - rect.left < rect.width / 2
  return isHalf ? starIndex + 0.5 : starIndex + 1
}

function handleKeyDown(e, value, onChange) {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowUp'
    ? 0.5
    : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
      ? -0.5
      : null
  if (step == null) return
  e.preventDefault()
  onChange(Math.max(0.5, Math.min(STAR_COUNT, value + step)))
}

function StarRating({
  value = 0,
  onChange,
  size = 20,
  color = 'var(--color-accent)',
  emptyColor = 'var(--color-border)',
  ariaLabel = '별점',
}) {
  const [hoverValue, setHoverValue] = useState(null)
  const interactive = typeof onChange === 'function'
  const displayValue = interactive && hoverValue != null ? hoverValue : value
  const percent = Math.max(0, Math.min(100, (displayValue / STAR_COUNT) * 100))

  return (
    <div
      className={`${styles.stars} ${interactive ? styles.interactive : ''}`}
      style={{ '--star-size': `${size}px`, '--star-empty': emptyColor, '--star-fill': color }}
      role={interactive ? 'slider' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-valuenow={interactive ? value : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? STAR_COUNT : undefined}
      onKeyDown={interactive ? (e) => handleKeyDown(e, value, onChange) : undefined}
      onMouseLeave={() => interactive && setHoverValue(null)}
    >
      <div className={styles.starsBg} aria-hidden="true">
        {STAR_INDEXES.map((i) => (
          <span
            key={i}
            className={styles.starSlot}
            onMouseMove={interactive ? (e) => setHoverValue(pickScore(e, i)) : undefined}
            onClick={interactive ? (e) => onChange(pickScore(e, i)) : undefined}
          >
            <Star />
          </span>
        ))}
      </div>
      <div className={styles.starsFg} style={{ width: `${percent}%` }} aria-hidden="true">
        {STAR_INDEXES.map((i) => (
          <span key={i} className={styles.starSlot}>
            <Star />
          </span>
        ))}
      </div>
    </div>
  )
}

export default StarRating

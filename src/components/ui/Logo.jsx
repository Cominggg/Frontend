import { useId } from 'react'
import styles from './Logo.module.css'

function Logo({ size = 'md' }) {
  const uid = useId()
  const gradId = `lg${uid.replace(/:/g, '')}`

  return (
    <span className={`${styles.root} ${styles[size]}`}>
      <svg className={styles.icon} viewBox="0 0 60 60" fill="none" aria-hidden="true">
        <circle cx="30" cy="30" r="21" stroke={`url(#${gradId})`} strokeWidth="3.5" fill="none" />
        <path d="M41 17 A16 16 0 1 0 41 43" stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="41" cy="30" r="5" fill={`url(#${gradId})`} />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
      <span className={styles.text}>Coming</span>
    </span>
  )
}

export default Logo

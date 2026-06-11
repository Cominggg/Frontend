import { useId } from 'react'
import useThemeStore from '@/stores/themeStore'
import styles from './Logo.module.css'

function Logo({ size = 'md' }) {
  const uid = useId()
  const gradId = `lg${uid.replace(/:/g, '')}`
  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <span className={`${styles.root} ${styles[size]}`}>
      <svg className={styles.icon} viewBox="0 0 60 60" fill="none" aria-hidden="true">
        <circle cx="30" cy="30" r="30" fill={isDark ? '#0f0f1a' : '#fafafa'} />
        {isDark ? (
          <>
            <circle cx="30" cy="30" r="21" stroke={`url(#${gradId})`} strokeWidth="3.5" fill="none" />
            <path d="M41 17 A16 16 0 1 0 41 43" stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="41" cy="30" r="5" fill={`url(#${gradId})`} />
          </>
        ) : (
          <>
            <circle cx="30" cy="30" r="18" stroke={`url(#${gradId})`} strokeWidth="3.5" fill="none" />
            <path d="M39 20 A13 13 0 1 0 39 40" stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="39" cy="30" r="4.5" fill={`url(#${gradId})`} />
          </>
        )}
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

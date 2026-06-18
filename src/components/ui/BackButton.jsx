import { useNavigate } from 'react-router-dom'
import styles from './BackButton.module.css'

export default function BackButton({ fallback }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => window.history.length > 1 ? navigate(-1) : navigate(fallback)}
      className={styles.backBtn}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
      뒤로
    </button>
  )
}

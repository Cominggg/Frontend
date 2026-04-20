import { useEffect, useRef } from 'react'

import useLoginModalStore from '@/stores/loginModalStore'
import styles from './LoginModal.module.css'

const PROVIDERS = [
  {
    key: 'google',
    label: 'Google로 계속하기',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    key: 'kakao',
    label: 'Kakao로 계속하기',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3C6.477 3 2 6.477 2 10.8c0 2.713 1.607 5.1 4.053 6.538L5.1 21l4.703-2.53C10.245 18.62 11.111 18.7 12 18.7c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"
          fill="#3C1E1E"
        />
      </svg>
    ),
  },
]

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function handleLogin(provider, redirectUri) {
  const url = new URL(`/api/auth/login/${provider}`, window.location.origin)
  if (redirectUri) {
    url.searchParams.set('redirect_uri', redirectUri)
  }
  window.location.href = url.toString()
}

function LoginModal() {
  const { isOpen, close, redirectUri } = useLoginModalStore()
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    const focusable = modal ? [...modal.querySelectorAll(FOCUSABLE)] : []
    focusable[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="로그인" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button className={styles.closeBtn} onClick={close} aria-label="닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.header}>
          <span className={styles.logo}>COMING</span>
          <p className={styles.subtitle}>로그인하고 내한 공연 정보를 맞춤으로 받아보세요</p>
        </div>

        <div className={styles.buttons}>
          {PROVIDERS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`${styles.socialBtn} ${styles[key]}`}
              onClick={() => handleLogin(key, redirectUri)}
            >
              <span className={styles.socialIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginModal

import { useEffect, useRef } from 'react'

import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import { refreshAccessToken } from '@/services/api'
import { getMe } from '@/services/authApi'
import LoginModal from '@/components/auth/LoginModal'
import Footer from './Footer'
import Header from './Header'
import styles from './Layout.module.css'

function Layout({ children }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setInitialized = useAuthStore((s) => s.setInitialized)
  const restoreStarted = useRef(false)

  useEffect(() => {
    // StrictMode의 effect 이중 실행으로 세션 복원(getMe 등)이 두 번 돌지 않도록 1회만 실행
    // (refresh 요청 자체의 중복은 refreshAccessToken이 합친다)
    if (restoreStarted.current) return
    restoreStarted.current = true

    if (!localStorage.getItem(SESSION_HINT)) {
      setInitialized()
      return
    }

    async function restoreAuth() {
      try {
        await refreshAccessToken()
        const user = await getMe()
        setUser(user)
      } catch {
        localStorage.removeItem(SESSION_HINT)
      } finally {
        setInitialized()
      }
    }
    restoreAuth()
  }, [setUser, setInitialized])

  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <LoginModal />
    </div>
  )
}

export default Layout

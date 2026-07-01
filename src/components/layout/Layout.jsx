import { useEffect } from 'react'
import axios from 'axios'

import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import { getMe } from '@/services/authApi'
import LoginModal from '@/components/auth/LoginModal'
import Footer from './Footer'
import Header from './Header'
import styles from './Layout.module.css'

function Layout({ children }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setInitialized = useAuthStore((s) => s.setInitialized)

  useEffect(() => {
    if (!localStorage.getItem(SESSION_HINT)) {
      setInitialized()
      return
    }

    async function restoreAuth() {
      try {
        const { data } = await axios.post('/api/auth/refresh', null, { withCredentials: true })
        setAccessToken(data.accessToken)
        const user = await getMe()
        setUser(user)
      } catch {
        localStorage.removeItem(SESSION_HINT)
      } finally {
        setInitialized()
      }
    }
    restoreAuth()
  }, [setAccessToken, setUser, setInitialized])

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

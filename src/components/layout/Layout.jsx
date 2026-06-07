import { useEffect } from 'react'
import axios from 'axios'

import useAuthStore from '@/stores/authStore'
import { getMe } from '@/services/authApi'
import LoginModal from '@/components/auth/LoginModal'
import Header from './Header'
import styles from './Layout.module.css'

function Layout({ children }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    async function restoreAuth() {
      try {
        const { data } = await axios.post('/api/auth/refresh', null, { withCredentials: true })
        setAccessToken(data.accessToken)
        const user = await getMe()
        setUser(user)
      } catch {
        // 비로그인 상태 유지
      }
    }
    restoreAuth()
  }, [setAccessToken, setUser])

  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>{children}</main>
      <LoginModal />
    </div>
  )
}

export default Layout

import LoginModal from '@/components/auth/LoginModal'
import Header from './Header'
import styles from './Layout.module.css'

function Layout({ children }) {
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>{children}</main>
      <LoginModal />
    </div>
  )
}

export default Layout

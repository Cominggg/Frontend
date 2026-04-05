import Header from './Header'
import styles from './Layout.module.css'

function Layout({ children }) {
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default Layout

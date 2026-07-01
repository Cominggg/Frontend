import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>© {new Date().getFullYear()} Coming</span>
        <nav className={styles.links} aria-label="정책 링크">
          <Link to={ROUTES.TERMS} className={styles.link}>서비스 이용약관</Link>
          <Link to={ROUTES.PRIVACY} className={styles.link}>개인정보처리방침</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

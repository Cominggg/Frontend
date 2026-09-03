import { Link } from 'react-router-dom'

import DiscordIcon from '@/components/ui/DiscordIcon'
import { ROUTES } from '@/constants/routes'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>© {new Date().getFullYear()} 커밍</span>
        <div className={styles.linkGroups}>
          <nav className={styles.links} aria-label="공식 채널">
            <a
              href="https://discord.gg/zhreVgYnWP"
              className={`${styles.link} ${styles.discordLink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiscordIcon size={16} />
              디스코드
            </a>
          </nav>
          <nav className={styles.links} aria-label="정책 링크">
            <Link to={ROUTES.TERMS} className={styles.link}>서비스 이용약관</Link>
            <Link to={ROUTES.PRIVACY} className={styles.link}>개인정보처리방침</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer

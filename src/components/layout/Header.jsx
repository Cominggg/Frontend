import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: ROUTES.CONCERTS, label: '공연' },
  { to: ROUTES.ARTISTS, label: '아티스트' },
  { to: ROUTES.CALENDAR, label: '캘린더' },
]

function Header() {
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLoginClick() {
    openLoginModal()
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          COMING
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <Link to={ROUTES.MY} className={styles.avatarBtn}>
              <img
                src={user.profileImage}
                alt={user.name}
                className={styles.avatar}
                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/artist-placeholder.png' }}
              />
            </Link>
          ) : (
            <button className={styles.loginBtn} onClick={handleLoginClick}>
              로그인
            </button>
          )}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴"
          aria-expanded={menuOpen}
        >
          <span className={menuOpen ? `${styles.bar} ${styles.barTop}` : styles.bar} />
          <span className={menuOpen ? `${styles.bar} ${styles.barMid}` : styles.bar} />
          <span className={menuOpen ? `${styles.bar} ${styles.barBot}` : styles.bar} />
        </button>
      </div>

      {menuOpen && (
        <nav className={styles.mobileNav}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Header

import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { logout } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import useThemeStore from '@/stores/themeStore'
import Logo from '@/components/ui/Logo'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: ROUTES.CONCERTS, label: '공연' },
  { to: ROUTES.ARTISTS, label: '아티스트' },
  { to: ROUTES.CALENDAR, label: '캘린더' },
  { to: ROUTES.RELEASES, label: '음악' },
]

function Header() {
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const { theme, toggle: toggleTheme } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLoginClick() {
    openLoginModal(location.pathname + location.search)
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setDropdownOpen(false)
      navigate(ROUTES.HOME)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <Logo size="md" />
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
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {user ? (
            <div className={styles.avatarWrapper} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-label="사용자 메뉴"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname}
                    className={styles.avatar}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className={styles.avatarInitial} aria-hidden="true">
                    {user.nickname?.charAt(0)}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  {user.role === 'ADMIN' && (
                    <Link
                      to={ROUTES.ADMIN}
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      관리자 페이지
                    </Link>
                  )}
                  <Link
                    to={ROUTES.MY}
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button className={styles.dropdownItem} onClick={() => void handleLogout()}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to={ROUTES.ADMIN}
                  className={styles.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  관리자 페이지
                </Link>
              )}
              <Link
                to={ROUTES.MY}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                마이페이지
              </Link>
              <button
                className={styles.mobileNavAction}
                onClick={() => { setMenuOpen(false); void handleLogout() }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              className={styles.mobileNavAction}
              onClick={() => { setMenuOpen(false); handleLoginClick() }}
            >
              로그인
            </button>
          )}
        </nav>
      )}
    </header>
  )
}

export default Header

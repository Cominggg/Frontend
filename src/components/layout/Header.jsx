import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { logout } from '@/services/api'
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
            <div className={styles.avatarWrapper} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-label="사용자 메뉴"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className={styles.avatar}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className={styles.avatarInitial} aria-hidden="true">
                    {user.name.charAt(0)}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
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

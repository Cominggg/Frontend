import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { logout } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import useThemeStore from '@/stores/themeStore'
import Logo from '@/components/ui/Logo'
import InquiryModal from '@/components/ui/InquiryModal'
import Switch from '@/components/ui/Switch'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: ROUTES.CONCERTS, label: '공연' },
  { to: ROUTES.ARTISTS, label: '아티스트' },
  { to: ROUTES.RELEASES, label: '음악' },
  { to: ROUTES.CALENDAR, label: '캘린더' },
  { to: ROUTES.COMMUNITY, label: '커뮤니티' },
]

function getAccountItems(user, { onOpenInquiry, onLogout }) {
  if (user.role === 'PENDING') {
    return [{ key: 'signup', type: 'link', to: ROUTES.SIGNUP, label: '회원가입 완료하기' }]
  }

  const items = []
  if (user.role === 'ADMIN') {
    items.push({ key: 'admin', type: 'link', to: ROUTES.ADMIN, label: '관리자 페이지' })
  }
  items.push({ key: 'mypage', type: 'link', to: ROUTES.ME, label: '마이페이지' })
  items.push({ key: 'dataRequest', type: 'action', label: '데이터 요청', onClick: () => onOpenInquiry('DATA_REQUEST') })
  items.push({ key: 'feedback', type: 'action', label: '피드백', onClick: () => onOpenInquiry('FEEDBACK') })
  items.push({ key: 'logout', type: 'action', label: '로그아웃', onClick: onLogout })
  return items
}

function ThemeIcon({ theme, size = 18 }) {
  return theme === 'dark' ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function Header() {
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const { theme, toggle: toggleTheme } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [inquiryType, setInquiryType] = useState(null)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
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

  function handleOpenInquiry(type) {
    setDropdownOpen(false)
    setMenuOpen(false)
    setInquiryType(type)
    setInquiryModalOpen(true)
  }

  const themeLabel = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  const accountItems = user
    ? getAccountItems(user, { onOpenInquiry: handleOpenInquiry, onLogout: () => void handleLogout() })
    : []
  const accountListItems = accountItems.filter((item) => item.key !== 'logout')
  const logoutItem = accountItems.find((item) => item.key === 'logout')

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // 로그아웃 API 실패 시에도 로컬 상태는 초기화하고 홈으로 이동
    } finally {
      setDropdownOpen(false)
      navigate(ROUTES.HOME)
    }
  }

  return (
    <>
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
          {!user && (
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label={themeLabel}
            >
              <ThemeIcon theme={theme} />
            </button>
          )}
          {user ? (
            <div className={styles.avatarWrapper} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-label="사용자 메뉴"
              >
                <span className={styles.avatarName}>{user.nickname}</span>
                <svg className={styles.avatarChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownToggleRow}>
                    <span className={styles.dropdownToggleLabel}>다크 모드</span>
                    <Switch
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      ariaLabel={themeLabel}
                      size="sm"
                    />
                  </div>
                  {accountItems.map((item) =>
                    item.type === 'link' ? (
                      <Link
                        key={item.key}
                        to={item.to}
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button key={item.key} className={styles.dropdownItem} onClick={item.onClick}>
                        {item.label}
                      </button>
                    )
                  )}
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
        <button
          type="button"
          className={styles.mobileNavScrim}
          onClick={() => setMenuOpen(false)}
          aria-label="메뉴 닫기"
        />
      )}
      {menuOpen && (
        <nav className={styles.mobileNav}>
          {user && user.role !== 'PENDING' && (
            <div className={styles.mobileNavUser}>
              <span className={styles.mobileNavAvatar} aria-hidden="true">
                {user.nickname?.charAt(0)}
              </span>
              <span className={styles.mobileNavUserName}>{user.nickname}</span>
            </div>
          )}

          <div className={styles.mobileNavSection}>
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
          </div>

          {user && (
            <div className={styles.mobileNavSection}>
              {accountListItems.map((item) =>
                item.type === 'link' ? (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={styles.mobileNavLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    className={styles.mobileNavAction}
                    onClick={() => { setMenuOpen(false); item.onClick() }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}

          <div className={styles.mobileNavSection}>
            <div className={styles.mobileNavToggleRow}>
              <span className={styles.mobileNavToggleLabel}>다크 모드</span>
              <Switch checked={theme === 'dark'} onChange={toggleTheme} ariaLabel={themeLabel} />
            </div>
          </div>

          {user ? (
            logoutItem && (
              <button
                className={styles.mobileNavLogoutBtn}
                onClick={() => { setMenuOpen(false); logoutItem.onClick() }}
              >
                로그아웃
              </button>
            )
          ) : (
            <button
              className={styles.mobileNavLoginBtn}
              onClick={() => { setMenuOpen(false); handleLoginClick() }}
            >
              로그인
            </button>
          )}
        </nav>
      )}
    </header>
    <InquiryModal
      isOpen={inquiryModalOpen}
      onClose={() => { setInquiryModalOpen(false); setInquiryType(null) }}
      type={inquiryType}
    />
    </>
  )
}

export default Header

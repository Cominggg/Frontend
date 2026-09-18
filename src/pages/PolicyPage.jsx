import { useState, useRef, useEffect } from 'react'
import { getCurrentVersionIndex, getUpcomingVersion } from '@/constants/policy'
import styles from './PolicyPage.module.css'

function labelFor(version, index, currentIndex) {
  if (index === currentIndex) return `v${version.version} (현재 시행)`
  if (index < currentIndex) return `v${version.version} (시행 예정 · ${version.effectiveDate})`
  return `v${version.version} (이전 버전)`
}

function PolicyPage({ title, versions }) {
  const currentIndex = getCurrentVersionIndex(versions)
  const upcoming = getUpcomingVersion(versions)
  const [selectedIndex, setSelectedIndex] = useState(currentIndex)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const current = versions[selectedIndex]

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {versions.length > 1 && (
            <div className={styles.versionWrapper} ref={dropdownRef}>
              <button
                type="button"
                className={styles.versionBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-label="버전 선택"
              >
                <span>{labelFor(current, selectedIndex, currentIndex)}</span>
                <svg
                  className={styles.versionChevron}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className={styles.versionDropdown}>
                  {versions.map((v, i) => (
                    <button
                      key={v.version}
                      type="button"
                      className={
                        i === selectedIndex
                          ? `${styles.versionItem} ${styles.versionItemActive}`
                          : styles.versionItem
                      }
                      onClick={() => {
                        setSelectedIndex(i)
                        setDropdownOpen(false)
                      }}
                    >
                      {labelFor(v, i, currentIndex)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {upcoming && (
          <p className={styles.noticeBanner}>
            {upcoming.effectiveDate}부터 개정된 v{upcoming.version} 버전이 시행됩니다.{' '}
            <button
              type="button"
              className={styles.noticeLink}
              onClick={() => setSelectedIndex(versions.indexOf(upcoming))}
            >
              변경 내용 미리 보기
            </button>
          </p>
        )}
        <pre className={styles.content}>{current.content}</pre>
      </div>
    </div>
  )
}

export default PolicyPage

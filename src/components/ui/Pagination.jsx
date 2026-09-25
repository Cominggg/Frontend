import { useEffect, useState } from 'react'

import styles from './Pagination.module.css'

const GROUP_SIZE = 10
const GROUP_SIZE_MOBILE = 5

function getGroupPages(currentPage, totalPages, groupSize) {
  const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1
  const groupEnd = Math.min(groupStart + groupSize - 1, totalPages)
  return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i)
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  )

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handleChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const isMobile = useIsMobile()
  const [jumpValue, setJumpValue] = useState('')

  if (!totalPages || totalPages < 1) return null

  const pages = getGroupPages(currentPage, totalPages, isMobile ? GROUP_SIZE_MOBILE : GROUP_SIZE)

  const handleJumpChange = (e) => {
    setJumpValue(e.target.value.replace(/[^0-9]/g, ''))
  }

  const handleJumpSubmit = (e) => {
    e.preventDefault()
    if (!jumpValue) return

    const target = Math.min(Math.max(Number(jumpValue), 1), totalPages)
    setJumpValue('')
    if (target !== currentPage) onPageChange(target)
  }

  return (
    <div className={styles.paginationWrap}>
      <div className={styles.pagination} aria-label="페이지 네비게이션">
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
            onClick={() => onPageChange(page)}
            aria-label={`${page}페이지`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {totalPages > 1 && (
        <form className={styles.jumpForm} onSubmit={handleJumpSubmit}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.jumpInput}
            value={jumpValue}
            onChange={handleJumpChange}
            placeholder={String(currentPage)}
            aria-label="이동할 페이지 번호 입력"
          />
          <span className={styles.jumpTotal}>/ {totalPages}</span>
          <button type="submit" className={styles.jumpBtn} aria-label="입력한 페이지로 이동">
            이동
          </button>
        </form>
      )}
    </div>
  )
}

export default Pagination

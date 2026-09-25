import { useEffect, useState } from 'react'

import styles from './Pagination.module.css'

const GROUP_SIZE = 10
const GROUP_SIZE_MOBILE = 3

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

  if (!totalPages || totalPages < 1) return null

  const pages = getGroupPages(currentPage, totalPages, isMobile ? GROUP_SIZE_MOBILE : GROUP_SIZE)

  return (
    <div className={styles.pagination} aria-label="페이지 네비게이션">
      {currentPage > 1 && (
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(1)}
          aria-label="첫 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" />
          </svg>
        </button>
      )}

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

      {currentPage < totalPages && (
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(totalPages)}
          aria-label="마지막 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Pagination

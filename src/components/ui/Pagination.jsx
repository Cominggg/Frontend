import { Fragment, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

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

// pageParam을 넘기면 페이지 버튼을 <a href="?pageParam=N">으로 렌더링한다.
// 검색엔진 크롤러는 버튼을 누르지 않고 링크만 따라가므로, 공개 목록 페이지의 2페이지 이후
// 항목까지 크롤링 경로를 열어주기 위함. 일반 클릭은 기존처럼 onPageChange로 처리한다.
function Pagination({ currentPage, totalPages, onPageChange, pageParam }) {
  const isMobile = useIsMobile()
  const { search } = useLocation()
  const [jumpValue, setJumpValue] = useState('')

  if (!totalPages || totalPages < 1) return null

  function renderPageControl({ page, disabled, className, children, ...rest }) {
    if (!pageParam || disabled) {
      return (
        <button className={className} onClick={() => onPageChange(page)} disabled={disabled} {...rest}>
          {children}
        </button>
      )
    }

    const params = new URLSearchParams(search)
    if (page === 1) params.delete(pageParam)
    else params.set(pageParam, String(page))
    const query = params.toString()

    const handleClick = (e) => {
      // 새 탭 열기 등 수정자 클릭은 브라우저 기본 동작에 맡긴다
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      onPageChange(page)
    }

    return (
      <Link to={query ? `?${query}` : '.'} className={className} onClick={handleClick} {...rest}>
        {children}
      </Link>
    )
  }

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
        {renderPageControl({
          page: currentPage - 1,
          disabled: currentPage === 1,
          className: styles.pageBtn,
          'aria-label': '이전 페이지',
          children: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          ),
        })}

        {pages.map((page) => (
          <Fragment key={page}>
            {renderPageControl({
              page,
              className: `${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`,
              'aria-label': `${page}페이지`,
              'aria-current': page === currentPage ? 'page' : undefined,
              children: page,
            })}
          </Fragment>
        ))}

        {renderPageControl({
          page: currentPage + 1,
          disabled: currentPage === totalPages,
          className: styles.pageBtn,
          'aria-label': '다음 페이지',
          children: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          ),
        })}
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

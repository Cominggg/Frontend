import styles from './Pagination.module.css'

function getPageItems(currentPage, totalPages) {
  const pages = new Set([1, totalPages])
  for (let p = Math.max(2, currentPage - 2); p <= Math.min(totalPages - 1, currentPage + 2); p++) {
    pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)

  const items = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push(`ellipsis-${sorted[i]}`)
    }
    items.push(sorted[i])
  }
  return items
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages < 1) return null

  const items = getPageItems(currentPage, totalPages)

  return (
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

      {items.map((item) =>
        typeof item === 'string' ? (
          <span key={item} className={styles.ellipsis} aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            className={`${styles.pageBtn} ${item === currentPage ? styles.pageBtnActive : ''}`}
            onClick={() => onPageChange(item)}
            aria-label={`${item}페이지`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

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
  )
}

export default Pagination

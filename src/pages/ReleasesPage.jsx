import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ReleaseCard from '@/components/release/ReleaseCard'
import ReleaseCardSkeleton from '@/components/release/ReleaseCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { getReleases } from '@/services/releaseApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './ReleasesPage.module.css'

const MAIN_TYPES = ['Album', 'Single']
const TYPE_FILTERS = ['전체', ...MAIN_TYPES]
const PAGE_SIZE = 20

function ReleasesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedType = TYPE_FILTERS.includes(searchParams.get('type'))
    ? searchParams.get('type')
    : '전체'
  const followedOnly = searchParams.get('followed') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const effectiveFollowedOnly = followedOnly && !!user

  function updateParams(updates) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === '전체' || v === '1' || v === 1) {
          next.delete(k)
        } else {
          next.set(k, String(v))
        }
      })
      return next
    }, { replace: false })
  }

  const typeParam = selectedType === '전체' ? undefined : selectedType

  const { data, isLoading } = useQuery({
    queryKey: ['releases', typeParam, page],
    queryFn: () => getReleases({ type: typeParam, page: page - 1, size: PAGE_SIZE }),
    placeholderData: (prev) => prev,
  })

  const releases = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

  function handleTypeChange(type) {
    updateParams({ type, page: 1 })
  }

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (followedOnly) {
        next.delete('followed')
      } else {
        next.set('followed', 'true')
      }
      next.delete('page')
      return next
    }, { replace: false })
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>음악</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${totalElements}건`}
          </p>
        </div>

        {/* 타입 필터 + 관심 아티스트 토글 */}
        <div className={styles.filterRow}>
          <div className={styles.filterBar} role="tablist" aria-label="음반 타입 필터">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={selectedType === t}
                className={`${styles.filterTab} ${selectedType === t ? styles.filterTabActive : ''}`}
                onClick={() => handleTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            className={`${styles.followedToggle} ${effectiveFollowedOnly ? styles.followedToggleActive : ''}`}
            onClick={handleFollowedToggle}
            aria-pressed={effectiveFollowedOnly}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={effectiveFollowedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            관심 아티스트만
          </button>
        </div>

        {/* 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ReleaseCardSkeleton key={i} />
            ))}
          </div>
        ) : releases.length > 0 ? (
          <div className={styles.grid}>
            {releases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            }
            message="아직 수집된 음반 정보가 없습니다."
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: p })}
          />
        )}

      </div>
    </div>
  )
}

export default ReleasesPage

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import StarRating from '@/components/ui/StarRating'
import { getMyConcertRating, rateConcert, getMyReleaseRating, rateRelease } from '@/services/ratingApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './RatingSection.module.css'

const RATING_API = {
  CONCERT: { getMy: getMyConcertRating, rate: rateConcert },
  RELEASE: { getMy: getMyReleaseRating, rate: rateRelease },
}

function RatingSection({ entityType, entityId, average, count, onDark = false }) {
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const queryClient = useQueryClient()
  const { getMy, rate } = RATING_API[entityType]

  const { data: myRating } = useQuery({
    queryKey: ['myRating', entityType, entityId],
    queryFn: () => getMy(entityId),
    enabled: !!user,
  })

  const rateMutation = useMutation({
    mutationFn: (score) => rate(entityId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRating', entityType, entityId] })
      queryClient.invalidateQueries({ queryKey: [entityType.toLowerCase(), entityId] })
    },
  })

  function handleRate(score) {
    if (!user) { openLoginModal(window.location.pathname + window.location.search); return }
    rateMutation.mutate(score)
  }

  const myScore = myRating?.score ?? null
  const hasAverage = average != null
  const starColor = onDark ? 'var(--color-on-accent)' : undefined
  const emptyColor = onDark ? 'rgba(255, 255, 255, 0.3)' : undefined

  return (
    <div className={`${styles.section} ${onDark ? styles.onDark : ''}`}>
      <div className={styles.average}>
        <StarRating
          value={average ?? 0}
          size={16}
          color={starColor}
          emptyColor={emptyColor}
          ariaLabel={hasAverage ? `평균 별점 ${average}점` : '평균 별점 없음'}
        />
        {hasAverage ? (
          <>
            <span className={styles.averageValue}>{average.toFixed(1)}</span>
            <span className={styles.count}>({(count ?? 0).toLocaleString()}명 평가)</span>
          </>
        ) : (
          <span className={styles.count}>아직 평가한 사람이 없어요</span>
        )}
      </div>
      <div className={styles.myRating}>
        <span className={styles.myRatingLabel}>{myScore != null ? '내 별점' : '별점 남기기'}</span>
        <StarRating
          value={myScore ?? 0}
          onChange={handleRate}
          size={22}
          color={starColor}
          emptyColor={emptyColor}
          ariaLabel="내 별점 선택"
        />
        {myScore != null && <span className={styles.myScoreValue}>{myScore.toFixed(1)}</span>}
      </div>
    </div>
  )
}

export default RatingSection

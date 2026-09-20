import { useState } from 'react'

import StarRating from '@/components/ui/StarRating'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './RatingSection.module.css'

// TODO: API 연동 후 제거
const MOCK_RATING_MAP = {
  'CONCERT-1': { average: 4.5, count: 128, myScore: null },
  'RELEASE-1': { average: 3.5, count: 42, myScore: 4 },
}

// TODO: API 연동 후 제거
function getMockRating(entityType, entityId) {
  const key = `${entityType}-${entityId}`
  if (MOCK_RATING_MAP[key]) return MOCK_RATING_MAP[key]
  const seed = Number(entityId) || 0
  return { average: Math.min(5, 3 + (seed % 5) * 0.5), count: 10 + (seed % 40), myScore: null }
}

function RatingSection({ entityType, entityId, onDark = false }) {
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [{ average, count, myScore }, setRating] = useState(() => getMockRating(entityType, entityId))

  function handleRate(score) {
    if (!user) { openLoginModal(window.location.pathname + window.location.search); return }
    // TODO: API 연동 후 mutation으로 대체
    setRating((prev) => {
      const isUpdate = prev.myScore != null
      const nextCount = isUpdate ? prev.count : prev.count + 1
      const nextAverage = Number((((prev.average * prev.count) - (isUpdate ? prev.myScore : 0) + score) / nextCount).toFixed(1))
      return { average: nextAverage, count: nextCount, myScore: score }
    })
  }

  const starColor = onDark ? 'var(--color-on-accent)' : undefined
  const emptyColor = onDark ? 'rgba(255, 255, 255, 0.3)' : undefined

  return (
    <div className={`${styles.section} ${onDark ? styles.onDark : ''}`}>
      <div className={styles.average}>
        <StarRating
          value={average}
          size={16}
          color={starColor}
          emptyColor={emptyColor}
          ariaLabel={`평균 별점 ${average}점`}
        />
        <span className={styles.averageValue}>{average.toFixed(1)}</span>
        <span className={styles.count}>({count.toLocaleString()}명 평가)</span>
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

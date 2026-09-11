import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './PopularPostsWidget.module.css'

// TODO: API 연동 후 제거 — BE GET /api/posts/popular?days=7&limit=5 완료되면 useQuery로 교체
const MOCK_POPULAR_POSTS = [
  { id: 1, title: '요네즈 켄시 내한 첫 공연, 앙코르만 3번 (스포有)', recommendCount: 128 },
  { id: 4, title: 'LOST CORNER 발매 기념 팬미팅 후기 + 사인회 꿀팁', recommendCount: 95 },
  { id: 2, title: '1층 3층 좌석에서 시야 방해 있었다는 제보 모음', recommendCount: 76 },
  { id: 5, title: '굿즈 판매 부스 위치 정리 (예술의전당 기준)', recommendCount: 58 },
  { id: 3, title: '다들 응모 결과 나왔나요 ㅠㅠ', recommendCount: 41 },
]

function PopularPostsWidget() {
  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>이번 주 인기글</h2>
      <div className={styles.widgetList}>
        {MOCK_POPULAR_POSTS.map((post, i) => (
          <Link key={post.id} to={ROUTES.COMMUNITY_DETAIL(post.id)} className={styles.rankRow}>
            <span className={styles.rankNum}>{i + 1}</span>
            <span className={styles.rankTitle}>{post.title}</span>
            <span className={styles.rankStat}>추천 {post.recommendCount.toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PopularPostsWidget

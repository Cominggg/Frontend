import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <meta name="robots" content="noindex" />
      <div className={styles.inner}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>

        <div className={styles.content}>
          <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
          <p className={styles.description}>
            삭제되었거나 주소가 변경된 페이지입니다.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.HOME} className={styles.homeButton}>
            홈으로 돌아가기
          </Link>
          <Link to={ROUTES.CONCERTS} className={styles.concertsLink}>
            공연 목록 보기
          </Link>
        </div>
      </div>
    </main>
  )
}

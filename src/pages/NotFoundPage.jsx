import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>

        <div className={styles.content}>
          <h1 className={styles.title}>페이지를 찾을 수 없어요</h1>
          <p className={styles.description}>
            요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있어요.
            <br className={styles.br} />
            URL을 다시 확인하거나 홈으로 돌아가 보세요.
          </p>
        </div>

        <Link to={ROUTES.HOME} className={styles.homeButton}>
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}

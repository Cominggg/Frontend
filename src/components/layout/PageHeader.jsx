import styles from './PageHeader.module.css'

// 엔티티 페이지(공연/아티스트/음악/캘린더/커뮤니티) 상단 타이틀 영역의 단일 소스.
// 모바일에서 페이지마다 제각각이던 폰트 크기·여백을 여기서만 관리한다.
function PageHeader({ title, spread = false, className = '', children }) {
  const rootClassName = [styles.pageHeader, spread && styles.spread, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {children}
    </div>
  )
}

export default PageHeader

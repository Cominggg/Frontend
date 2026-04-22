import styles from './ReleaseCardSkeleton.module.css'

function ReleaseCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cover} />
      <div className={styles.info}>
        <div className={`${styles.line} ${styles.xs}`} />
        <div className={`${styles.line} ${styles.lg}`} />
        <div className={`${styles.line} ${styles.md}`} />
      </div>
    </div>
  )
}

export default ReleaseCardSkeleton

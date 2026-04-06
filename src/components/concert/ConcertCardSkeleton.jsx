import styles from './ConcertCardSkeleton.module.css'

function ConcertCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.poster} />
      <div className={styles.info}>
        <div className={`${styles.line} ${styles.xs}`} />
        <div className={`${styles.line} ${styles.lg}`} />
        <div className={`${styles.line} ${styles.md}`} />
        <div className={`${styles.line} ${styles.md}`} />
      </div>
    </div>
  )
}

export default ConcertCardSkeleton

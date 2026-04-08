import styles from './ArtistCardSkeleton.module.css'

function ArtistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.avatar} />
      <div className={styles.name} />
      <div className={styles.genres}>
        <div className={`${styles.chip} ${styles.chip1}`} />
        <div className={`${styles.chip} ${styles.chip2}`} />
      </div>
      <div className={styles.btn} />
    </div>
  )
}

export default ArtistCardSkeleton

import styles from './PostListItemSkeleton.module.css'

function PostListItemSkeleton() {
  return (
    <div className={styles.row}>
      <div className={styles.category} />
      <div className={styles.title} />
      <div className={styles.meta} />
      <div className={styles.stats} />
    </div>
  )
}

export default PostListItemSkeleton

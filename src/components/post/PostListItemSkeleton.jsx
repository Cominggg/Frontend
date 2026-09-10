import styles from './PostListItemSkeleton.module.css'

function PostListItemSkeleton() {
  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.badge} />
        <div className={styles.title} />
      </div>
      <div className={styles.meta} />
    </div>
  )
}

export default PostListItemSkeleton

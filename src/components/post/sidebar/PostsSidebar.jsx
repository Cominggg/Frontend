import PopularPostsWidget from './PopularPostsWidget'
import UpcomingConcertsWidget from './UpcomingConcertsWidget'
import styles from './PostsSidebar.module.css'

function PostsSidebar() {
  return (
    <aside className={styles.sidebar}>
      <PopularPostsWidget />
      <UpcomingConcertsWidget />
    </aside>
  )
}

export default PostsSidebar

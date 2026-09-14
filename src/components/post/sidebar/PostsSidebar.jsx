import PopularPostsWidget from './PopularPostsWidget'
import TrendingTagsWidget from './TrendingTagsWidget'
import UpcomingConcertsWidget from './UpcomingConcertsWidget'
import styles from './PostsSidebar.module.css'

function PostsSidebar() {
  return (
    <aside className={styles.sidebar}>
      <PopularPostsWidget />
      <TrendingTagsWidget />
      <UpcomingConcertsWidget />
    </aside>
  )
}

export default PostsSidebar

import { useState } from 'react'

import PostEditor from '@/components/post/editor/PostEditor'
import usePageMeta from '@/hooks/usePageMeta'
import styles from './PostWritePage.module.css'

function PostWritePage() {
  const [contentJson, setContentJson] = useState(null)

  usePageMeta({
    title: '글쓰기 - 커밍',
    description: '공연 후기, 정보·제보, 자유 이야기를 남겨보세요.',
    path: '/community/write',
  })

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>글쓰기</h1>
        </div>
        <PostEditor content={contentJson} onChange={setContentJson} />
      </div>
    </div>
  )
}

export default PostWritePage

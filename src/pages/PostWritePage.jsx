import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import PostEditor from '@/components/post/editor/PostEditor'
import { extractEntityTags } from '@/components/post/editor/extractEntityTags'
import usePageMeta from '@/hooks/usePageMeta'
import { createPost } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import { CATEGORIES_REQUIRING_MENTION, MENTION_TYPE_LABEL, POST_CATEGORY_LABEL } from '@/constants/post'
import styles from './PostWritePage.module.css'

const CATEGORIES = ['REVIEW', 'INFO', 'FREE']

function PostWritePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('REVIEW')
  const [contentJson, setContentJson] = useState(null)
  const [error, setError] = useState(null)

  const entityTags = useMemo(() => extractEntityTags(contentJson), [contentJson])
  const mentionRequired = CATEGORIES_REQUIRING_MENTION.includes(category)

  usePageMeta({
    title: '글쓰기 - 커밍',
    description: '공연 후기, 정보·제보, 자유 이야기를 남겨보세요.',
    path: '/community/write',
  })

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: ({ id }) => {
      navigate(ROUTES.COMMUNITY_DETAIL(id))
    },
    onError: () => {
      setError('게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })

  function handleSubmit() {
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (mentionRequired && entityTags.length === 0) {
      setError(`${POST_CATEGORY_LABEL[category]} 게시글은 공연·아티스트·음악을 1개 이상 태그해야 해요. 본문에 '/'를 입력해 태그해보세요.`)
      return
    }
    setError(null)

    createMutation.mutate({
      category,
      title: title.trim(),
      content: contentJson,
      entityTags: entityTags.map(({ entityType, entityId }) => ({ entityType, entityId })),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>글쓰기</h1>
        </div>

        <div className={styles.categoryBar} role="tablist" aria-label="카테고리 선택">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={category === c ? styles.categoryTabActive : styles.categoryTab}
              onClick={() => setCategory(c)}
            >
              {POST_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <input
          type="text"
          className={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />

        <PostEditor content={contentJson} onChange={setContentJson} />

        <div className={styles.tagRow}>
          <span className={styles.tagRowLabel}>
            태그된 항목{mentionRequired ? ' (1개 이상 필수)' : ''}
          </span>
          {entityTags.length > 0 ? (
            <div className={styles.tagList}>
              {entityTags.map((tag) => (
                <span key={`${tag.entityType}:${tag.entityId}`} className={styles.tagChip}>
                  {MENTION_TYPE_LABEL[tag.entityType]} · {tag.title}
                </span>
              ))}
            </div>
          ) : (
            <span className={styles.tagRowEmpty}>본문에 '/'를 입력해 공연·아티스트·음악을 태그해보세요</span>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.submitRow}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '등록 중...' : '등록'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PostWritePage

import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import PostEditor from '@/components/post/editor/PostEditor'
import { extractEntityTags, isContentEmpty } from '@/components/post/editor/extractEntityTags'
import BackButton from '@/components/ui/BackButton'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import usePageMeta from '@/hooks/usePageMeta'
import { createPost, getPost, updatePost } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import {
  MENTION_TYPE_LABEL,
  POST_CATEGORY_LABEL,
  POST_CONTENT_MAX_LENGTH,
  POST_ENTITY_TAG_MAX_COUNT,
} from '@/constants/post'
import styles from './PostWritePage.module.css'

const CATEGORIES = ['FREE', 'INFO', 'REVIEW']

function PostWritePage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const postId = isEditMode ? Number(id) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('FREE')
  const [contentJson, setContentJson] = useState(null)
  const [contentLength, setContentLength] = useState(0)
  const [error, setError] = useState(null)
  const [formReady, setFormReady] = useState(!isEditMode)

  const { data: existingPost, isLoading: isLoadingPost, isError: isPostError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: isEditMode,
    retry: false,
  })

  if (isEditMode && existingPost && !formReady) {
    setFormReady(true)
    setTitle(existingPost.title)
    setCategory(existingPost.category)
    setContentJson(existingPost.content)
  }

  const entityTags = useMemo(() => extractEntityTags(contentJson), [contentJson])
  const backFallback = isEditMode ? ROUTES.COMMUNITY_DETAIL(postId) : ROUTES.COMMUNITY

  usePageMeta({
    title: isEditMode ? '게시글 수정 - 커밍' : '게시글 작성 - 커밍',
    description: '자유, 정보, 공연 후기 이야기를 남겨보세요.',
    path: isEditMode ? `/community/${postId}/edit` : '/community/write',
  })

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: ({ id: newId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(ROUTES.COMMUNITY_DETAIL(newId))
    },
    onError: () => {
      setError('게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(ROUTES.COMMUNITY_DETAIL(postId))
    },
    onError: () => {
      setError('게시글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function handleSubmit() {
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (isContentEmpty(contentJson)) {
      setError('본문을 입력해주세요.')
      return
    }
    if (contentLength > POST_CONTENT_MAX_LENGTH) {
      setError(`본문은 ${POST_CONTENT_MAX_LENGTH.toLocaleString()}자를 초과할 수 없습니다.`)
      return
    }
    if (entityTags.length > POST_ENTITY_TAG_MAX_COUNT) {
      setError(`태그는 최대 ${POST_ENTITY_TAG_MAX_COUNT}개까지 추가할 수 있습니다.`)
      return
    }
    setError(null)

    const payload = {
      category,
      title: title.trim(),
      content: contentJson,
      entityTags: entityTags.map(({ entityType, entityId }) => ({ entityType, entityId })),
    }

    if (isEditMode) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isEditMode && isPostError) {
    return (
      <EmptyState
        message="게시글이 존재하지 않습니다"
        action={{ to: ROUTES.COMMUNITY, label: '커뮤니티 목록으로' }}
      />
    )
  }

  if (isEditMode && (isLoadingPost || !formReady)) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <BackButton fallback={backFallback} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonBar} />
          <div className={styles.card}>
            <div className={styles.skeletonInput} />
            <div className={styles.skeletonBody} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <BackButton fallback={backFallback} />

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{isEditMode ? '게시글 수정' : '게시글 작성'}</h1>
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

        <div className={styles.card}>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />

          <PostEditor
            content={contentJson}
            onChange={setContentJson}
            onCharacterCountChange={setContentLength}
          />

          <div
            className={
              contentLength > POST_CONTENT_MAX_LENGTH ? styles.contentCountOver : styles.contentCount
            }
          >
            {contentLength.toLocaleString()} / {POST_CONTENT_MAX_LENGTH.toLocaleString()}자
          </div>

          <div className={styles.tagRow}>
            <span className={styles.tagRowLabel}>
              태그된 항목{' '}
              <span
                className={
                  entityTags.length > POST_ENTITY_TAG_MAX_COUNT
                    ? styles.tagCountOver
                    : styles.tagCount
                }
              >
                ({entityTags.length}/{POST_ENTITY_TAG_MAX_COUNT})
              </span>
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
              <span className={styles.tagRowEmpty}>아직 태그한 항목이 없어요</span>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.submitRow}>
            <Button
              type="button"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '등록'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostWritePage

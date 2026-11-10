import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CoverConcertPicker from '@/components/post/CoverConcertPicker'
import PostEditor from '@/components/post/editor/PostEditor'
import { extractEntityTags, isContentEmpty } from '@/components/post/editor/extractEntityTags'
import { isContentJsonTooLong } from '@/components/post/editor/postContentLength'
import BackButton from '@/components/ui/BackButton'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import usePageMeta from '@/hooks/usePageMeta'
import { createPost, getPost, updatePost } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import {
  POST_CATEGORY_LABEL,
  POST_CONTENT_MAX_LENGTH,
  POST_ENTITY_TAG_MAX_COUNT,
} from '@/constants/post'
import styles from './PostWritePage.module.css'

const CATEGORIES = ['FREE', 'INFO', 'REVIEW']
const TITLE_MAX_LENGTH = 100
// 이 글자 수부터 상태줄 글자 수를 강조해 한도가 가까움을 알린다
const CONTENT_NEAR_LIMIT_LENGTH = 9000

// 공연 카드가 이만큼 있어야 대표 공연을 고를 의미가 있다 (1개면 그 카드가 곧 기본 대표)
const COVER_PICKER_MIN_CONCERTS = 2

const SUBMIT_ERROR_MESSAGE = {
  POST_CONTENT_INVALID_FORMAT: '지원하지 않는 서식이 있어요. 붙여넣은 내용을 확인해주세요.',
  POST_CONTENT_TOO_LONG: '본문이 너무 길어요. 글자 수를 줄여주세요.',
  POST_CONCERT_TAG_HIDDEN: '지금은 언급할 수 없는 공연이 있어요. 해당 공연 카드를 지워주세요.',
  POST_COVER_CONCERT_NOT_TAGGED: '대표 공연이 본문에 없어요. 대표 공연을 다시 골라주세요.',
}

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
  // 사용자가 직접 고른 대표 공연. 고르지 않았으면 요청에 coverConcertId를 보내지 않는다
  // (같은 값을 다시 보내면 그사이 숨겨진 공연일 때 400이 나기 때문)
  const [coverConcertId, setCoverConcertId] = useState(null)
  const [coverTouched, setCoverTouched] = useState(false)
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
    setCoverConcertId(existingPost.coverConcertId ?? null)
  }

  const entityTags = useMemo(() => extractEntityTags(contentJson), [contentJson])
  const concertTags = entityTags.filter((tag) => tag.entityType === 'CONCERT')
  // 선택한 공연 카드를 본문에서 지우면 선택도 풀린다 (기본값인 본문 첫 공연 카드로 돌아감)
  const selectedCoverId = concertTags.some((tag) => tag.entityId === coverConcertId) ? coverConcertId : null
  const isContentTooLong = contentLength > POST_CONTENT_MAX_LENGTH
  const isContentNearLimit = contentLength >= CONTENT_NEAR_LIMIT_LENGTH
  const isTagOver = entityTags.length > POST_ENTITY_TAG_MAX_COUNT
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
    onError: (err) => {
      setError(SUBMIT_ERROR_MESSAGE[err.response?.data?.code] ?? '게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(ROUTES.COMMUNITY_DETAIL(postId))
    },
    onError: (err) => {
      setError(SUBMIT_ERROR_MESSAGE[err.response?.data?.code] ?? '게시글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
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
    if (isContentTooLong) {
      setError(`본문은 ${POST_CONTENT_MAX_LENGTH.toLocaleString()}자를 초과할 수 없습니다.`)
      return
    }
    if (isContentJsonTooLong(contentJson)) {
      setError('본문 데이터가 너무 큽니다. 언급 카드나 서식을 줄여주세요.')
      return
    }
    if (isTagOver) {
      setError(`태그는 최대 ${POST_ENTITY_TAG_MAX_COUNT}개까지 추가할 수 있습니다.`)
      return
    }
    setError(null)

    const payload = {
      category,
      title: title.trim(),
      content: contentJson,
      // entityTags는 BE가 본문 카드에서 추출한다
      ...(coverTouched && selectedCoverId != null && { coverConcertId: selectedCoverId }),
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

  if (isEditMode && existingPost && !existingPost.isAuthor) {
    return (
      <EmptyState
        message="게시글을 수정할 권한이 없습니다"
        action={{ to: ROUTES.COMMUNITY_DETAIL(postId), label: '게시글로 돌아가기' }}
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
            <div className={styles.editorBody}>
              <div className={styles.skeletonInput} />
              <div className={styles.skeletonBody} />
            </div>
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
          {/* 한 가지를 고르는 입력이라 탭 대신 라디오 그룹 (방향키 이동은 브라우저 기본 동작) */}
          <div className={styles.segment} role="radiogroup" aria-label="카테고리">
            {CATEGORIES.map((c) => (
              <label key={c} className={category === c ? styles.segmentItemActive : styles.segmentItem}>
                <input
                  type="radio"
                  name="category"
                  value={c}
                  className={styles.segmentRadio}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                />
                {POST_CATEGORY_LABEL[c]}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.titleRow}>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="제목을 입력하세요"
              aria-label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX_LENGTH}
            />
            <span className={styles.titleCount} aria-hidden="true">
              {title.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>

          <div className={styles.editorBody}>
            <PostEditor
              content={contentJson}
              onChange={setContentJson}
              onCharacterCountChange={setContentLength}
            />
          </div>

          <div className={styles.statusBar}>
            <span className={styles.statusHint}>/ 를 입력해 서식과 공연을 넣을 수 있어요</span>
            <span className={isTagOver ? styles.statusOver : undefined}>
              언급 {entityTags.length}/{POST_ENTITY_TAG_MAX_COUNT}
            </span>
            <span
              className={
                isContentTooLong ? styles.statusOver : isContentNearLimit ? styles.statusNear : undefined
              }
            >
              {contentLength.toLocaleString()} / {POST_CONTENT_MAX_LENGTH.toLocaleString()}자
            </span>
          </div>
        </div>

        {concertTags.length >= COVER_PICKER_MIN_CONCERTS && (
          <CoverConcertPicker
            concerts={concertTags}
            selectedId={selectedCoverId}
            onSelect={(concertId) => {
              setCoverConcertId(concertId)
              setCoverTouched(true)
            }}
          />
        )}

        {isContentTooLong && (
          <p className={styles.overNotice} role="status">
            본문이 {POST_CONTENT_MAX_LENGTH.toLocaleString()}자를 넘었어요.{' '}
            {(contentLength - POST_CONTENT_MAX_LENGTH).toLocaleString()}자를 줄이면 등록할 수 있어요.
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.submitRow}>
          <Button
            type="button"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting || isContentTooLong}
          >
            {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '등록'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PostWritePage

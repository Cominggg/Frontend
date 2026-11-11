import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import PostEditor from '@/components/post/editor/PostEditor'
import { isContentEmpty } from '@/components/post/editor/extractEntityTags'
import { isContentJsonTooLong } from '@/components/post/editor/postContentLength'
import { POST_CONTENT_MAX_LENGTH } from '@/constants/post'
import { ROUTES } from '@/constants/routes'
import { getAdminNotice, createNotice, updateNotice } from '@/services/adminApi'
import styles from './AdminFormPage.module.css'
import noticeStyles from './AdminNoticeFormPage.module.css'

// content는 게시글과 같은 Tiptap JSON (spec/client/post-content.md)
const EMPTY_FORM = { title: '', content: null, active: true }

const SUBMIT_ERROR_MESSAGE = {
  CONTENT_INVALID_FORMAT: '지원하지 않는 서식이 있어요. 붙여넣은 내용을 확인해주세요.',
  CONTENT_TOO_LONG: '본문이 너무 길어요. 글자 수를 줄여주세요.',
}

function AdminNoticeFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [contentLength, setContentLength] = useState(0)

  const { data: notice, isLoading: loadingNotice, isError: noticeLoadFailed } = useQuery({
    queryKey: ['admin', 'notice', id],
    queryFn: () => getAdminNotice(id),
    enabled: isEdit,
    staleTime: 0,
    // 캐시된 이전 공지로 폼이 채워지면 이후 refetch가 반영되지 않으므로, 진입할 때마다 새로 조회
    gcTime: 0,
  })

  // 조회 결과로 폼을 한 번만 채운다 — 이후 refetch가 편집 중인 값을 덮어쓰지 않도록
  const [filledNoticeId, setFilledNoticeId] = useState(null)
  if (notice && filledNoticeId !== id) {
    setFilledNoticeId(id)
    setForm({ title: notice.title, content: notice.content, active: notice.active })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (contentLength > POST_CONTENT_MAX_LENGTH) {
      setError(`내용은 ${POST_CONTENT_MAX_LENGTH.toLocaleString()}자를 넘을 수 없습니다.`)
      return
    }
    if (isContentJsonTooLong(form.content)) {
      setError('내용 데이터가 너무 큽니다. 언급 카드나 서식을 줄여주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await updateNotice(id, form)
      } else {
        await createNotice(form)
      }
      setSavedMsg('저장되었습니다.')
      setTimeout(() => navigate(ROUTES.ADMIN_NOTICES), 600)
    } catch (err) {
      setError(SUBMIT_ERROR_MESSAGE[err.response?.data?.code] ?? '저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN_NOTICES} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          공지사항 관리
        </Link>
        <h1 className={styles.pageTitle}>{isEdit ? '공지 수정' : '새 공지 작성'}</h1>
        <p className={styles.pageDesc}>게시글과 같은 서식과 공연·아티스트·음악 카드를 쓸 수 있습니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>제목 <span className={styles.required}>*</span></span>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="공지 제목을 입력하세요"
              disabled={loadingNotice}
            />
          </label>

          <div className={styles.field} style={{ marginTop: '1rem' }}>
            <span className={styles.fieldLabel} id="notice-content-label">내용 <span className={styles.required}>*</span></span>
            {/* 에디터는 처음 받은 content로만 초기화되므로, 수정 모드는 조회가 끝난 뒤에 띄운다 */}
            {isEdit && !filledNoticeId ? (
              <div className={noticeStyles.editorPlaceholder} aria-busy="true" />
            ) : (
              <div className={noticeStyles.editor} role="group" aria-labelledby="notice-content-label">
                <PostEditor
                  content={form.content}
                  onChange={(json) => setField('content', json)}
                  onCharacterCountChange={setContentLength}
                  tagLimit={false}
                />
                <span className={contentLength > POST_CONTENT_MAX_LENGTH ? noticeStyles.countOver : noticeStyles.count}>
                  {contentLength.toLocaleString()} / {POST_CONTENT_MAX_LENGTH.toLocaleString()}자
                </span>
              </div>
            )}
          </div>

          <label className={noticeStyles.activeToggle}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setField('active', e.target.checked)}
              disabled={loadingNotice}
            />
            커뮤니티 홈에 노출
          </label>
        </section>

        {(error || noticeLoadFailed) && <p className={styles.errorMsg}>{error || '공지를 찾을 수 없습니다.'}</p>}

        <div className={styles.formFooter}>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={loadingNotice || saving || Boolean(savedMsg) || !form.title.trim() || isContentEmpty(form.content)}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminNoticeFormPage

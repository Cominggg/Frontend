import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import { register, checkNickname } from '@/services/authApi'
import { ROUTES } from '@/constants/routes'
import { LOGIN_REDIRECT_KEY } from '@/constants/auth'
import { TERMS_CONTENT, PRIVACY_CONTENT, MARKETING_CONTENT } from '@/constants/policy'
import Logo from '@/components/ui/Logo'
import { trackEvent } from '@/utils/analytics'
import styles from './SignupPage.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const MIN_AGE = 14
const MAX_NICKNAME = 20

const TERMS = [
  { id: 'agreedTerms', label: '서비스 이용약관 동의', required: true, content: TERMS_CONTENT },
  { id: 'agreedPrivacy', label: '개인정보처리방침 동의', required: true, content: PRIVACY_CONTENT },
  { id: 'agreedMarketing', label: '마케팅 수신 동의', required: false, content: MARKETING_CONTENT },
]

function TermsModal({ term, onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const modal = modalRef.current
    modal?.focus()

    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalBox}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={term.label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{term.label}</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalContent}>
          <pre className={styles.modalText}>{term.content}</pre>
        </div>
      </div>
    </div>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setUser = useAuthStore((s) => s.setUser)

  const [nickname, setNickname] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [consents, setConsents] = useState({ agreedTerms: false, agreedPrivacy: false, agreedMarketing: false })
  const [allAgreed, setAllAgreed] = useState(false)

  const [nicknameStatus, setNicknameStatus] = useState(null) // null | 'checking' | 'available' | 'unavailable'
  const [nicknameError, setNicknameError] = useState('')
  const [birthYearError, setBirthYearError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openTermId, setOpenTermId] = useState(null)

  const nicknameTimer = useRef(null)

  useEffect(() => {
    document.title = '회원가입 - 커밍'
    return () => { document.title = '커밍 - Jpop 아티스트 내한 공연 정보' }
  }, [])

  function handleAllAgreed(checked) {
    setAllAgreed(checked)
    setConsents({ agreedTerms: checked, agreedPrivacy: checked, agreedMarketing: checked })
  }

  function handleConsent(id, checked) {
    const next = { ...consents, [id]: checked }
    setConsents(next)
    setAllAgreed(Object.values(next).every(Boolean))
  }

  const handleNicknameChange = useCallback((value) => {
    setNickname(value)
    setNicknameStatus(null)
    setNicknameError('')
    clearTimeout(nicknameTimer.current)

    if (!value.trim()) return
    if (value.length > MAX_NICKNAME) {
      setNicknameError(`닉네임은 ${MAX_NICKNAME}자 이하여야 합니다.`)
      return
    }

    nicknameTimer.current = setTimeout(async () => {
      setNicknameStatus('checking')
      try {
        const { available } = await checkNickname(value.trim())
        setNicknameStatus(available ? 'available' : 'unavailable')
        if (!available) setNicknameError('이미 사용 중인 닉네임입니다.')
      } catch {
        setNicknameStatus(null)
      }
    }, 400)
  }, [])

  function validateBirthYear(value) {
    const year = parseInt(value, 10)
    if (!value || isNaN(year)) {
      setBirthYearError('출생연도를 입력해주세요.')
      return false
    }
    if (year < 1900 || year > CURRENT_YEAR) {
      setBirthYearError('올바른 출생연도를 입력해주세요.')
      return false
    }
    if (CURRENT_YEAR - year < MIN_AGE) {
      setBirthYearError(`만 ${MIN_AGE}세 이상만 가입할 수 있습니다.`)
      return false
    }
    setBirthYearError('')
    return true
  }

  const requiredConsentsAgreed = consents.agreedTerms && consents.agreedPrivacy
  const canSubmit =
    nickname.trim() &&
    nicknameStatus === 'available' &&
    !birthYearError &&
    birthYear &&
    requiredConsentsAgreed &&
    !isSubmitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateBirthYear(birthYear)) return
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const { accessToken } = await register({
        nickname: nickname.trim(),
        birthYear: parseInt(birthYear, 10),
        agreedTerms: consents.agreedTerms,
        agreedPrivacy: consents.agreedPrivacy,
        agreedMarketing: consents.agreedMarketing,
      })
      setAccessToken(accessToken)
      const { getMe } = await import('@/services/authApi')
      const user = await getMe()
      setUser(user)
      trackEvent('sign_up')
      const raw = localStorage.getItem(LOGIN_REDIRECT_KEY)
      localStorage.removeItem(LOGIN_REDIRECT_KEY)
      const redirectUri = raw && raw.startsWith('/') ? raw : ROUTES.HOME
      navigate(redirectUri, { replace: true })
    } catch (err) {
      const code = err.response?.data?.code
      if (code === 'NICKNAME_DUPLICATE') {
        setNicknameStatus('unavailable')
        setNicknameError('이미 사용 중인 닉네임입니다.')
      } else if (code === 'TERMS_NOT_AGREED') {
        setSubmitError('필수 약관에 동의해주세요.')
      } else {
        setSubmitError('회원가입에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openTerm = TERMS.find((t) => t.id === openTermId)

  if (isInitialized && user && user.role !== 'PENDING') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <Logo size="lg" />
        </div>
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.subtitle}>커밍을 이용하려면 아래 정보를 입력해주세요.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* 닉네임 */}
          <div className={styles.field}>
            <label htmlFor="signup-nickname" className={styles.label}>
              닉네임 <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <input
                id="signup-nickname"
                type="text"
                className={`${styles.input} ${nicknameStatus === 'unavailable' ? styles.inputError : nicknameStatus === 'available' ? styles.inputOk : ''}`}
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value.slice(0, MAX_NICKNAME))}
                placeholder="닉네임을 입력하세요"
                maxLength={MAX_NICKNAME}
                autoComplete="nickname"
              />
              <span className={`${styles.charCount} ${nickname.length >= MAX_NICKNAME ? styles.charCountMax : ''}`}>
                {nickname.length}/{MAX_NICKNAME}
              </span>
            </div>
            {nicknameStatus === 'checking' && (
              <p className={styles.fieldHint}>중복 확인 중...</p>
            )}
            {nicknameStatus === 'available' && (
              <p className={styles.fieldOk}>사용 가능한 닉네임입니다.</p>
            )}
            {nicknameError && <p className={styles.fieldError}>{nicknameError}</p>}
          </div>

          {/* 출생연도 */}
          <div className={styles.field}>
            <label htmlFor="signup-birth-year" className={styles.label}>
              출생연도 <span className={styles.required}>*</span>
            </label>
            <input
              id="signup-birth-year"
              type="number"
              className={`${styles.input} ${birthYearError ? styles.inputError : ''}`}
              value={birthYear}
              onChange={(e) => { setBirthYear(e.target.value); setBirthYearError('') }}
              onBlur={() => birthYear && validateBirthYear(birthYear)}
              placeholder={`예: ${CURRENT_YEAR - 20}`}
              min={1900}
              max={CURRENT_YEAR - MIN_AGE}
            />
            {birthYearError
              ? <p className={styles.fieldError}>{birthYearError}</p>
              : <p className={styles.fieldHint}>만 {MIN_AGE}세 이상만 가입할 수 있습니다.</p>
            }
          </div>

          {/* 약관 동의 */}
          <div className={styles.termsSection}>
            <label className={styles.termRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allAgreed}
                onChange={(e) => handleAllAgreed(e.target.checked)}
              />
              <span className={styles.termLabelAll}>전체 동의</span>
            </label>
            <div className={styles.termsDivider} />
            {TERMS.map((term) => (
              <div key={term.id} className={styles.termRow}>
                <label className={styles.termCheck}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={consents[term.id]}
                    onChange={(e) => handleConsent(term.id, e.target.checked)}
                  />
                  <span className={styles.termLabel}>
                    {term.required ? <span className={styles.required}>[필수] </span> : <span className={styles.optional}>[선택] </span>}
                    {term.label}
                  </span>
                </label>
                <button
                  type="button"
                  className={styles.termViewBtn}
                  onClick={() => setOpenTermId(term.id)}
                >
                  전문 보기
                </button>
              </div>
            ))}
          </div>

          {submitError && <p className={styles.submitError}>{submitError}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit}
          >
            {isSubmitting ? '처리 중...' : '가입하기'}
          </button>
        </form>
      </div>

      {openTerm && (
        <TermsModal term={openTerm} onClose={() => setOpenTermId(null)} />
      )}
    </div>
  )
}

export default SignupPage

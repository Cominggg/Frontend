import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import useSuspensionStore from '@/stores/suspensionStore'
import { refreshAccessToken } from '@/services/api'
import { getMe } from '@/services/authApi'
import { ROUTES } from '@/constants/routes'
import { LOGIN_REDIRECT_KEY } from '@/constants/auth'
import { SUPPORT_EMAIL } from '@/constants/site'
import { trackEvent } from '@/utils/analytics'
import { formatDateTime } from '@/utils/date'
import styles from './AuthCallbackPage.module.css'

const AUTH_ERRORS = {
  OAUTH2_FAILED: '로그인에 실패했습니다. 다시 시도해 주세요.',
}
const CALLBACK_FAILED_MESSAGE = '로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.'

// rejoinAvailableAt은 오프셋 없는 KST 시각이므로 Date로 변환하지 않고 문자열 그대로 표시한다
function getRejoinMessage(rejoinAvailableAt) {
  const period = rejoinAvailableAt ? `${formatDateTime(rejoinAvailableAt)}까지` : '일정 기간'
  return `이용 정지 중 탈퇴한 계정은 ${period} 다시 가입할 수 없습니다.`
}

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)
  const openSuspensionNotice = useSuspensionStore((s) => s.open)
  const called = useRef(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (called.current) return
    called.current = true

    async function handleCallback() {
      const error = searchParams.get('error')
      // 정지 회원 — suspendedUntil이 없으면 영구 정지
      if (error === 'USER_SUSPENDED') {
        openSuspensionNotice({
          suspendedUntil: searchParams.get('suspendedUntil'),
          reason: searchParams.get('reason'),
        })
        navigate(ROUTES.HOME, { replace: true })
        return
      }
      if (error) {
        setErrorMessage(
          error === 'REJOIN_RESTRICTED'
            ? getRejoinMessage(searchParams.get('rejoinAvailableAt'))
            : (AUTH_ERRORS[error] ?? '알 수 없는 오류가 발생했습니다.'),
        )
        return
      }

      try {
        await refreshAccessToken()

        const user = await getMe()
        setUser(user)
        trackEvent('login')

        const isNewUser = searchParams.get('isNewUser') === 'true'
        if (isNewUser || user.role === 'PENDING') {
          navigate(ROUTES.SIGNUP, { replace: true })
          return
        }

        const raw = localStorage.getItem(LOGIN_REDIRECT_KEY)
        localStorage.removeItem(LOGIN_REDIRECT_KEY)
        const redirectUri = raw && raw.startsWith('/') ? raw : ROUTES.HOME
        navigate(redirectUri, { replace: true })
      } catch {
        setErrorMessage(CALLBACK_FAILED_MESSAGE)
      }
    }

    handleCallback()
  }, [navigate, searchParams, setUser, openSuspensionNotice])

  if (errorMessage) {
    const rejoinRestricted = searchParams.get('error') === 'REJOIN_RESTRICTED'
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorMessage}>{errorMessage}</p>
        {rejoinRestricted && (
          <p className={styles.guide}>
            재가입 제한 기준은 <Link to={ROUTES.OPERATION_POLICY} className={styles.link}>운영정책</Link> 제7조에서
            확인할 수 있습니다. 문의는 <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.link}>{SUPPORT_EMAIL}</a>로
            보내 주세요.
          </p>
        )}
        <button className={styles.homeButton} onClick={() => navigate(ROUTES.HOME, { replace: true })}>
          홈으로 이동
        </button>
      </div>
    )
  }

  return null
}

export default AuthCallbackPage

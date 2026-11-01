import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import useSuspensionStore from '@/stores/suspensionStore'
import { refreshAccessToken } from '@/services/api'
import { getMe } from '@/services/authApi'
import { ROUTES } from '@/constants/routes'
import { LOGIN_REDIRECT_KEY } from '@/constants/auth'
import { trackEvent } from '@/utils/analytics'
import styles from './AuthCallbackPage.module.css'

const AUTH_ERRORS = {
  OAUTH2_FAILED: '로그인에 실패했습니다. 다시 시도해 주세요.',
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
        setErrorMessage(AUTH_ERRORS[error] ?? '알 수 없는 오류가 발생했습니다.')
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
        navigate(ROUTES.HOME, { replace: true })
      }
    }

    handleCallback()
  }, [navigate, searchParams, setUser, openSuspensionNotice])

  if (errorMessage) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorMessage}>{errorMessage}</p>
        <button className={styles.homeButton} onClick={() => navigate(ROUTES.HOME, { replace: true })}>
          홈으로 이동
        </button>
      </div>
    )
  }

  return null
}

export default AuthCallbackPage

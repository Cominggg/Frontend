import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import useAuthStore from '@/stores/authStore'
import { getMe } from '@/services/authApi'
import { ROUTES } from '@/constants/routes'
import { LOGIN_REDIRECT_KEY } from '@/constants/auth'
import styles from './AuthCallbackPage.module.css'

const AUTH_ERRORS = {
  USER_SUSPENDED: '정지된 계정입니다. 문의하세요.',
  OAUTH2_FAILED: '로그인에 실패했습니다. 다시 시도해 주세요.',
}

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const called = useRef(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (called.current) return
    called.current = true

    async function handleCallback() {
      const error = searchParams.get('error')
      if (error) {
        setErrorMessage(AUTH_ERRORS[error] ?? '알 수 없는 오류가 발생했습니다.')
        return
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', null, { withCredentials: true })
        setAccessToken(data.accessToken)

        const user = await getMe()
        setUser(user)

        const isNewUser = searchParams.get('isNewUser') === 'true'
        if (isNewUser || user.role === 'PENDING') {
          navigate(ROUTES.SIGNUP, { replace: true })
          return
        }

        const redirectUri = localStorage.getItem(LOGIN_REDIRECT_KEY) || ROUTES.HOME
        localStorage.removeItem(LOGIN_REDIRECT_KEY)
        navigate(redirectUri, { replace: true })
      } catch {
        navigate(ROUTES.HOME, { replace: true })
      }
    }

    handleCallback()
  }, [navigate, searchParams, setAccessToken, setUser])

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

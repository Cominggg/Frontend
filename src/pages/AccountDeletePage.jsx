import { Link, useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { SUPPORT_EMAIL } from '@/constants/site'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './AccountDeletePage.module.css'

const MAIL_SUBJECT = encodeURIComponent('[커밍] 회원 탈퇴 요청')

const RETAINED_ITEMS = [
  { item: '서비스 이용 기록', period: '3개월', basis: '통신비밀보호법' },
  { item: '신고 접수·처리 기록', period: '처리 완료일로부터 1년', basis: '부정 신고 확인·분쟁 대응' },
  { item: '소셜 로그인 식별자', period: '탈퇴일로부터 30일 (이용 정지 중 탈퇴 시 연장)', basis: '재가입 남용 방지' },
]

function AccountDeletePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  function handleGoToSettings() {
    if (user) {
      navigate(ROUTES.ME_SETTINGS)
      return
    }
    openLoginModal(ROUTES.ME_SETTINGS)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>회원 탈퇴 안내</h1>
        <p className={styles.lead}>커밍(Coming) 계정과 데이터 삭제 방법, 탈퇴 시 처리되는 정보를 안내합니다.</p>

        <section className={styles.section} aria-labelledby="delete-methods">
          <h2 id="delete-methods" className={styles.sectionTitle}>탈퇴 방법</h2>
          <div className={styles.methods}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>방법 1</span>
              <h3 className={styles.cardTitle}>서비스에서 직접 탈퇴</h3>
              <ol className={styles.steps}>
                <li>커밍에 로그인합니다.</li>
                <li>마이페이지의 설정 탭으로 이동합니다.</li>
                <li>회원 탈퇴를 누르고 확인합니다.</li>
              </ol>
              <Button size="sm" className={styles.cardBtn} onClick={handleGoToSettings}>
                회원 탈퇴하러 가기
              </Button>
            </div>

            <div className={styles.card}>
              <span className={styles.cardLabel}>방법 2</span>
              <h3 className={styles.cardTitle}>이메일로 요청</h3>
              <p className={styles.notice}>이용 정지로 로그인할 수 없다면 이 방법으로 요청하세요.</p>
              <p className={styles.cardText}>
                가입한 소셜 계정(Google·Kakao)의 이메일 주소로 아래 주소에 탈퇴를 요청하면 운영자가 확인 후 탈퇴를 처리하고 결과를 메일로 알려 드립니다.
              </p>
              <a className={styles.mailLink} href={`mailto:${SUPPORT_EMAIL}?subject=${MAIL_SUBJECT}`}>
                {SUPPORT_EMAIL}
              </a>
              <p className={styles.cardHint}>메일에 가입한 소셜 로그인 종류(Google 또는 Kakao)와 닉네임을 함께 적어 주세요.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="delete-data">
          <h2 id="delete-data" className={styles.sectionTitle}>탈퇴 시 처리되는 정보</h2>

          <div className={styles.notice}>
            <h3 className={styles.blockTitle}>게시글·댓글은 삭제되지 않습니다</h3>
            <p className={styles.blockText}>
              작성자가 &quot;탈퇴 회원&quot;으로 표시된 채 남습니다. 탈퇴 후에는 직접 삭제할 수 없으니, 삭제를 원하면 탈퇴 전에 지워 주세요.
            </p>
          </div>

          <h3 className={styles.blockTitle}>즉시 삭제</h3>
          <ul className={styles.list}>
            <li>이메일 주소, 닉네임, 출생연도, 마케팅 수신 동의 여부</li>
            <li>평점, 관심 아티스트, 캘린더, 문의 내역</li>
          </ul>

          <h3 className={styles.blockTitle}>일정 기간 보관 후 파기</h3>
          <dl className={styles.retained}>
            {RETAINED_ITEMS.map(({ item, period, basis }) => (
              <div key={item} className={styles.retainedRow}>
                <dt className={styles.retainedItem}>{item}</dt>
                <dd className={styles.retainedPeriod}>{period}</dd>
                <dd className={styles.retainedBasis}>{basis}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="rejoin">
          <h2 id="rejoin" className={styles.sectionTitle}>다시 가입하려면</h2>
          <p className={styles.text}>
            같은 소셜 계정으로 다시 가입할 수 있습니다. 새 회원으로 가입되며 이전 계정의 정보는 이어지지 않습니다.
          </p>
          <p className={styles.notice}>
            이용 정지 중에 탈퇴하면 일정 기간 다시 가입할 수 없습니다.{' '}
            <Link to={ROUTES.OPERATION_POLICY} className={styles.inlineLink}>운영정책 보기</Link>
          </p>
        </section>

        <p className={styles.footnote}>
          자세한 내용은 <Link to={ROUTES.PRIVACY} className={styles.inlineLink}>개인정보처리방침</Link>에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

export default AccountDeletePage

import { Link } from 'react-router-dom'

import Button from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { REPORT_REASON_LABEL } from '@/constants/post'
import { SUPPORT_EMAIL } from '@/constants/site'
import { formatSuspensionPeriod } from '@/constants/suspension'
import useModalA11y from '@/hooks/useModalA11y'
import useSuspensionStore from '@/stores/suspensionStore'
import styles from './SuspensionNoticeModal.module.css'

function SuspensionNoticeModal() {
  const notice = useSuspensionStore((s) => s.notice)
  const close = useSuspensionStore((s) => s.close)
  const modalRef = useModalA11y(close, { isOpen: notice !== null })

  if (!notice) return null

  const period = formatSuspensionPeriod(notice.suspendedUntil)
  const reason = REPORT_REASON_LABEL[notice.reason] ?? '운영정책 위반'

  return (
    <div className={styles.overlay} onClick={close}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-title"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <h2 id="suspension-title" className={styles.title}>이용이 정지된 계정입니다</h2>
        <p className={styles.desc}>정지 기간에는 로그인과 서비스 이용이 제한됩니다.</p>

        <dl className={styles.info}>
          <div className={styles.infoRow}>
            <dt>정지 기간</dt>
            <dd>{period}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>사유</dt>
            <dd>{reason}</dd>
          </div>
        </dl>

        <p className={styles.appeal}>
          안내를 받은 날로부터 7일 이내에 가입한 소셜 계정의 이메일로{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.link}>{SUPPORT_EMAIL}</a>에 이의를 신청할 수 있습니다.
          정지 기간에는 직접 탈퇴할 수 없으니, 탈퇴를 원하시면 같은 주소로 요청해 주세요.
        </p>

        <div className={styles.actions}>
          <Link to={ROUTES.OPERATION_POLICY} className={styles.link} onClick={close}>운영정책 보기</Link>
          <Button size="sm" onClick={close}>확인</Button>
        </div>
      </div>
    </div>
  )
}

export default SuspensionNoticeModal

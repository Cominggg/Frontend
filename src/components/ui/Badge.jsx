import { CONCERT_STATUS_COLOR } from '@/constants/concert'
import styles from './Badge.module.css'

function Badge({ status }) {
  const color = CONCERT_STATUS_COLOR[status] ?? '#757575'

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {status}
    </span>
  )
}

export default Badge

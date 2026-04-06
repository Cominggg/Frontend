import { CONCERT_STATUS_COLOR } from '@/constants/concert'
import styles from './Badge.module.css'

function Badge({ status }) {
  const color = CONCERT_STATUS_COLOR[status] ?? '#757575'
  const label = status ?? '미정'

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {label}
    </span>
  )
}

export default Badge

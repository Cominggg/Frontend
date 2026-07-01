import logoBlack from '@/assets/x/logo-black.png'
import logoWhite from '@/assets/x/logo-white.png'
import styles from './XIcon.module.css'

function XIcon({ size = 20 }) {
  return (
    <>
      <img src={logoBlack} alt="" aria-hidden="true" className={styles.iconBlack} style={{ width: size, height: size }} />
      <img src={logoWhite} alt="" aria-hidden="true" className={styles.iconWhite} style={{ width: size, height: size }} />
    </>
  )
}

export default XIcon

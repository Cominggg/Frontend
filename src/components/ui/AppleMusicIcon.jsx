import iconBlack from '@/assets/apple-music/Apple_Music_Icon_blk_sm_073120.svg'
import iconWhite from '@/assets/apple-music/Apple_Music_Icon_wht_sm_073120.svg'
import styles from './AppleMusicIcon.module.css'

function AppleMusicIcon({ size = 20 }) {
  return (
    <>
      <img src={iconBlack} alt="" aria-hidden="true" className={styles.iconBlack} style={{ width: size, height: size }} />
      <img src={iconWhite} alt="" aria-hidden="true" className={styles.iconWhite} style={{ width: size, height: size }} />
    </>
  )
}

export default AppleMusicIcon

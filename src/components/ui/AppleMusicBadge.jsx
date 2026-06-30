import badgeBlack from '@/assets/apple-music/KR_Apple_Music_Listen_on_Lockup_RGB_blk_090420.png'
import badgeWhite from '@/assets/apple-music/KR_Apple_Music_Listen_on_Lockup_RGB_white_090420.png'
import styles from './AppleMusicBadge.module.css'

function AppleMusicBadge({ height = 32 }) {
  return (
    <>
      <img src={badgeBlack} alt="Apple Music에서 듣기" className={styles.badgeBlack} style={{ height }} />
      <img src={badgeWhite} alt="Apple Music에서 듣기" className={styles.badgeWhite} style={{ height }} />
    </>
  )
}

export default AppleMusicBadge

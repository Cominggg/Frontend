import iconBlack from '@/assets/youtube/yt_icon_almostblack_digital.png'
import iconWhite from '@/assets/youtube/yt_icon_white_digital.png'
import styles from './YouTubeIcon.module.css'

function YouTubeIcon({ size = 20 }) {
  const style = { width: size, height: size, objectFit: 'contain' }

  return (
    <>
      <img src={iconBlack} alt="" aria-hidden="true" className={styles.iconBlack} style={style} />
      <img src={iconWhite} alt="" aria-hidden="true" className={styles.iconWhite} style={style} />
    </>
  )
}

export default YouTubeIcon

import iconBlack from '@/assets/spotify/Primary_Logo_Black_RGB.svg'
import iconWhite from '@/assets/spotify/Primary_Logo_White_RGB.svg'
import styles from './SpotifyIcon.module.css'

function SpotifyIcon({ size = 22 }) {
  return (
    <>
      <img
        src={iconBlack}
        alt=""
        aria-hidden="true"
        className={styles.iconBlack}
        style={{ width: size, height: size }}
      />
      <img
        src={iconWhite}
        alt=""
        aria-hidden="true"
        className={styles.iconWhite}
        style={{ width: size, height: size }}
      />
    </>
  )
}

export default SpotifyIcon

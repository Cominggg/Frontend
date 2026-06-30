import glyphBlack from '@/assets/instagram/Instagram_Glyph_Black.svg'
import glyphWhite from '@/assets/instagram/Instagram_Glyph_White.svg'
import styles from './InstagramIcon.module.css'

function InstagramIcon({ size = 20 }) {
  return (
    <>
      <img src={glyphBlack} alt="" aria-hidden="true" className={styles.iconBlack} style={{ width: size, height: size }} />
      <img src={glyphWhite} alt="" aria-hidden="true" className={styles.iconWhite} style={{ width: size, height: size }} />
    </>
  )
}

export default InstagramIcon

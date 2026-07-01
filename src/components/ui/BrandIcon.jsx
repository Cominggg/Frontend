import styles from './BrandIcon.module.css'

function BrandIcon({ srcBlack, srcWhite, size = 20, objectFit }) {
  const style = { width: size, height: size, ...(objectFit && { objectFit }) }
  return (
    <>
      <img src={srcBlack} alt="" aria-hidden="true" className={styles.iconBlack} style={style} />
      <img src={srcWhite} alt="" aria-hidden="true" className={styles.iconWhite} style={style} />
    </>
  )
}

export default BrandIcon

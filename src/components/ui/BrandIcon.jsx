import styles from './BrandIcon.module.css'

// alt를 주면 출처 표기처럼 의미 있는 이미지로 읽히고, 없으면 장식용으로 숨긴다
function BrandIcon({ srcBlack, srcWhite, size = 20, height = size, objectFit, alt }) {
  const style = { width: size, height, ...(objectFit && { objectFit }) }
  const a11y = alt ? { alt } : { alt: '', 'aria-hidden': 'true' }
  return (
    <>
      <img src={srcBlack} {...a11y} className={styles.iconBlack} style={style} />
      <img src={srcWhite} {...a11y} className={styles.iconWhite} style={style} />
    </>
  )
}

export default BrandIcon

import styles from './SourceCredit.module.css'

function SourceCredit({ text, linkHref, linkText }) {
  return (
    <p className={styles.credit}>
      {text}
      {linkHref && (
        <>
          {' '}
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {linkText}
          </a>
        </>
      )}
    </p>
  )
}

export default SourceCredit

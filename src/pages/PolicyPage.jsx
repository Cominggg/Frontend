import styles from './PolicyPage.module.css'

function PolicyPage({ title, content }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        <pre className={styles.content}>{content}</pre>
      </div>
    </div>
  )
}

export default PolicyPage

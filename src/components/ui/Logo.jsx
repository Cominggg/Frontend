import styles from './Logo.module.css'

function Logo({ size = 'md' }) {
  return (
    <span className={`${styles.root} ${styles[size]}`}>
      <img
        src="/logo-96.png"
        alt=""
        className={styles.icon}
        aria-hidden="true"
        draggable={false}
      />
      <span className={styles.text}>Coming</span>
    </span>
  )
}

export default Logo

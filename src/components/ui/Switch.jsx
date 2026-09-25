import styles from './Switch.module.css'

function Switch({ checked, onChange, ariaLabel, size = 'md' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={size === 'sm' ? `${styles.switch} ${styles.sm}` : styles.switch}
    >
      <span className={styles.thumb} />
    </button>
  )
}

export default Switch

import styles from './FilterToggle.module.css'

function FilterToggle({ pressed, onClick, icon, children }) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${pressed ? styles.toggleActive : ''}`}
      onClick={onClick}
      aria-pressed={pressed}
    >
      {icon}
      {children}
    </button>
  )
}

export default FilterToggle

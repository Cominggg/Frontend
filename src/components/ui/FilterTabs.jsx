import useHorizontalWheelGuard from '@/hooks/useHorizontalWheelGuard'
import useEdgeFade from '@/hooks/useEdgeFade'
import styles from './FilterTabs.module.css'

function FilterTabs({ options, value, onChange, ariaLabel }) {
  const wheelGuardRef = useHorizontalWheelGuard()
  const { ref: fadeRef, style: fadeStyle } = useEdgeFade()
  const setRef = (el) => {
    wheelGuardRef.current = el
    fadeRef.current = el
  }

  return (
    <div
      ref={setRef}
      className={styles.tabs}
      role="tablist"
      aria-label={ariaLabel}
      style={fadeStyle}
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={`${styles.tab} ${option.value === value ? styles.tabActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs

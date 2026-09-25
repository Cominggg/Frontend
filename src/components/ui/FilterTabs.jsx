import useHorizontalScrollBar from '@/hooks/useHorizontalScrollBar'
import styles from './FilterTabs.module.css'

function FilterTabs({ options, value, onChange, ariaLabel }) {
  const { ref: scrollBarRef, style: fadeStyle } = useHorizontalScrollBar()

  return (
    <div
      ref={scrollBarRef}
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

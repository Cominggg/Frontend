import styles from './CoverConcertPicker.module.css'

// 대표 공연 선택 — 본문의 공연 카드가 2개 이상일 때만 작성 화면에 노출한다 (해제 UI 없음).
// 고르지 않았으면 본문 첫 공연 카드가 대표이므로 그 항목을 선택된 것으로 보여준다
function CoverConcertPicker({ concerts, selectedId, onSelect }) {
  const checkedId = selectedId ?? concerts[0]?.entityId

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>대표 공연</legend>
      <p className={styles.hint}>목록과 공유 미리보기에 이 포스터가 쓰입니다.</p>
      <div className={styles.options}>
        {concerts.map((concert) => (
          <label
            key={concert.entityId}
            className={concert.entityId === checkedId ? styles.optionChecked : styles.option}
          >
            <input
              type="radio"
              name="coverConcert"
              className={styles.radio}
              checked={concert.entityId === checkedId}
              onChange={() => onSelect(concert.entityId)}
            />
            <span
              className={styles.poster}
              style={concert.thumbnailUrl ? { backgroundImage: `url(${concert.thumbnailUrl})` } : undefined}
              aria-hidden="true"
            />
            <span className={styles.title}>{concert.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default CoverConcertPicker

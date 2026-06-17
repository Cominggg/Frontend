import ReactDatePicker from 'react-datepicker'
import { ko } from 'date-fns/locale'
import { format } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './AppDatePicker.module.css'

function parseValue(value, showTime) {
  if (!value) return null
  return showTime ? new Date(value) : new Date(value + 'T12:00:00')
}

function formatValue(date, showTime) {
  if (!date) return ''
  return showTime ? format(date, "yyyy-MM-dd'T'HH:mm") : format(date, 'yyyy-MM-dd')
}

function AppDatePicker({ value, onChange, showTime = false, placeholder, disabled }) {
  return (
    <div className={styles.wrapper}>
      <ReactDatePicker
        selected={parseValue(value, showTime)}
        onChange={(date) => onChange(formatValue(date, showTime))}
        showTimeSelect={showTime}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="시간"
        dateFormat={showTime ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd'}
        locale={ko}
        placeholderText={placeholder ?? (showTime ? '날짜 및 시간 선택' : '날짜 선택')}
        disabled={disabled}
        isClearable
        popperPlacement="bottom-start"
      />
    </div>
  )
}

export default AppDatePicker

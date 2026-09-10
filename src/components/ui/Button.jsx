import styles from './Button.module.css'

function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const classes = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ')
  return <button className={classes} {...props} />
}

export default Button

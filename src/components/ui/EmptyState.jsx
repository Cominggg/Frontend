import { Link } from 'react-router-dom';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, message, action }) {
  return (
    <div className={styles.empty}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <p className={styles.message}>{message}</p>
      {action && (
        action.href
          ? <a href={action.href} className={styles.action} target="_blank" rel="noopener noreferrer">{action.label}</a>
          : <Link to={action.to} className={styles.action}>{action.label}</Link>
      )}
    </div>
  );
}

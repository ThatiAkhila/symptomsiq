import styles from './EmptyState.module.css'

/**
 * @param {{
 *  icon?: string,
 *  title: string,
 *  message?: string,
 *  action?: import('react').ReactNode
 * }} props
 */
export default function EmptyState({ icon = '🫧', title, message, action }) {
  return (
    <div className={`${styles.wrap} surface glassBorder`}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        {message ? <div className={`${styles.message} muted`}>{message}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}


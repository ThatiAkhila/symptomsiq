import Badge from './Badge'
import styles from './AlertCard.module.css'

/**
 * @param {{
 *  level: 'high'|'medium'|'low',
 *  title: string,
 *  message: string,
 *  actionLabel?: string,
 *  onAction?: () => void
 * }} props
 */
export default function AlertCard({ level, title, message, actionLabel, onAction }) {
  const cls =
    level === 'high'
      ? styles.high
      : level === 'medium'
        ? styles.medium
        : styles.low

  return (
    <article className={`${styles.card} ${cls} surface glassBorder`}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <div className={styles.title}>{title}</div>
          <Badge level={level} />
        </div>
        <div className={styles.message}>{message}</div>
      </div>

      {actionLabel && onAction ? (
        <div className={styles.footer}>
          <button className="btn" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      ) : null}
    </article>
  )
}


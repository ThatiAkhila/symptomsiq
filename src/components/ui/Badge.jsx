import styles from './Badge.module.css'

/**
 * @param {{
 *  level: 'high'|'medium'|'low',
 *  children?: import('react').ReactNode
 * }} props
 */
export default function Badge({ level, children }) {
  const cls =
    level === 'high'
      ? styles.high
      : level === 'medium'
        ? styles.medium
        : styles.low
  return (
    <span className={`${styles.badge} ${cls} mono`}>
      {children || level.toUpperCase()}
    </span>
  )
}


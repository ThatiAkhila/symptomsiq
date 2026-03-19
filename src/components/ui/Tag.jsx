import styles from './Tag.module.css'

/**
 * @param {{
 *  variant?: 'symptom'|'body'|'time'|'neutral',
 *  children: import('react').ReactNode
 * }} props
 */
export default function Tag({ variant = 'neutral', children }) {
  const cls =
    variant === 'symptom'
      ? styles.symptom
      : variant === 'body'
        ? styles.body
        : variant === 'time'
          ? styles.time
          : styles.neutral

  return <span className={`${styles.tag} ${cls} mono`}>{children}</span>
}


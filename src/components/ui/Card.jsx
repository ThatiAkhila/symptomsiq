import styles from './Card.module.css'

/**
 * @param {{
 *  title?: string,
 *  icon?: string,
 *  action?: import('react').ReactNode,
 *  children: import('react').ReactNode
 * }} props
 */
export default function Card({ title, icon, action, children }) {
  return (
    <section className={`${styles.card} surface glassBorder`}>
      {(title || action) && (
        <header className={styles.header}>
          <div className={styles.titleRow}>
            {icon ? (
              <span className={styles.icon} aria-hidden="true">
                {icon}
              </span>
            ) : null}
            {title ? <h3 className={styles.title}>{title}</h3> : null}
          </div>
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  )
}


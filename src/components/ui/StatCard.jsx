import styles from './StatCard.module.css'

const colorVars = {
  green: { lineA: 'rgba(110,231,183,0.85)', lineB: 'rgba(52,211,153,0.55)' },
  red: { lineA: 'rgba(248,113,113,0.9)', lineB: 'rgba(248,113,113,0.55)' },
  orange: { lineA: 'rgba(251,146,60,0.9)', lineB: 'rgba(251,146,60,0.55)' },
  blue: { lineA: 'rgba(96,165,250,0.9)', lineB: 'rgba(96,165,250,0.55)' },
}

/**
 * @param {{
 *  label: string,
 *  value: string|number,
 *  sub?: string,
 *  color?: 'green'|'red'|'orange'|'blue'
 * }} props
 */
export default function StatCard({ label, value, sub, color = 'green' }) {
  const vars = colorVars[color] || colorVars.green
  return (
    <div
      className={`${styles.card} surface glassBorder`}
      style={{
        '--line-a': vars.lineA,
        '--line-b': vars.lineB,
      }}
    >
      <div className={styles.topLine} aria-hidden="true" />
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {sub ? <div className={`${styles.sub} muted`}>{sub}</div> : null}
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import styles from './ProgressBar.module.css'

/**
 * @param {{
 *  label: string,
 *  value: number,
 *  max: number,
 *  color?: 'green'|'red'|'orange'|'blue'|'purple'
 * }} props
 */
export default function ProgressBar({ label, value, max, color = 'green' }) {
  const pct = useMemo(() => {
    const m = Number(max)
    const v = Number(value)
    if (!Number.isFinite(m) || m <= 0) return 0
    if (!Number.isFinite(v) || v <= 0) return 0
    return Math.min(100, Math.round((v / m) * 100))
  }, [value, max])

  const [mountedPct, setMountedPct] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setMountedPct(pct), 40)
    return () => window.clearTimeout(t)
  }, [pct])

  const cls =
    color === 'red'
      ? styles.red
      : color === 'orange'
        ? styles.orange
        : color === 'blue'
          ? styles.blue
          : color === 'purple'
            ? styles.purple
            : styles.green

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <div className={styles.label}>{label}</div>
        <div className={`${styles.value} mono`}>{value}</div>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${cls}`}
          style={{ width: `${mountedPct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}


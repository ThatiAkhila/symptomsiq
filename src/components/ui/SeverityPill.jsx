import styles from './SeverityPill.module.css'

/**
 * @param {{
 *  label: string,
 *  value: 'mild'|'moderate'|'severe',
 *  selected: boolean,
 *  onSelect: (value: 'mild'|'moderate'|'severe') => void
 * }} props
 */
export default function SeverityPill({ label, value, selected, onSelect }) {
  const cls =
    value === 'severe'
      ? styles.severe
      : value === 'moderate'
        ? styles.moderate
        : styles.mild

  return (
    <button
      type="button"
      className={`${styles.pill} ${cls} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(value)}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}


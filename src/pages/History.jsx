import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Tag from '../components/ui/Tag'
import styles from './History.module.css'
import { useSymptoms } from '../hooks/useSymptoms'

function toDayKey(dateLike) {
  const d = new Date(dateLike)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function clampSet(set) {
  return new Set(Array.from(set))
}

function riskForDay(symptomsForDay) {
  if (symptomsForDay.some((s) => s.severity === 'severe')) return 'high'
  if (symptomsForDay.some((s) => s.severity === 'moderate')) return 'medium'
  if (symptomsForDay.length > 0) return 'low'
  return 'none'
}

function dayLabel(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function History() {
  const { symptoms, deleteSymptom } = useSymptoms()

  const [severityFilter, setSeverityFilter] = useState(() => new Set())
  const [typeFilter, setTypeFilter] = useState(() => new Set())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const allTypes = useMemo(() => {
    const set = new Set(symptoms.map((s) => s.symptomType).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [symptoms])

  const filtered = useMemo(() => {
    let list = symptoms
    if (severityFilter.size) {
      list = list.filter((s) => severityFilter.has(s.severity))
    }
    if (typeFilter.size) {
      list = list.filter((s) => typeFilter.has(s.symptomType))
    }
    if (from) {
      const f = new Date(from)
      f.setHours(0, 0, 0, 0)
      list = list.filter((s) => new Date(s.createdAt) >= f)
    }
    if (to) {
      const t = new Date(to)
      t.setHours(23, 59, 59, 999)
      list = list.filter((s) => new Date(s.createdAt) <= t)
    }
    return list
  }, [symptoms, severityFilter, typeFilter, from, to])

  const byDay = useMemo(() => {
    const map = new Map()
    for (const s of symptoms) {
      const key = toDayKey(s.createdAt)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    return map
  }, [symptoms])

  const calendar = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - 27)
    const days = []
    for (let i = 0; i < 28; i += 1) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = toDayKey(d)
      const list = byDay.get(key) || []
      days.push({ key, date: d, risk: riskForDay(list), count: list.length })
    }
    return days
  }, [byDay])

  function toggleSeverity(value) {
    setSeverityFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return clampSet(next)
    })
  }

  function toggleType(value) {
    setTypeFilter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return clampSet(next)
    })
  }

  function clearFilters() {
    setSeverityFilter(new Set())
    setTypeFilter(new Set())
    setFrom('')
    setTo('')
  }

  return (
    <div className={`${styles.page} stagger`}>
      <Card
        title="Filters"
        icon="🧪"
        action={
          <button className="btn" type="button" onClick={clearFilters}>
            Clear
          </button>
        }
      >
        <div className={styles.filters}>
          <div className={styles.group}>
            <div className={`${styles.groupLabel} mono`}>Severity</div>
            <div className={styles.chips}>
              {['mild', 'moderate', 'severe'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.chip} ${severityFilter.has(s) ? styles.chipOn : ''}`}
                  onClick={() => toggleSeverity(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={`${styles.groupLabel} mono`}>Symptom type</div>
            <div className={styles.chips}>
              {allTypes.length ? (
                allTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.chip} ${typeFilter.has(t) ? styles.chipOn : ''}`}
                    onClick={() => toggleType(t)}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <span className="muted">No types yet</span>
              )}
            </div>
          </div>

          <div className={styles.group}>
            <div className={`${styles.groupLabel} mono`}>Date range</div>
            <div className={styles.range}>
              <label className={styles.rangeLabel}>
                From
                <input className={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className={styles.rangeLabel}>
                To
                <input className={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <div className={`${styles.grid} stagger`}>
        <Card title="Calendar" icon="🗓️">
          <div className={styles.calendar}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className={`${styles.dow} mono`}>
                {d}
              </div>
            ))}
            {calendar.map((d) => (
              <div
                key={d.key}
                className={`${styles.day} ${d.risk === 'high' ? styles.high : d.risk === 'medium' ? styles.medium : d.risk === 'low' ? styles.low : ''}`}
                title={`${dayLabel(d.date)} • ${d.count} logs`}
              >
                <div className={styles.dayNum}>{d.date.getDate()}</div>
              </div>
            ))}
          </div>
          <div className={styles.legend}>
            <span className={`${styles.leg} ${styles.low}`} /> Low
            <span className={`${styles.leg} ${styles.medium}`} /> Medium
            <span className={`${styles.leg} ${styles.high}`} /> High
          </div>
        </Card>

        <Card
          title="Log history"
          icon="🧾"
          action={<span className="mono muted">{filtered.length} shown</span>}
        >
          {filtered.length === 0 ? (
            <EmptyState icon="🔎" title="No results" message="Try adjusting filters." />
          ) : (
            <div className={styles.list}>
              {filtered.map((s) => (
                <div key={s.id} className={styles.item}>
                  <div className={styles.itemTop}>
                    <div className={styles.itemText}>{s.text}</div>
                    <button className={styles.delete} type="button" onClick={() => deleteSymptom(s.id)}>
                      Delete
                    </button>
                  </div>
                  <div className={styles.meta}>
                    <Tag variant="symptom">{s.symptomType}</Tag>
                    <Tag variant="body">{s.bodyPart}</Tag>
                    <Tag variant="time">{s.timeOfDay}</Tag>
                    <Tag variant="neutral">{s.severity}</Tag>
                    <span className={`${styles.when} mono`}>{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}


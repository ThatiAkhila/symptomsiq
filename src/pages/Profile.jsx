import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import Tag from '../components/ui/Tag'
import { useSymptoms } from '../hooks/useSymptoms'
import { clearAllSymptoms, exportSymptomsJson } from '../services/symptomService'
import styles from './Profile.module.css'

const PROFILE_STORAGE = 'symptomiq:profile:v1'

function safeParse(raw, fallback) {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <button
        type="button"
        className={`${styles.switch} ${checked ? styles.on : ''}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </label>
  )
}

export default function Profile() {
  const { apiKey, setApiKey, symptoms } = useSymptoms()
  const envKeyPresent = Boolean((import.meta?.env?.VITE_OPENAI_API_KEY || '').trim())

  const [name, setName] = useState('Akhila')
  const [email, setEmail] = useState('akhila@example.com')
  const [age, setAge] = useState('22')

  const [conditions, setConditions] = useState('None')
  const [medications, setMedications] = useState('None')
  const [allergies, setAllergies] = useState('None')

  const [notifDaily, setNotifDaily] = useState(true)
  const [notifAlerts, setNotifAlerts] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_STORAGE)
    if (!raw) return
    const p = safeParse(raw, null)
    if (!p) return
    setName(p.name ?? 'Akhila')
    setEmail(p.email ?? 'akhila@example.com')
    setAge(p.age ?? '22')
    setConditions(p.conditions ?? 'None')
    setMedications(p.medications ?? 'None')
    setAllergies(p.allergies ?? 'None')
    setNotifDaily(Boolean(p.notifDaily ?? true))
    setNotifAlerts(Boolean(p.notifAlerts ?? true))
  }, [])

  useEffect(() => {
    const payload = {
      name,
      email,
      age,
      conditions,
      medications,
      allergies,
      notifDaily,
      notifAlerts,
    }
    localStorage.setItem(PROFILE_STORAGE, JSON.stringify(payload))
  }, [name, email, age, conditions, medications, allergies, notifDaily, notifAlerts])

  const maskedKey = useMemo(() => {
    const k = (apiKey || '').trim()
    if (!k) return ''
    if (k.length <= 10) return '•'.repeat(k.length)
    return `${k.slice(0, 3)}••••••••••${k.slice(-4)}`
  }, [apiKey])

  function downloadJson() {
    const blob = new Blob([exportSymptomsJson()], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `symptomiq-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function onClear() {
    if (!confirm('Clear all symptom logs? This cannot be undone.')) return
    clearAllSymptoms()
    window.location.reload()
  }

  return (
    <div className={`${styles.page} stagger`}>
      <section className={`${styles.header} surface glassBorder`}>
        <div className={styles.avatar} aria-hidden="true">
          A
        </div>
        <div className={styles.headMain}>
          <div className={styles.nameRow}>
            <div className={styles.name}>{name || 'Your profile'}</div>
            <Tag variant="neutral">Premium</Tag>
          </div>
          <div className={`${styles.sub} mono muted`}>
            {symptoms.length} logs • Clinical Dark Luxury mode
          </div>
        </div>
      </section>

      <div className={`${styles.grid} stagger`}>
        <Card title="Personal info" icon="🪪">
          <div className={styles.form}>
            <label className={styles.label}>
              Name
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className={styles.label}>
              Email
              <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className={styles.label}>
              Age
              <input className={styles.input} value={age} onChange={(e) => setAge(e.target.value)} />
            </label>
          </div>
        </Card>

        <Card title="Health baseline" icon="🧾">
          <div className={styles.form}>
            <label className={styles.label}>
              Conditions
              <input
                className={styles.input}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Medications
              <input
                className={styles.input}
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Allergies
              <input className={styles.input} value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </label>
          </div>
        </Card>

        <Card title="Notification settings" icon="🔔">
          <div className={styles.toggles}>
            <Toggle label="Daily reminder" checked={notifDaily} onChange={setNotifDaily} />
            <Toggle label="High risk alerts" checked={notifAlerts} onChange={setNotifAlerts} />
            <div className={`${styles.note} mono muted`}>
              Notifications are saved locally (frontend-only). We’ll wire real notifications later if needed.
            </div>
          </div>
        </Card>

        <Card title="API settings" icon="🔑" action={<span className="mono muted">{maskedKey || 'not set'}</span>}>
          <div className={styles.form}>
            <label className={styles.label}>
              Gemini API key
              <input
                className={styles.input}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza…"
              />
            </label>
            {envKeyPresent ? (
              <div className={`${styles.note} mono muted`}>
                Env detected: <code>VITE_OPENAI_API_KEY</code> (stored key overrides env).
              </div>
            ) : null}
            <div className={`${styles.note} mono muted`}>
              Stored in localStorage. For a production app, use a secure backend proxy.
            </div>
          </div>
        </Card>

        <Card title="Data management" icon="🗄️">
          <div className={styles.dataActions}>
            <button className="btn btnPrimary" type="button" onClick={downloadJson}>
              Export JSON
            </button>
            <button className="btn" type="button" onClick={onClear}>
              Clear data
            </button>
          </div>
          <div className={`${styles.note} mono muted`}>Exports include all logs (including AI extracted fields).</div>
        </Card>
      </div>
    </div>
  )
}


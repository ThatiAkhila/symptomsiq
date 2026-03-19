import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import AlertCard from '../components/ui/AlertCard'
import ProgressBar from '../components/ui/ProgressBar'
import Tag from '../components/ui/Tag'
import EmptyState from '../components/ui/EmptyState'
import TrendChart from '../components/charts/TrendChart'
import WeeklyBarChart from '../components/charts/WeeklyBarChart'
import { useSymptoms } from '../hooks/useSymptoms'
import { generateSummary } from '../services/aiService'
import styles from './Dashboard.module.css'

function severityDot(severity) {
  if (severity === 'severe') return styles.dotSevere
  if (severity === 'moderate') return styles.dotModerate
  return styles.dotMild
}

export default function Dashboard() {
  const { symptoms, alerts, logsThisWeek, streakDays, freq, trend30, weekly, apiKey } =
    useSymptoms()

  const highCount = alerts.filter((a) => a.level === 'high').length
  const patternsFound = alerts.length

  const recent = symptoms.slice(0, 5)
  const top = freq.slice(0, 5)
  const maxTop = Math.max(1, ...top.map((t) => t.count))

  async function onDownloadSummary() {
    try {
      const text = apiKey
        ? await generateSummary(symptoms, apiKey)
        : [
            'Set your OpenAI key in Profile → API Settings to generate a clinician-ready summary.',
            '',
            'Tip: Once the key is set, this button downloads a text summary you can print/save as PDF.',
          ].join('\n')

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `symptomiq-doctor-summary-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      const msg = e?.message || 'Failed to generate summary.'
      alert(msg)
    }
  }

  return (
    <div className={`${styles.page} stagger`}>
      <section className={`${styles.stats} stagger`}>
        <StatCard
          label="Logs This Week"
          value={logsThisWeek}
          sub="Across the last 7 days"
          color="green"
        />
        <StatCard
          label="High Risk Alerts"
          value={highCount}
          sub="Flagged patterns"
          color="red"
        />
        <StatCard
          label="Patterns Found"
          value={patternsFound}
          sub="Rule-based detection"
          color="orange"
        />
        <StatCard label="Streak Days" value={streakDays} sub="Consecutive logging" color="blue" />
      </section>

      <section className={`${styles.twoCol} stagger`}>
        <Card
          title="Recent logs"
          icon="📝"
          action={<span className="mono muted">{symptoms.length} total</span>}
        >
          {recent.length === 0 ? (
            <EmptyState
              icon="🫧"
              title="No logs yet"
              message="Log your first symptom to unlock trends and insights."
            />
          ) : (
            <div className={styles.logList}>
              {recent.map((s) => (
                <div key={s.id} className={styles.logRow}>
                  <span className={`${styles.dot} ${severityDot(s.severity)}`} aria-hidden="true" />
                  <div className={styles.logMain}>
                    <div className={styles.logText}>{s.text}</div>
                    <div className={styles.logMeta}>
                      <Tag variant="symptom">{s.symptomType}</Tag>
                      <Tag variant="body">{s.bodyPart}</Tag>
                      <Tag variant="time">{s.timeOfDay}</Tag>
                      <span className={`${styles.when} mono`}>
                        {new Date(s.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Active alerts" icon="🚨">
          {alerts.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No active alerts"
              message="As you log more, SymptomIQ will detect patterns that may need attention."
            />
          ) : (
            <div className={styles.alertList}>
              {alerts.slice(0, 3).map((a) => (
                <AlertCard key={a.id} level={a.level} title={a.title} message={a.message} />
              ))}
            </div>
          )}
        </Card>
      </section>

      <TrendChart data={trend30} title="30-day symptom trend" />

      <section className={`${styles.threeCol} stagger`}>
        <Card title="Top symptoms" icon="🏷️">
          {top.length === 0 ? (
            <EmptyState icon="📈" title="No symptom frequency yet" message="Start logging to see." />
          ) : (
            <div className={styles.pbList}>
              {top.map((t, i) => (
                <ProgressBar
                  key={t.symptomType}
                  label={t.symptomType}
                  value={t.count}
                  max={maxTop}
                  color={i === 0 ? 'green' : i === 1 ? 'blue' : i === 2 ? 'orange' : 'purple'}
                />
              ))}
            </div>
          )}
        </Card>

        <WeeklyBarChart data={weekly} title="Weekly pattern" />

        <Card
          title="Doctor summary"
          icon="🩺"
          action={
            <button className="btn btnPrimary" onClick={onDownloadSummary}>
              Download PDF
            </button>
          }
        >
          <div className={styles.summaryText}>
            A clinician-ready summary of your recent logs, formatted for quick review. If you
            haven’t set an OpenAI key yet, this will download setup instructions instead.
          </div>
          <div className={`${styles.summaryHint} mono muted`}>
            Tip: you can print the downloaded summary and “Save as PDF”.
          </div>
        </Card>
      </section>
    </div>
  )
}


import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import AlertCard from '../components/ui/AlertCard'
import EmptyState from '../components/ui/EmptyState'
import Tag from '../components/ui/Tag'
import TrendChart from '../components/charts/TrendChart'
import { useSymptoms } from '../hooks/useSymptoms'
import { usePatternDetector } from '../hooks/usePatternDetector'
import { answerQuestion } from '../services/aiService'
import styles from './Insights.module.css'

function Spinner() {
  return <span className={styles.spinner} aria-label="Loading" />
}

export default function Insights() {
  const { symptoms, alerts, apiKey, trend30 } = useSymptoms()
  const patterns = usePatternDetector(symptoms)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const recentContext = useMemo(() => symptoms.slice(0, 20), [symptoms])

  async function onAsk(e) {
    e.preventDefault()
    setErr('')
    setAnswer('')
    const q = question.trim()
    if (!q) return
    if (!apiKey) {
      setErr('Set your OpenAI key in Profile → API Settings to ask AI.')
      return
    }
    try {
      setLoading(true)
      const res = await answerQuestion(q, recentContext, apiKey)
      setAnswer(res)
    } catch (e2) {
      setErr(e2?.message || 'Failed to get AI answer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.page} stagger`}>
      <div className={`${styles.grid} stagger`}>
        <div className={`${styles.left} stagger`}>
          <Card title="AI Pattern Alerts" icon="🚨">
            {alerts.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No alerts right now"
                message="As you log more entries, SymptomIQ will detect patterns that may need attention."
              />
            ) : (
              <div className={styles.alertList}>
                {alerts.map((a) => (
                  <AlertCard key={a.id} level={a.level} title={a.title} message={a.message} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Ask AI" icon="🧠">
            <form className={styles.ask} onSubmit={onAsk}>
              <input
                className={styles.input}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about patterns, triggers, or trends…"
              />
              <button className="btn btnPrimary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner /> Asking…
                  </>
                ) : (
                  'Ask'
                )}
              </button>
            </form>
            {!apiKey ? (
              <div className={`${styles.note} mono muted`}>Set OpenAI key in Profile to enable Q&A</div>
            ) : null}
            {err ? <div className={styles.error}>{err}</div> : null}
            {answer ? (
              <div className={styles.answer}>
                <div className={`${styles.answerLabel} mono`}>Answer</div>
                <div className={styles.answerText}>{answer}</div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className={`${styles.right} stagger`}>
          <Card title="Detected patterns" icon="🧩">
            {patterns.length === 0 ? (
              <EmptyState
                icon="📈"
                title="No patterns yet"
                message="Keep logging daily—patterns typically emerge within 1–2 weeks."
              />
            ) : (
              <div className={styles.patternList}>
                {patterns.map((p) => (
                  <div key={p.id} className={styles.patternRow}>
                    <div className={styles.patternIcon} aria-hidden="true">
                      {p.icon}
                    </div>
                    <div className={styles.patternMain}>
                      <div className={styles.patternTitle}>
                        {p.title}{' '}
                        <span className={styles.freq}>
                          <Tag variant="neutral">{p.frequency}</Tag>
                        </span>
                      </div>
                      <div className={styles.patternDesc}>{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <TrendChart data={trend30} title="30-day symptom trend" />
        </div>
      </div>
    </div>
  )
}


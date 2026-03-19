import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import SeverityPill from '../components/ui/SeverityPill'
import Tag from '../components/ui/Tag'
import EmptyState from '../components/ui/EmptyState'
import { useSymptoms } from '../hooks/useSymptoms'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { extractSymptom } from '../services/aiService'
import styles from './LogSymptom.module.css'

const symptomTypes = [
  'Headache',
  'Fatigue',
  'Nausea',
  'Cough',
  'Sore Throat',
  'Fever',
  'Dizziness',
  'Shortness of Breath',
  'Stomach Pain',
  'Other',
]

const bodyParts = [
  'Head',
  'Chest',
  'Throat',
  'Stomach',
  'Back',
  'Muscles',
  'Skin',
  'General',
]

const times = ['Morning', 'Afternoon', 'Evening', 'Night']

function Spinner() {
  return <span className={styles.spinner} aria-label="Loading" />
}

export default function LogSymptom() {
  const { addSymptom, apiKey, setAnalyzing, isAnalyzing } = useSymptoms()
  const voice = useVoiceInput()

  const [text, setText] = useState('')
  const [symptomType, setSymptomType] = useState('Headache')
  const [severity, setSeverity] = useState('mild')
  const [bodyPart, setBodyPart] = useState('Head')
  const [timeOfDay, setTimeOfDay] = useState('Morning')
  const [trigger, setTrigger] = useState('')

  const [aiExtracted, setAiExtracted] = useState(null)
  const [aiError, setAiError] = useState('')

  const mergedText = useMemo(() => {
    return voice.transcript ? `${text}\n${voice.transcript}`.trim() : text
  }, [text, voice.transcript])

  async function onSubmit(e) {
    e.preventDefault()
    setAiError('')
    setAiExtracted(null)

    const raw = mergedText.trim()
    if (!raw) {
      setAiError('Please describe your symptom first.')
      return
    }

    let extracted = null
    if (apiKey) {
      try {
        setAnalyzing(true)
        extracted = await extractSymptom(raw, apiKey)
        setAiExtracted(extracted)
      } catch (err) {
        setAiError(err?.message || 'AI extraction failed.')
      } finally {
        setAnalyzing(false)
      }
    }

    const symptom = {
      id: crypto.randomUUID(),
      text: raw,
      symptomType,
      severity,
      bodyPart,
      timeOfDay,
      trigger: trigger.trim() ? trigger.trim() : undefined,
      createdAt: new Date().toISOString(),
      aiExtracted: extracted,
    }

    addSymptom(symptom)

    // Reset input but keep dropdowns (faster for daily use)
    setText('')
    voice.reset()
    setTrigger('')
  }

  function applyVoice() {
    if (!voice.transcript) return
    setText((t) => `${t}\n${voice.transcript}`.trim())
    voice.reset()
  }

  return (
    <div className={`${styles.page} stagger`}>
      <div className={`${styles.grid} stagger`}>
        <form className={`${styles.form} surface glassBorder`} onSubmit={onSubmit}>
          <div className={styles.formHeader}>
            <div>
              <div className={styles.kicker}>✍️ New log</div>
              <h2 className={styles.h2}>Capture today’s symptoms</h2>
              <p className={styles.p}>
                Write naturally. If you’ve set an OpenAI key, SymptomIQ will extract structured
                fields automatically.
              </p>
            </div>
          </div>

          <div className={styles.voiceRow}>
            <button
              type="button"
              className={`btn ${voice.isListening ? styles.micOn : ''}`}
              onClick={voice.isListening ? voice.stop : voice.start}
            >
              {voice.isListening ? '■ Stop' : '🎙️ Start'} voice
            </button>
            <div className={`${styles.voiceMeta} mono`}>
              {voice.supported ? (
                voice.error ? (
                  <span className={styles.voiceError}>{voice.error}</span>
                ) : voice.isListening ? (
                  'Listening…'
                ) : (
                  'Web Speech API'
                )
              ) : (
                <span className={styles.voiceError}>Voice not supported in this browser</span>
              )}
            </div>
            <button type="button" className="btn" onClick={applyVoice} disabled={!voice.transcript}>
              Apply
            </button>
          </div>

          <label className={styles.label}>
            Describe symptom
            <textarea
              className={styles.textarea}
              value={mergedText}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Example: Dull headache behind eyes this morning; worse with screen time. Slept ~5h."
            />
          </label>

          <div className={styles.row2}>
            <label className={styles.label}>
              Symptom type
              <select className={styles.select} value={symptomType} onChange={(e) => setSymptomType(e.target.value)}>
                {symptomTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Body area
              <select className={styles.select} value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}>
                {bodyParts.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.row2}>
            <div className={styles.label}>
              Severity
              <div className={styles.pills}>
                <SeverityPill label="Mild" value="mild" selected={severity === 'mild'} onSelect={setSeverity} />
                <SeverityPill
                  label="Moderate"
                  value="moderate"
                  selected={severity === 'moderate'}
                  onSelect={setSeverity}
                />
                <SeverityPill label="Severe" value="severe" selected={severity === 'severe'} onSelect={setSeverity} />
              </div>
            </div>

            <label className={styles.label}>
              Time of day
              <select className={styles.select} value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.label}>
            Possible trigger (optional)
            <input
              className={styles.input}
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="e.g. poor sleep, caffeine, skipped meal, stress"
            />
          </label>

          <div className={styles.actions}>
            <button className="btn btnPrimary" type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Spinner /> Analyzing…
                </>
              ) : (
                'Save Symptom Log'
              )}
            </button>
            {!apiKey ? (
              <span className={`${styles.noKey} mono`}>Set OpenAI key in Profile to enable AI extraction</span>
            ) : null}
          </div>
        </form>

        <div className={styles.side}>
          <Card title="AI Extraction Preview" icon="🧠">
            {!apiKey ? (
              <EmptyState
                icon="🔑"
                title="OpenAI key not set"
                message="Go to Profile → API Settings to enable structured extraction."
              />
            ) : aiError ? (
              <div className={styles.aiError}>{aiError}</div>
            ) : aiExtracted ? (
              <div className={styles.preview}>
                <div className={styles.previewRow}>
                  <Tag variant="symptom">{aiExtracted.symptomName}</Tag>
                  <Tag variant="body">{aiExtracted.bodyPart}</Tag>
                  <Tag variant="time">{aiExtracted.timeOfDay}</Tag>
                  <Tag variant="neutral">{aiExtracted.severity}</Tag>
                </div>
                <div className={styles.previewSummary}>{aiExtracted.summary}</div>
              </div>
            ) : (
              <EmptyState
                icon="✨"
                title="No preview yet"
                message="Submit a log to see what the AI extracts."
              />
            )}
          </Card>

          <Card title="Tips for better logging" icon="🧾">
            <ul className={styles.tips}>
              <li>
                Include <strong>timing</strong>, <strong>severity</strong>, and any <strong>trigger</strong>.
              </li>
              <li>Note what helped (rest, hydration, medication).</li>
              <li>Log briefly but consistently—patterns emerge fast.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}


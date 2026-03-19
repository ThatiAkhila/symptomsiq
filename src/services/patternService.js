/**
 * @typedef {import('../models/symptom.model.js').Symptom} Symptom
 * @typedef {import('../models/symptom.model.js').Alert} Alert
 */

function startOfDay(dateLike) {
  const d = new Date(dateLike)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(dateLike, days) {
  const d = new Date(dateLike)
  d.setDate(d.getDate() + days)
  return d
}

function toDayKey(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function makeAlert(level, title, message) {
  /** @type {Alert} */
  return {
    id: crypto.randomUUID(),
    level,
    title,
    message,
    createdAt: new Date().toISOString(),
  }
}

function withinDays(symptoms, days) {
  const today = startOfDay(new Date())
  const start = addDays(today, -(days - 1))
  return symptoms.filter((s) => {
    const d = startOfDay(s.createdAt)
    return d >= start && d <= today
  })
}

function countByType(symptoms, type) {
  const t = type.toLowerCase()
  return symptoms.filter((s) => (s.symptomType || '').toLowerCase() === t).length
}

function countSevere(symptoms) {
  return symptoms.filter((s) => s.severity === 'severe').length
}

function hasThreeDayRun(symptoms, symptomType) {
  const t = symptomType.toLowerCase()
  const daySet = new Set(
    symptoms
      .filter((s) => (s.symptomType || '').toLowerCase() === t)
      .map((s) => toDayKey(s.createdAt))
      .filter(Boolean),
  )
  if (daySet.size < 3) return false

  const today = startOfDay(new Date())
  for (let offset = 0; offset <= 12; offset += 1) {
    const a = toDayKey(addDays(today, -offset))
    const b = toDayKey(addDays(today, -(offset + 1)))
    const c = toDayKey(addDays(today, -(offset + 2)))
    if (daySet.has(a) && daySet.has(b) && daySet.has(c)) return true
  }
  return false
}

/**
 * Rule-based pattern detection algorithm.
 * @param {Symptom[]} symptoms
 * @returns {Alert[]}
 */
export function detectPatterns(symptoms) {
  const list = Array.isArray(symptoms) ? symptoms : []
  const last30 = withinDays(list, 30)
  const last14 = withinDays(list, 14)

  /** @type {Alert[]} */
  const alerts = []

  // 5+ headaches in 30 days → high
  const headaches30 = countByType(last30, 'Headache')
  if (headaches30 >= 5) {
    alerts.push(
      makeAlert(
        'high',
        'Frequent headaches detected',
        `You’ve logged ${headaches30} headaches in the last 30 days. Consider reviewing triggers (sleep, hydration, stress) and consult a clinician if worsening.`,
      ),
    )
  }

  // 4+ fatigue logs in 14 days → medium
  const fatigue14 = countByType(last14, 'Fatigue')
  if (fatigue14 >= 4) {
    alerts.push(
      makeAlert(
        'medium',
        'Sustained fatigue pattern',
        `You’ve logged fatigue ${fatigue14} times in the last 14 days. Track sleep quality, workload, hydration, and consider labs if persistent.`,
      ),
    )
  }

  // 3+ severe symptoms (last 30 days) → high
  const severe30 = countSevere(last30)
  if (severe30 >= 3) {
    alerts.push(
      makeAlert(
        'high',
        'Multiple severe symptom logs',
        `There are ${severe30} severe entries in the last 30 days. If symptoms are escalating or include red flags (chest pain, fainting, severe shortness of breath), seek medical care.`,
      ),
    )
  }

  // Same symptom 3 days in a row → medium (check common types)
  const candidates = ['Headache', 'Fatigue', 'Nausea', 'Sore Throat', 'Cough']
  for (const type of candidates) {
    if (hasThreeDayRun(last14, type)) {
      alerts.push(
        makeAlert(
          'medium',
          'Recurring symptom streak',
          `${type} has been logged for 3 days in a row. Consider noting exposures, sleep changes, diet shifts, or medication timing.`,
        ),
      )
      break
    }
  }

  return alerts.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 }
    return rank[a.level] - rank[b.level]
  })
}


import { useMemo } from 'react'

/**
 * @typedef {import('../models/symptom.model.js').Symptom} Symptom
 * @typedef {import('../models/symptom.model.js').Pattern} Pattern
 */

function withinDays(symptoms, days) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (days - 1))

  return symptoms.filter((s) => {
    const d = new Date(s.createdAt)
    d.setHours(0, 0, 0, 0)
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

function toDayKey(dateLike) {
  const d = new Date(dateLike)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function hasThreeDayRun(symptoms, symptomType) {
  const t = symptomType.toLowerCase()
  const daySet = new Set(
    symptoms
      .filter((s) => (s.symptomType || '').toLowerCase() === t)
      .map((s) => toDayKey(s.createdAt)),
  )
  if (daySet.size < 3) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let offset = 0; offset <= 12; offset += 1) {
    const a = toDayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset))
    const b = toDayKey(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - (offset + 1)),
    )
    const c = toDayKey(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - (offset + 2)),
    )
    if (daySet.has(a) && daySet.has(b) && daySet.has(c)) return true
  }
  return false
}

function makePattern(level, icon, title, description, frequency) {
  /** @type {Pattern} */
  return {
    id: crypto.randomUUID(),
    level,
    icon,
    title,
    description,
    frequency,
  }
}

/**
 * Builds human-friendly Patterns for the Insights screen.
 * @param {Symptom[]} symptoms
 */
export function usePatternDetector(symptoms) {
  return useMemo(() => {
    const list = Array.isArray(symptoms) ? symptoms : []
    const last30 = withinDays(list, 30)
    const last14 = withinDays(list, 14)

    /** @type {Pattern[]} */
    const patterns = []

    const headaches30 = countByType(last30, 'Headache')
    if (headaches30 >= 5) {
      patterns.push(
        makePattern(
          'high',
          '🧠',
          'Frequent headaches',
          'Headaches are appearing frequently over the last month. Review sleep, hydration, stress, and screen time.',
          `${headaches30}× / 30 days`,
        ),
      )
    }

    const fatigue14 = countByType(last14, 'Fatigue')
    if (fatigue14 >= 4) {
      patterns.push(
        makePattern(
          'medium',
          '🪫',
          'Sustained fatigue',
          'Fatigue recurs often in the last two weeks. Track sleep quality and daily workload and consider baseline labs if persistent.',
          `${fatigue14}× / 14 days`,
        ),
      )
    }

    const severe30 = countSevere(last30)
    if (severe30 >= 3) {
      patterns.push(
        makePattern(
          'high',
          '🚨',
          'Severe entries cluster',
          'Multiple severe logs were recorded recently. If you notice red flags, seek medical care.',
          `${severe30}× / 30 days`,
        ),
      )
    }

    const candidates = ['Headache', 'Fatigue', 'Nausea', 'Sore Throat', 'Cough']
    for (const type of candidates) {
      if (hasThreeDayRun(last14, type)) {
        patterns.push(
          makePattern(
            'medium',
            '🧩',
            `${type} streak`,
            'This symptom is repeating on consecutive days. Capture exposures, diet changes, sleep shifts, and medication timing.',
            '3 days in a row',
          ),
        )
        break
      }
    }

    patterns.sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.level] - rank[b.level]
    })

    return patterns
  }, [symptoms])
}


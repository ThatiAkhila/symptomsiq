/**
 * @typedef {import('../models/symptom.model.js').Symptom} Symptom
 */

const STORAGE_KEY = 'symptomiq:symptoms:v1'

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function toDayKey(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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

function isBetweenInclusive(dateLike, from, to) {
  const t = new Date(dateLike).getTime()
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  if ([t, a, b].some((x) => Number.isNaN(x))) return false
  return t >= Math.min(a, b) && t <= Math.max(a, b)
}

/** @returns {Symptom[]} */
function getStoredSymptoms() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const list = raw ? safeJsonParse(raw, []) : []
  return Array.isArray(list) ? list : []
}

/** @param {Symptom[]} symptoms */
function setStoredSymptoms(symptoms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symptoms))
}

/** @returns {Symptom[]} */
function seedSymptoms() {
  const now = new Date()
  const make = (overrides) => ({
    id: crypto.randomUUID(),
    text: overrides.text ?? '',
    symptomType: overrides.symptomType ?? 'Other',
    severity: overrides.severity ?? 'mild',
    bodyPart: overrides.bodyPart ?? 'General',
    timeOfDay: overrides.timeOfDay ?? 'Morning',
    trigger: overrides.trigger,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    aiExtracted: overrides.aiExtracted ?? null,
  })

  /** @type {Symptom[]} */
  const seeded = [
    make({
      text: 'Woke up with a dull headache behind my eyes. Felt a bit dehydrated.',
      symptomType: 'Headache',
      severity: 'moderate',
      bodyPart: 'Head',
      timeOfDay: 'Morning',
      trigger: 'Late night screen time',
      createdAt: addDays(now, -1).toISOString(),
      aiExtracted: {
        symptomName: 'Headache',
        severity: 'moderate',
        bodyPart: 'Head',
        timeOfDay: 'Morning',
        summary: 'Moderate headache on waking; possible dehydration/screen fatigue.',
      },
    }),
    make({
      text: 'Low energy all day and struggled to focus in meetings.',
      symptomType: 'Fatigue',
      severity: 'moderate',
      bodyPart: 'General',
      timeOfDay: 'Afternoon',
      trigger: 'Poor sleep',
      createdAt: addDays(now, -2).toISOString(),
      aiExtracted: {
        symptomName: 'Fatigue',
        severity: 'moderate',
        bodyPart: 'General',
        timeOfDay: 'Afternoon',
        summary: 'Moderate fatigue with concentration issues; likely related to sleep.',
      },
    }),
    make({
      text: 'Mild nausea after lunch; settled after some water.',
      symptomType: 'Nausea',
      severity: 'mild',
      bodyPart: 'Stomach',
      timeOfDay: 'Afternoon',
      trigger: 'Heavy meal',
      createdAt: addDays(now, -3).toISOString(),
    }),
    make({
      text: 'Sharp headache in the evening with light sensitivity.',
      symptomType: 'Headache',
      severity: 'severe',
      bodyPart: 'Head',
      timeOfDay: 'Evening',
      createdAt: addDays(now, -5).toISOString(),
    }),
    make({
      text: 'Sore throat and mild cough.',
      symptomType: 'Sore Throat',
      severity: 'mild',
      bodyPart: 'Throat',
      timeOfDay: 'Night',
      createdAt: addDays(now, -7).toISOString(),
    }),
    make({
      text: 'Fatigue and muscle aches after a long day.',
      symptomType: 'Fatigue',
      severity: 'mild',
      bodyPart: 'General',
      timeOfDay: 'Evening',
      createdAt: addDays(now, -9).toISOString(),
    }),
    make({
      text: 'Headache returned, mostly tension around temples.',
      symptomType: 'Headache',
      severity: 'moderate',
      bodyPart: 'Head',
      timeOfDay: 'Night',
      createdAt: addDays(now, -10).toISOString(),
    }),
    make({
      text: 'Felt short of breath during stairs; resolved with rest.',
      symptomType: 'Shortness of Breath',
      severity: 'moderate',
      bodyPart: 'Chest',
      timeOfDay: 'Morning',
      createdAt: addDays(now, -13).toISOString(),
    }),
    make({
      text: 'Severe fatigue and headache after skipping lunch.',
      symptomType: 'Fatigue',
      severity: 'severe',
      bodyPart: 'General',
      timeOfDay: 'Afternoon',
      trigger: 'Skipped meal',
      createdAt: addDays(now, -14).toISOString(),
    }),
    make({
      text: 'Headache again; stress day.',
      symptomType: 'Headache',
      severity: 'mild',
      bodyPart: 'Head',
      timeOfDay: 'Evening',
      createdAt: addDays(now, -15).toISOString(),
    }),
    make({
      text: 'Moderate fatigue with headache; slept late.',
      symptomType: 'Fatigue',
      severity: 'moderate',
      bodyPart: 'General',
      timeOfDay: 'Morning',
      createdAt: addDays(now, -16).toISOString(),
    }),
    make({
      text: 'Mild headache after long drive.',
      symptomType: 'Headache',
      severity: 'mild',
      bodyPart: 'Head',
      timeOfDay: 'Night',
      createdAt: addDays(now, -18).toISOString(),
    }),
  ]

  setStoredSymptoms(seeded)
  return seeded
}

function ensureSeeded() {
  const existing = getStoredSymptoms()
  if (existing.length > 0) return existing
  return seedSymptoms()
}

/** @returns {Symptom[]} sorted by createdAt desc */
export function getAllSymptoms() {
  const list = ensureSeeded()
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/** @param {Symptom} symptom */
export function saveSymptom(symptom) {
  const list = getAllSymptoms()
  const next = [symptom, ...list]
  setStoredSymptoms(next)
  return next
}

/** @param {string} id */
export function deleteSymptom(id) {
  const list = getAllSymptoms()
  const next = list.filter((s) => s.id !== id)
  setStoredSymptoms(next)
  return next
}

/**
 * @param {string|Date} from
 * @param {string|Date} to
 * @returns {Symptom[]}
 */
export function getByDateRange(from, to) {
  return getAllSymptoms().filter((s) => isBetweenInclusive(s.createdAt, from, to))
}

/**
 * Counts consecutive days (including today if logged) with at least one symptom.
 * @returns {number}
 */
export function getStreak() {
  const symptoms = getAllSymptoms()
  const daySet = new Set(symptoms.map((s) => toDayKey(s.createdAt)).filter(Boolean))
  if (daySet.size === 0) return 0

  let streak = 0
  let cursor = startOfDay(new Date())
  while (true) {
    const key = toDayKey(cursor)
    if (!daySet.has(key)) break
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/**
 * Returns a sorted frequency list for symptomType.
 * @returns {{ symptomType: string, count: number }[]}
 */
export function getFrequencyMap() {
  const map = new Map()
  for (const s of getAllSymptoms()) {
    const key = (s.symptomType || 'Other').trim() || 'Other'
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()]
    .map(([symptomType, count]) => ({ symptomType, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * 30-day trend for charting.
 * @returns {{ labels: string[], mild: number[], moderate: number[], severe: number[] }}
 */
export function get30DayTrend() {
  const today = startOfDay(new Date())
  const start = addDays(today, -29)
  const labels = []
  const mild = []
  const moderate = []
  const severe = []

  const buckets = new Map()
  for (const s of getAllSymptoms()) {
    const d = startOfDay(s.createdAt)
    if (d < start || d > today) continue
    const key = toDayKey(d)
    if (!buckets.has(key)) buckets.set(key, { mild: 0, moderate: 0, severe: 0 })
    const b = buckets.get(key)
    if (s.severity === 'mild') b.mild += 1
    if (s.severity === 'moderate') b.moderate += 1
    if (s.severity === 'severe') b.severe += 1
  }

  for (let i = 0; i < 30; i += 1) {
    const d = addDays(start, i)
    const key = toDayKey(d)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    labels.push(`${mm}/${dd}`)
    const b = buckets.get(key) || { mild: 0, moderate: 0, severe: 0 }
    mild.push(b.mild)
    moderate.push(b.moderate)
    severe.push(b.severe)
  }

  return { labels, mild, moderate, severe }
}

/**
 * Weekly data for the last 7 days, displayed as Mon..Sun.
 * @returns {{ labels: string[], data: number[] }}
 */
export function getWeeklyData() {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = [0, 0, 0, 0, 0, 0, 0]
  const today = startOfDay(new Date())
  const start = addDays(today, -6)

  // Convert JS getDay() (Sun=0) to Mon-index (Mon=0..Sun=6)
  const toMonIndex = (d) => (d.getDay() + 6) % 7

  for (const s of getAllSymptoms()) {
    const d = startOfDay(s.createdAt)
    if (d < start || d > today) continue
    const idx = toMonIndex(d)
    data[idx] += 1
  }

  return { labels, data }
}

export function exportSymptomsJson() {
  return JSON.stringify(getAllSymptoms(), null, 2)
}

export function clearAllSymptoms() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}


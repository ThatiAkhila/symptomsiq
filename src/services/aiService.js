import axios from 'axios'

/**
 * @typedef {import('../models/symptom.model.js').Symptom} Symptom
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function getGeminiModel() {
  // Gemini 1.5 models were retired; use a current default.
  const envModel = (import.meta?.env?.VITE_GEMINI_MODEL || '').trim()
  return envModel || 'gemini-flash-latest'
}

function getGeminiUrl() {
  const model = getGeminiModel()
  return `${GEMINI_BASE}/${model}:generateContent`
}

function requireApiKey(apiKey) {
  const key = (apiKey || '').trim()
  if (!key) {
    const err = new Error('Missing AI API key. Set it in Profile → API Settings.')
    err.name = 'MissingApiKeyError'
    throw err
  }
  return key
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function coerceExtract(obj) {
  if (!obj || typeof obj !== 'object') return null
  const symptomName = String(obj.symptomName || obj.symptomType || '').trim()
  const severityRaw = String(obj.severity || '').trim().toLowerCase()
  const severity =
    severityRaw === 'mild' || severityRaw === 'moderate' || severityRaw === 'severe'
      ? severityRaw
      : null
  const bodyPart = String(obj.bodyPart || '').trim()
  const timeOfDayRaw = String(obj.timeOfDay || '').trim()
  const allowedTimes = new Set(['Morning', 'Afternoon', 'Evening', 'Night'])
  const timeOfDay = allowedTimes.has(timeOfDayRaw) ? timeOfDayRaw : null
  const summary = String(obj.summary || '').trim()

  if (!symptomName || !severity || !bodyPart || !timeOfDay || !summary) return null
  return { symptomName, severity, bodyPart, timeOfDay, summary }
}

async function chatCompletion({ apiKey, messages, temperature = 0.2 }) {
  const key = requireApiKey(apiKey)

  // Gemini expects `contents` instead of OpenAI-style chat messages.
  // We flatten system+user messages into a single user content block.
  const systemParts = (messages || [])
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n')
  const userParts = (messages || [])
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n\n')

  const text = [systemParts, userParts].filter(Boolean).join('\n\n')

  try {
    const res = await axios.post(
      `${getGeminiUrl()}?key=${encodeURIComponent(key)}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        generationConfig: {
          temperature,
        },
      },
      {
        timeout: 45_000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const content =
      res?.data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(' ').trim() || ''
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Gemini returned an empty response.')
    }
    return content.trim()
  } catch (err) {
    if (!axios.isAxiosError(err) || !err.response) {
      throw err
    }

    const status = err.response.status
    const data = err.response.data || {}
    const apiError = data.error || {}
    const code = apiError.code
    const message = apiError.message

    if (status === 401) {
      throw new Error('Gemini rejected the API key. Double-check the key and project.')
    }

    if (status === 429 || code === 429 || apiError.status === 'RESOURCE_EXHAUSTED') {
      throw new Error(
        message ||
          'Gemini reports rate limit or quota exceeded. Check your Google AI Studio usage and limits.',
      )
    }

    if (status >= 500) {
      throw new Error('Gemini is currently unavailable (server error). Try again in a moment.')
    }

    throw new Error(message || `Gemini request failed with status ${status}.`)
  }
}

/**
 * Extracts structured fields from free text. Returns only the extracted object.
 * @param {string} text
 * @param {string} apiKey
 * @returns {Promise<{ symptomName: string, severity: 'mild'|'moderate'|'severe', bodyPart: string, timeOfDay: 'Morning'|'Afternoon'|'Evening'|'Night', summary: string }>}
 */
export async function extractSymptom(text, apiKey) {
  const userText = String(text || '').trim()
  if (!userText) throw new Error('No symptom text provided.')

  const system =
    'You are a medical data extractor. Return only JSON with keys: symptomName, severity (mild|moderate|severe), bodyPart, timeOfDay (Morning|Afternoon|Evening|Night), summary. Respond with JSON only, no markdown, no explanation.'

  const content = await chatCompletion({
    apiKey,
    temperature: 0.1,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userText },
    ],
  })

  // Tolerate occasional codefence wrapping by stripping it.
  const cleaned = content
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const parsed = safeJsonParse(cleaned)
  const extracted = coerceExtract(parsed)
  if (!extracted) {
      throw new Error('AI extraction was not valid JSON in the expected shape.')
  }
  return extracted
}

/**
 * Answers a question using the last 20 symptoms as context.
 * @param {string} question
 * @param {Symptom[]} symptomHistory
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
export async function answerQuestion(question, symptomHistory, apiKey) {
  const q = String(question || '').trim()
  if (!q) throw new Error('Question is empty.')

  const history = Array.isArray(symptomHistory) ? symptomHistory : []
  const context = history
    .slice(0, 20)
    .map((s) => {
      const when = new Date(s.createdAt).toLocaleString()
      return `- ${when} | ${s.symptomType} | ${s.severity} | ${s.bodyPart} | ${s.timeOfDay} | ${String(
        s.trigger || '',
      ).trim()} | ${String(s.text || '').trim()}`
    })
    .join('\n')

  const system =
    'You are SymptomIQ, a careful health journaling assistant. Provide plain-English, practical insights based only on the symptom history provided. Avoid diagnosis. Encourage seeking medical care for red flags. Keep it concise and actionable.'

  const user = `Symptom history (most recent first):\n${context || '(no history)'}\n\nQuestion: ${q}`

  return await chatCompletion({
    apiKey,
    temperature: 0.3,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
}

/**
 * Generates a doctor-ready summary paragraph.
 * @param {Symptom[]} symptoms
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
export async function generateSummary(symptoms, apiKey) {
  const list = Array.isArray(symptoms) ? symptoms : []
  const last = list.slice(0, 25)

  const context = last
    .map((s) => {
      const day = new Date(s.createdAt).toLocaleDateString()
      return `${day}: ${s.symptomType} (${s.severity}) ${s.bodyPart} ${s.timeOfDay}${
        s.trigger ? `; trigger: ${s.trigger}` : ''
      }. Note: ${String(s.text || '').trim()}`
    })
    .join('\n')

  const system =
    'You produce clinician-facing summaries from symptom journal logs. Be factual, structured, and brief. No diagnosis. Highlight frequency, severity, and notable triggers. End with a short note on red flags if present.'

  const user = `Create one concise paragraph summary from these logs:\n${context || '(no logs)'}`

  return await chatCompletion({
    apiKey,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
}


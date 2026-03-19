/**
 * SymptomIQ data models (JSDoc types).
 *
 * These are used for editor IntelliSense and lightweight type-safety
 * without introducing TypeScript.
 */

/**
 * @typedef {'mild' | 'moderate' | 'severe'} Severity
 */

/**
 * @typedef {'Morning' | 'Afternoon' | 'Evening' | 'Night'} TimeOfDay
 */

/**
 * @typedef {Object} AiExtracted
 * @property {string} symptomName
 * @property {Severity} severity
 * @property {string} bodyPart
 * @property {TimeOfDay} timeOfDay
 * @property {string} summary
 */

/**
 * Symptom
 * @typedef {Object} Symptom
 * @property {string} id - `crypto.randomUUID()`
 * @property {string} text - raw user input
 * @property {string} symptomType - Headache / Fatigue / Nausea / etc.
 * @property {Severity} severity
 * @property {string} bodyPart
 * @property {TimeOfDay} timeOfDay
 * @property {string=} trigger
 * @property {string} createdAt - ISO date string
 * @property {AiExtracted|null} aiExtracted
 */

/**
 * Alert
 * @typedef {Object} Alert
 * @property {string} id
 * @property {'high' | 'medium' | 'low'} level
 * @property {string} title
 * @property {string} message
 * @property {string} createdAt - ISO date string
 */

/**
 * Pattern (used by Insights)
 * @typedef {Object} Pattern
 * @property {string} id
 * @property {string} icon - emoji
 * @property {string} title
 * @property {string} description
 * @property {string} frequency - human readable (e.g. "5× / 30 days")
 * @property {'high' | 'medium' | 'low'} level
 */

export {}


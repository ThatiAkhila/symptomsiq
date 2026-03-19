import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { detectPatterns } from '../services/patternService'
import {
  deleteSymptom as deleteSymptomFromStore,
  getAllSymptoms,
  saveSymptom as saveSymptomToStore,
} from '../services/symptomService'

/**
 * @typedef {import('../models/symptom.model.js').Symptom} Symptom
 * @typedef {import('../models/symptom.model.js').Alert} Alert
 */

const API_KEY_STORAGE = 'symptomiq:openaiKey:v1'

const initialState = {
  /** @type {Symptom[]} */
  symptoms: [],
  /** @type {Alert[]} */
  alerts: [],
  /** @type {string} */
  apiKey: '',
  /** @type {boolean} */
  isAnalyzing: false,
}

function initFromStorage() {
  const symptoms = getAllSymptoms()
  const storedKey = (localStorage.getItem(API_KEY_STORAGE) || '').trim()
  const envKey = (import.meta?.env?.VITE_OPENAI_API_KEY || '').trim()
  const apiKey = storedKey || envKey
  const alerts = detectPatterns(symptoms)
  return { ...initialState, symptoms, alerts, apiKey }
}

function rebuildAlerts(state, symptoms) {
  const alerts = detectPatterns(symptoms)
  return { ...state, symptoms, alerts }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_SYMPTOM': {
      const nextSymptoms = saveSymptomToStore(action.payload)
      return rebuildAlerts(state, nextSymptoms)
    }
    case 'DELETE_SYMPTOM': {
      const nextSymptoms = deleteSymptomFromStore(action.payload)
      return rebuildAlerts(state, nextSymptoms)
    }
    case 'SET_ALERTS': {
      return { ...state, alerts: action.payload }
    }
    case 'SET_API_KEY': {
      return { ...state, apiKey: action.payload }
    }
    case 'SET_ANALYZING': {
      return { ...state, isAnalyzing: Boolean(action.payload) }
    }
    default: {
      return state
    }
  }
}

const SymptomContext = createContext(null)

export function SymptomProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initFromStorage)

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE, state.apiKey || '')
  }, [state.apiKey])

  const actions = useMemo(() => {
    return {
      /** @param {Symptom} symptom */
      addSymptom(symptom) {
        dispatch({ type: 'ADD_SYMPTOM', payload: symptom })
      },
      /** @param {string} id */
      deleteSymptom(id) {
        dispatch({ type: 'DELETE_SYMPTOM', payload: id })
      },
      /** @param {Alert[]} alerts */
      setAlerts(alerts) {
        dispatch({ type: 'SET_ALERTS', payload: alerts })
      },
      /** @param {string} key */
      setApiKey(key) {
        dispatch({ type: 'SET_API_KEY', payload: String(key || '') })
      },
      /** @param {boolean} isAnalyzing */
      setAnalyzing(isAnalyzing) {
        dispatch({ type: 'SET_ANALYZING', payload: isAnalyzing })
      },
    }
  }, [])

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions])

  return <SymptomContext.Provider value={value}>{children}</SymptomContext.Provider>
}

export function useSymptomContext() {
  const ctx = useContext(SymptomContext)
  if (!ctx) {
    throw new Error('useSymptomContext must be used within SymptomProvider')
  }
  return ctx
}


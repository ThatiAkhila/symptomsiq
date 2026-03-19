import { useMemo } from 'react'
import { useSymptomContext } from '../context/SymptomContext.jsx'
import {
  get30DayTrend,
  getFrequencyMap,
  getStreak,
  getWeeklyData,
} from '../services/symptomService'

/**
 * Symptom CRUD + computed aggregates.
 */
export function useSymptoms() {
  const { state, actions } = useSymptomContext()

  const metrics = useMemo(() => {
    const logsThisWeek = getWeeklyData().data.reduce((a, b) => a + b, 0)
    const streakDays = getStreak()
    const trend30 = get30DayTrend()
    const freq = getFrequencyMap()
    return { logsThisWeek, streakDays, trend30, freq, weekly: getWeeklyData() }
  }, [state.symptoms.length])

  return {
    symptoms: state.symptoms,
    alerts: state.alerts,
    isAnalyzing: state.isAnalyzing,
    apiKey: state.apiKey,
    addSymptom: actions.addSymptom,
    deleteSymptom: actions.deleteSymptom,
    setApiKey: actions.setApiKey,
    setAnalyzing: actions.setAnalyzing,
    ...metrics,
  }
}


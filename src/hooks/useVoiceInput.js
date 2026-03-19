import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null

export function useVoiceInput() {
  const supported = Boolean(SpeechRecognition)
  const recRef = useRef(null)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  const start = useCallback(() => {
    setError('')
    if (!supported) {
      setError('Voice input is not supported in this browser.')
      return
    }
    if (isListening) return

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event) => {
      let full = ''
      for (let i = 0; i < event.results.length; i += 1) {
        full += event.results[i][0].transcript
      }
      setTranscript(full.trim())
    }

    rec.onerror = (e) => {
      setError(e?.error ? `Mic error: ${e.error}` : 'Mic error.')
      setIsListening(false)
    }

    rec.onend = () => {
      setIsListening(false)
    }

    recRef.current = rec
    setIsListening(true)
    rec.start()
  }, [supported, isListening])

  const stop = useCallback(() => {
    const rec = recRef.current
    recRef.current = null
    if (rec) rec.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError('')
  }, [])

  useEffect(() => {
    return () => {
      const rec = recRef.current
      recRef.current = null
      if (rec) rec.stop()
    }
  }, [])

  return useMemo(() => {
    return { supported, isListening, transcript, error, start, stop, reset }
  }, [supported, isListening, transcript, error, start, stop, reset])
}


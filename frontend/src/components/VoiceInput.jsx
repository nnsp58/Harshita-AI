import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * VoiceInput — Web Speech API based voice recognition
 *
 * Props:
 *   onResult(text) — called with final recognized text
 *   onInterim(text) — called with interim text while speaking (optional)
 *   lang — default 'hi-IN' (also supports 'en-IN', 'en-US')
 *   size — button size: 'sm' | 'md' | 'lg'
 */
export default function VoiceInput({ onResult, onInterim, lang = 'hi-IN', size = 'md' }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) final += transcript
        else interim += transcript
      }
      if (interim && onInterim) onInterim(interim)
      if (final) {
        onResult?.(final.trim())
      }
    }

    recognition.onerror = (event) => {
      const msg = event.error === 'no-speech' ? 'Awaaz nahi aayi'
        : event.error === 'not-allowed' ? 'Microphone permission do'
        : event.error === 'network' ? 'Internet check karo'
        : `Error: ${event.error}`
      setError(msg)
      setListening(false)
      setTimeout(() => setError(null), 3000)
    }

    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    return () => {
      try { recognition.stop() } catch {}
    }
  }, [lang, onResult, onInterim])

  const toggle = () => {
    if (!recognitionRef.current) return
    if (listening) {
      try { recognitionRef.current.stop() } catch {}
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
        setError(null)
      } catch (e) {
        setError(e.message)
      }
    }
  }

  if (!supported) {
    return (
      <button type="button" disabled
        className="p-2.5 bg-gray-700 rounded-xl opacity-40 cursor-not-allowed"
        title="Voice not supported in this browser">
        <MicOff size={18} className="text-gray-400" />
      </button>
    )
  }

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  }
  const iconSize = { sm: 14, md: 18, lg: 22 }[size]

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={toggle}
        animate={listening ? { scale: [1, 1.1, 1] } : {}}
        transition={listening ? { duration: 1, repeat: Infinity } : {}}
        className={`${sizeClasses[size]} rounded-xl transition-colors ${
          listening
            ? 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/30'
            : 'bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
        title={listening ? 'Recording... क्लिक to stop' : 'Voice input — बोलकर लिखें'}
      >
        {listening
          ? <MicOff size={iconSize} className="text-white" />
          : <Mic size={iconSize} className="text-amber-400" />}
      </motion.button>

      {listening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap"
        >
          🔴 बोलिए... Listening
        </motion.div>
      )}

      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-900 text-red-200 text-[10px] rounded whitespace-nowrap">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

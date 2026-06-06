import { useState, useEffect } from 'react'
import { Mic, MicOff, FileText, Download, Calculator } from 'lucide-react'
import { useStore } from '../store'

export default function TADAForm() {
  const { createJob } = useStore()
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [calculations, setCalculations] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Speech recognition
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(prev => prev + ' ' + transcript)
          setIsListening(false)
        }

        rec.onend = () => setIsListening(false)
        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        setRecognition(rec)
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error)
      }
    } else {
      console.warn('Speech recognition not supported in this browser')
    }
  }, [])

  const startListening = () => {
    if (recognition) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const parseAndCalculate = async () => {
    setIsGenerating(true)
    try {
      // Use the backend API instead of webhook
      const token = localStorage.getItem('token')
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ cmd: input, userId: 'current' })
      })
      if (response.ok) {
        const result = await response.json()
        setParsedData(result.data || result)
        setCalculations(result.calculations || null)
      } else {
        console.warn('TA-DA API returned:', response.status)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setIsGenerating(false)
  }

  const downloadPDF = () => {
    // Assume the workflow returns a download URL
    window.open('/api/ta-da/download', '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">TA/DA Form Generator</h1>
        <p className="text-gray-600">Voice or text-triggered form generation with auto-calculations</p>
      </div>

      {/* Input Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Travel Details Input</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your travel: e.g., 'Traveled from Delhi to Mumbai on 5th May stayed 3 days meals cost 500'"
          className="w-full h-32 p-3 border rounded-lg resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!recognition}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 border-2 border-red-400'
                : 'btn-primary hover:shadow-lg'
            } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? <MicOff size={20} className="animate-bounce" /> : <Mic size={20} />}
            {isListening ? 'Stop Listening' : 'Start Voice Input'}
          </button>
          {!recognition && (
            <p className="text-xs text-gray-500 mt-1">Voice input not supported in this browser</p>
          )}
          <button onClick={parseAndCalculate} className="btn-primary flex items-center gap-2">
            <Calculator size={20} /> Generate Form
          </button>
        </div>
      </div>

      {/* Parsed Data */}
      {parsedData && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Parsed Travel Data</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(parsedData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">{key}</label>
                <input
                  value={value || ''}
                  onChange={(e) => setParsedData({ ...parsedData, [key]: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculations */}
      {calculations && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Calculations</h2>
          <div className="space-y-2">
            <p>Total TA: ₹{calculations.totalTA}</p>
            <p>Total DA: ₹{calculations.totalDA}</p>
            <p><strong>Total Amount: ₹{calculations.total}</strong></p>
          </div>
        </div>
      )}

      {/* Download */}
      {calculations && (
        <div className="text-center">
          <button onClick={downloadPDF} className="btn-primary flex items-center gap-2 mx-auto">
            <Download size={20} /> Download A3 PDF
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-600 mx-auto"></div>
          <p className="mt-2">Generating form...</p>
        </div>
      )}
    </div>
  )
}
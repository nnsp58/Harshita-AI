import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Send, Bot, FormInput, Search, CreditCard, Phone,
  ScanText, FileText, Briefcase
} from 'lucide-react'
import { useState, useRef } from 'react'
import { useStore } from '../store'
import { useSocket } from '../hooks/useSocket'
import VoiceInput from '../components/VoiceInput'
import { renderMessageText } from './SimpleDashboard'

// Service definitions — each service has its own page with chat preset
const SERVICE_CONFIGS = {
  'form-filling': {
    title: 'Form Filling / फॉर्म भरना',
    icon: FormInput,
    color: 'from-blue-500 to-blue-700',
    description: 'Government forms ko AI se auto-fill karein',
    descriptionHi: 'सरकारी फॉर्म AI से ऑटो-भरें',
    intent: 'form_fill',
    suggestions: [
      'SSC GD ka form fill karo',
      'Railway RRB form bharo',
      'Banking IBPS form fill karo',
      'Police form bharo',
    ],
    welcome: 'Kaunsa form fill karna hai? Boliye ya niche se chunein.',
  },
  'job-search': {
    title: 'Job Search / नौकरी खोजें',
    icon: Search,
    color: 'from-green-500 to-green-700',
    description: 'Naukri search karein — SSC, Railway, Banking, Police',
    descriptionHi: 'सरकारी नौकरियाँ खोजें',
    intent: 'job_search',
    suggestions: [
      'Railway mein naukri dhundho',
      'SSC ki latest vacancies',
      'Banking jobs',
      '12th pass jobs',
    ],
    welcome: 'Kis department ki naukri chahiye?',
  },
  'ration-card': {
    title: 'Ration Card / राशन कार्ड',
    icon: CreditCard,
    color: 'from-pink-500 to-pink-700',
    description: 'Ration card apply / status check / member add',
    descriptionHi: 'राशन कार्ड बनवाएं या स्थिति देखें',
    intent: 'ration_card',
    suggestions: [
      'Naya ration card banao',
      'Ration card status check karo',
      'Ration card mein member add karo',
      'Ration card ki copy nikalo',
    ],
    welcome: 'Ration card ke liye kya karna hai?',
  },
  'whatsapp': {
    title: 'WhatsApp Bot / व्हाट्सएप',
    icon: Phone,
    color: 'from-green-600 to-green-800',
    description: 'WhatsApp se documents bhejo, automated messages',
    descriptionHi: 'व्हाट्सएप से डॉक्यूमेंट भेजें',
    intent: 'whatsapp',
    suggestions: [
      'WhatsApp setup karo',
      'WhatsApp QR code dikhao',
      'WhatsApp message bhejo',
    ],
    welcome: 'WhatsApp Bot ready. Setup ya use karne ke liye command boliye.',
  },
  'ai-assistant': {
    title: 'AI Assistant / AI सहायक',
    icon: Bot,
    color: 'from-violet-500 to-violet-700',
    description: 'Kuch bhi pucho — Harshita AI jawab degi',
    descriptionHi: 'AI से कुछ भी पूछें',
    intent: 'general_chat',
    suggestions: [
      'CSC services list batao',
      'Aaj ki latest news',
      'Mera document verify karo',
      'TA-DA kaise calculate hota hai',
    ],
    welcome: 'Mujhse kuch bhi pucho — main madad karunga!',
  },
  'document-ocr': {
    title: 'Document OCR / दस्तावेज़ OCR',
    icon: ScanText,
    color: 'from-purple-500 to-purple-700',
    description: 'Photo/scan se data extract karein',
    descriptionHi: 'दस्तावेज़ की फोटो से डेटा निकालें',
    intent: 'document_ocr',
    suggestions: [
      'Aadhaar card scan karo',
      'PAN card se data nikalo',
      'Marksheet scan karo',
    ],
    welcome: 'Document upload karein ya photo lein — main data extract kar dunga.',
  },
  'legal-draft': {
    title: 'Legal Drafts / कानूनी ड्राफ्ट',
    icon: FileText,
    color: 'from-red-500 to-red-700',
    description: 'AI से कोई भी कानूनी दस्तावेज़ बनाएं',
    descriptionHi: 'गिफ्ट डीड, शपथ पत्र, NOC, बंटवारा, वसीयत — कुछ भी',
    intent: 'legal_draft',
    suggestions: [
      'Apni sampatti patni ke naam karna hai (Gift Deed)',
      'Naam change ka affidavit banao',
      'Vehicle transfer ke liye NOC chahiye',
      'Vasiyat banani hai',
      'Property bantwara karna hai',
    ],
    welcome: 'मुझसे कोई भी legal document बनवाएं — बस अपनी बात बोलिए, AI poora professional draft बना देगा।',
  },
  'legal-notice': {
    title: 'Legal Notice / वकील का नोटिस',
    icon: FileText,
    color: 'from-orange-600 to-red-700',
    description: 'Advocate letterhead par professional legal notice',
    descriptionHi: 'वकील के लेटरहेड पर कोई भी नोटिस',
    intent: 'legal_notice',
    suggestions: [
      'Cheque bounce notice ₹50000 ka',
      'Property eviction notice tenant ko',
      'Money recovery notice ₹2 lakh ka',
      'Defamation notice for false allegations',
      'Mera advocate profile setup karo',
    ],
    welcome: 'Advocate letterhead पर professional legal notice बनाएं। पहली बार use कर रहे हैं तो "advocate profile setup karo" बोलें।',
  },
}

export default function ServicePage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const { sendCommand, messages, isConnected } = useSocket()
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef(null)

  const config = SERVICE_CONFIGS[serviceId]

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Stop "thinking" indicator when AI responds and handle AI actions
  useEffect(() => {
    if (messages?.length > 0) {
      const last = messages[messages.length - 1]
      if (last.type === 'ai' || last.type === 'system') setIsThinking(false)

      // 🔀 Navigate action — skill wants to open a page (e.g. WhatsApp Web)
      if (last.type === 'ai' && last.action?.navigate) {
        setTimeout(() => {
          if (last.action.navigate.startsWith('http')) {
            window.open(last.action.navigate, '_blank')
          } else {
            navigate(last.action.navigate)
          }
        }, 1500)
      }
    }
  }, [messages, navigate])

  if (!config) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Service not found</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-amber-500 text-black rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const Icon = config.icon

  const handleSend = (text) => {
    const cmd = text || input.trim()
    if (!cmd) return
    sendCommand(cmd)
    setIsThinking(true)
    setInput('')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">{config.title}</h1>
          <p className="text-[10px] text-gray-500 truncate">{config.description}</p>
        </div>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-3xl w-full mx-auto">
        {/* Welcome message + suggestions */}
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8">
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
              <Icon size={32} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">{config.title}</h2>
            <p className="text-xs text-gray-400 mb-1">{config.descriptionHi}</p>
            <p className="text-sm text-gray-300 mt-4">{config.welcome}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto">
              {config.suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSend(s)}
                  className="text-left px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:border-amber-500/30 hover:bg-white/10 transition-all"
                >
                  "{s}"
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages && messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type !== 'user' && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0`}>
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.type === 'user'
                ? 'bg-amber-500 text-black rounded-br-sm'
                : 'bg-white/5 text-gray-200 rounded-bl-sm border border-white/10'
            }`}>
              {renderMessageText(msg.message)}
              <p className="text-[9px] opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-2xl flex items-center gap-1">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
              <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
              <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="border-t border-white/10 bg-[#0a0b10] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <VoiceInput
            lang="hi-IN"
            onResult={(text) => setInput(prev => (prev ? prev + ' ' : '') + text)}
            onInterim={(text) => { /* could show live preview */ }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${config.title} ke liye boliye ya likhein...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
          <button type="submit" disabled={!input.trim()}
            className="p-2.5 bg-amber-500 rounded-xl hover:bg-amber-400 disabled:opacity-30 transition-colors">
            <Send size={18} className="text-black" />
          </button>
        </div>
      </form>
    </div>
  )
}

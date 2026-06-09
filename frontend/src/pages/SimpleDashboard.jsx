import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useSocket } from '../hooks/useSocket'
import VoiceInput from '../components/VoiceInput'
import {
  FileText, Briefcase, Users, Upload, Calculator, Gavel,
  CreditCard, Search, Bot, LogOut, Settings,
  CheckCircle, Clock,
  FormInput, ScanText, Phone, Globe, User, Menu, X,
  ChevronRight, Zap, IndianRupee,
  Send, Mic, MicOff, Image, Code, Paperclip,
  PanelLeftClose, PanelRightClose, MessageSquare, LayoutGrid, Monitor,
  GripVertical
} from 'lucide-react'

const SERVICES = [
  { id: 'form-filling', title: 'Form Filling', titleHi: 'फॉर्म भरना', icon: FormInput, color: 'bg-blue-500', route: '/service/form-filling' },
  { id: 'document-scan', title: 'Document Scan', titleHi: 'दस्तावेज़ स्कैन', icon: ScanText, color: 'bg-purple-500', route: '/documents' },
  { id: 'job-search', title: 'Job Search', titleHi: 'नौकरी खोजें', icon: Search, color: 'bg-green-500', route: '/service/job-search' },
  { id: 'resume-builder', title: 'Resume', titleHi: 'रिज्यूमे', icon: FileText, color: 'bg-orange-500', route: '/resume-builder' },
  { id: 'bulk-import', title: 'Bulk Import', titleHi: 'बल्क अपलोड', icon: Upload, color: 'bg-indigo-500', route: '/bulk-import' },
  { id: 'candidates', title: 'Candidates', titleHi: 'उम्मीदवार', icon: Users, color: 'bg-teal-500', route: '/candidates' },
  { id: 'tada', title: 'TA-DA', titleHi: 'TA-DA नक्शा', icon: Calculator, color: 'bg-amber-500', route: '/tada-naksha' },
  { id: 'legal-draft', title: 'Legal Draft', titleHi: 'कानूनी ड्राफ्ट', icon: Gavel, color: 'bg-red-500', route: '/legal-draft' },
  { id: 'legal-notice', title: 'Legal Notice', titleHi: 'वकील नोटिस', icon: Gavel, color: 'bg-orange-600', route: '/legal-notice' },
  { id: 'itr-filing', title: 'ITR Filing', titleHi: 'ITR फाइलिंग', icon: IndianRupee, color: 'bg-emerald-500', route: '/itr-filing' },
  { id: 'ration-card', title: 'Ration Card', titleHi: 'राशन कार्ड', icon: CreditCard, color: 'bg-pink-500', route: '/service/ration-card' },
  { id: 'whatsapp', title: 'WhatsApp', titleHi: 'व्हाट्सएप', icon: Phone, color: 'bg-green-600', route: '/service/whatsapp' },
  { id: 'ai-assistant', title: 'AI Chat', titleHi: 'AI चैट', icon: Bot, color: 'bg-violet-500', route: '/service/ai-assistant' },
]

// ============ MAIN COMPONENT ============
export default function SimpleDashboard() {
  const navigate = useNavigate()
  const { user, stats, agents, jobs, initialize, logout } = useStore()
  const { isConnected, sendCommand, messages } = useSocket()
  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(360)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [mobileTab, setMobileTab] = useState('center')
  const [resizing, setResizing] = useState(null)
  const containerRef = useRef(null)

  const SERVICES_LIST = SERVICES // alias

  // Service click → Direct page open (user requirement)
  const handleServiceClick = useCallback((service) => {
    // If service has a route, open the page directly
    if (service.route) {
      navigate(service.route)
      return
    }

    // Fallback only for services without route (pure chat)
    setMobileTab('right')
    const cmd = `${service.title} kaise use karein?`
    sendCommand(cmd)
  }, [sendCommand, navigate])

  useEffect(() => { initialize() }, [initialize])
  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  // Listen for navigate actions from AI
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.type === 'ai' && lastMsg.action && lastMsg.action.navigate) {
        // Delay slightly for smooth transition
        setTimeout(() => {
          navigate(lastMsg.action.navigate)
        }, 1500)
      }
    }
  }, [messages, navigate])

  // Resize logic
  const startResize = useCallback((panel) => (e) => {
    e.preventDefault()
    setResizing(panel)
  }, [])

  useEffect(() => {
    if (!resizing) return
    const handleMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (resizing === 'left') {
        setLeftWidth(Math.min(Math.max(e.clientX - rect.left, 140), 380))
      } else if (resizing === 'right') {
        setRightWidth(Math.min(Math.max(rect.right - e.clientX, 260), 550))
      }
    }
    const handleUp = () => setResizing(null)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing])

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden">
      <DashboardHeader user={user} onLogout={handleLogout} onSettings={() => navigate('/settings')} />

      {/* Mobile Tabs */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-[#0f111a]">
        {[
          { id: 'left', label: 'Services', icon: LayoutGrid },
          { id: 'center', label: 'Dashboard', icon: Monitor },
          { id: 'right', label: 'AI Chat', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === tab.id ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* 3-Panel Resizable Layout */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!leftCollapsed && (
          <div className="hidden lg:block shrink-0 overflow-hidden" style={{ width: leftWidth }}>
            <LeftServicesPanel services={SERVICES} onServiceClick={handleServiceClick} />
          </div>
        )}
        {/* Left Resize Handle */}
        <ResizeHandle onMouseDown={startResize('left')} onToggle={() => setLeftCollapsed(!leftCollapsed)} collapsed={leftCollapsed} dir="left" />

        {/* Center Panel */}
        <div className="flex-1 min-w-0 hidden lg:flex flex-col">
          <CenterDashboardPanel stats={stats} agents={agents} jobs={jobs} onServiceClick={handleServiceClick} />
        </div>

        {/* Right Resize Handle */}
        <ResizeHandle onMouseDown={startResize('right')} onToggle={() => setRightCollapsed(!rightCollapsed)} collapsed={rightCollapsed} dir="right" />
        {/* Right Panel */}
        {!rightCollapsed && (
          <div className="hidden lg:block shrink-0 overflow-hidden" style={{ width: rightWidth }}>
<RightChatPanel messages={messages} onSend={sendCommand} isConnected={isConnected} user={user} jobs={jobs} />
          </div>
        )}

        {/* Mobile */}
        <div className="flex-1 lg:hidden overflow-hidden">
          {mobileTab === 'left' && <LeftServicesPanel services={SERVICES} onServiceClick={handleServiceClick} />}
          {mobileTab === 'center' && <CenterDashboardPanel stats={stats} agents={agents} jobs={jobs} onServiceClick={handleServiceClick} />}
          {mobileTab === 'right' && <RightChatPanel messages={messages} onSend={sendCommand} isConnected={isConnected} user={user} jobs={jobs} />}
        </div>
      </div>
    </div>
  )
}

// ============ RESIZE HANDLE ============
function ResizeHandle({ onMouseDown, onToggle, collapsed, dir }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="hidden lg:flex items-center justify-center w-[6px] cursor-col-resize hover:bg-amber-500/20 transition-colors relative group select-none"
    >
      <div className="absolute inset-y-0 w-[1px] bg-white/10 group-hover:bg-amber-500/60 transition-colors" />
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={10} className="text-amber-400" />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className="absolute top-2 z-10 p-0.5 rounded bg-[#0f111a] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        title={collapsed ? 'Show panel' : 'Hide panel'}
      >
        {dir === 'left'
          ? <PanelLeftClose size={9} className={`text-gray-400 ${collapsed ? 'rotate-180' : ''}`} />
          : <PanelRightClose size={9} className={`text-gray-400 ${collapsed ? 'rotate-180' : ''}`} />
        }
      </button>
    </div>
  )
}

// ============ MESSAGE RENDER HELPER ============
export function renderMessageText(text) {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return (
    <p className="break-words whitespace-pre-wrap">
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (match) {
          return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline font-semibold">{match[1]}</a>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// ============ LIVE CLOCK ============
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 ml-2 shrink-0">
      <Clock size={12} className="text-amber-400" />
      <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
        {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
      </span>
      <span className="text-[10px] text-gray-500 hidden sm:inline tracking-widest ml-1">
        {time.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    </div>
  )
}

// ============ HEADER ============
function DashboardHeader({ user, onLogout, onSettings }) {
  const navigate = useNavigate()
  return (
    <header className="h-14 bg-[#0f111a] border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2 min-w-[160px]">
        <img src="/harshita ai.png" alt="Harshita AI" className="w-8 h-8 rounded-lg" />
        <div>
          <span className="font-bold text-white text-sm tracking-wide">HARSHITA AI</span>
          <p className="text-[9px] text-gray-500">CSC Smart Dashboard</p>
        </div>
      </div>
      <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <Globe size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Harshita AI — Ready for your commands...</span>
        </div>
        <LiveClock />
      </div>
      <div className="flex items-center gap-3 min-w-[160px] justify-end">
        <button onClick={() => navigate('/admin')}
          title="Admin Dashboard"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-500/20">
          🛡️ Admin
        </button>
        <button onClick={onSettings} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Settings size={16} className="text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-xs text-gray-300 hidden lg:block">{user?.name || 'VLE'}</span>
        </div>
        <button onClick={onLogout} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
          <LogOut size={16} className="text-gray-400 hover:text-red-400" />
        </button>
      </div>
    </header>
  )
}

// ============ LEFT PANEL ============
function LeftServicesPanel({ services, onServiceClick }) {
  return (
    <div className="h-full flex flex-col bg-[#0a0b10] border-r border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services / सेवाएं</h2>
        <p className="text-[9px] text-gray-600 mt-1">Click → Chat me result milega</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <button key={service.id} onClick={() => onServiceClick(service)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group text-left">
              <div className={`w-8 h-8 rounded-lg ${service.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-300 group-hover:text-white truncate">{service.title}</p>
                <p className="text-[10px] text-gray-600">{service.titleHi}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============ CENTER PANEL ============
function CenterDashboardPanel({ stats, agents, jobs, onServiceClick }) {
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'running').length
  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'queued').length

  return (
    <div className="h-full flex flex-col bg-[#020617] overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Welcome / स्वागत है 👋</h2>
          <p className="text-xs text-gray-400 mt-1">Left se service chuno ya right mein AI se baat karo</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap size={16} className="text-amber-400" /> Quick Actions / त्वरित कार्य
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'form-filling', label: 'New Form', labelHi: 'नया फॉर्म', icon: FormInput, color: 'from-blue-500 to-blue-700' },
              { id: 'document-scan', label: 'Upload Doc', labelHi: 'डॉक अपलोड', icon: Upload, color: 'from-purple-500 to-purple-700' },
              { id: 'job-search', label: 'Find Jobs', labelHi: 'नौकरी खोजें', icon: Search, color: 'from-green-500 to-green-700' },
              { id: 'candidates', label: 'Candidates', labelHi: 'उम्मीदवार', icon: Users, color: 'from-teal-500 to-teal-700' },
              { id: 'resume-builder', label: 'Resume', labelHi: 'रिज्यूमे', icon: FileText, color: 'from-orange-500 to-orange-700' },
              { id: 'itr-filing', label: 'ITR File', labelHi: 'ITR फाइल', icon: IndianRupee, color: 'from-emerald-500 to-emerald-700' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <motion.button key={action.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onServiceClick({ id: action.id, title: action.label })}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-300">{action.label}</p>
                  <p className="text-[10px] text-gray-600">{action.labelHi}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" /> Recent / हाल की गतिविधि
            </h3>
            <button onClick={() => onServiceClick({ id: 'jobs-list', title: 'Recent Jobs' })} className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          {jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      job.status === 'completed' ? 'bg-emerald-400' : job.status === 'running' ? 'bg-blue-400 animate-pulse' : job.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-xs font-medium text-white">{job.type || job.title || 'Task'}</p>
                      <p className="text-[10px] text-gray-500">{job.created_at ? new Date(job.created_at).toLocaleDateString('hi-IN') : 'Today'}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : job.status === 'running' ? 'bg-blue-500/20 text-blue-400' : job.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5">
              <Zap size={24} className="mx-auto text-gray-600 mb-2" />
              <p className="text-xs text-gray-500">No recent activity / कोई गतिविधि नहीं</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ STAT CARD ============
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">{title}</p>
          <p className="text-lg font-bold text-white mt-0.5">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
      </div>
    </div>
  )
}

// ============ RIGHT CHAT PANEL ============
function RightChatPanel({ messages, onSend, isConnected, user, jobs = [] }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [mode, setMode] = useState('chat')
  const [isRecording, setIsRecording] = useState(false)
  const [scriptContent, setScriptContent] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imgInputRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    if (messages?.length > 0) {
      const last = messages[messages.length - 1]
      
      if (last.type === 'ai' || last.type === 'system') {
        // If AI indicates it's working in the background, keep the typing indicator for visual satisfaction
        if (last.message && (last.message.includes('रुकें') || last.message.includes('खोज रहा हूँ') || last.message.includes('रहा हूँ'))) {
          setIsThinking(true)
          setTimeout(() => setIsThinking(false), 3500)
        } else {
          setIsThinking(false)
        }
      }

      // 🎙️ VoiceAgentSkill support — auto speak when action.speak is true
      if (last.type === 'ai' && last.action?.speak) {
        const textToSpeak = last.action.text || last.message
        speak(textToSpeak, last.action.lang || 'hi-IN')
      }

      // 🔀 Navigate action — skill wants to open a page (e.g. TADA Naksha form)
      if (last.type === 'ai' && last.action?.navigate) {
        setTimeout(() => navigate(last.action.navigate), 1500)
      }
    }
  }, [messages, navigate])

  // Browser TTS helper (used by VoiceAgentSkill)
  const speak = (text, lang = 'hi-IN') => {
    if (!text || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = lang.startsWith('hi') ? 0.92 : 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('TTS failed:', e)
    }
  }

  const handleSend = (e) => {
    e?.preventDefault()
    if (!input.trim()) return
    const ok = onSend(input.trim())
    if (ok !== false) setIsThinking(true)
    setInput('')
  }
  const handleVoiceToggle = () => {
    setIsRecording(!isRecording)
    if (!isRecording) setTimeout(() => { setIsRecording(false); setInput('Voice message recorded...') }, 3000)
  }
  const handleFileUpload = (e) => { const f = e.target.files?.[0]; if (f) { onSend(`[File: ${f.name}]`); setIsThinking(true) } }
  const handleImageUpload = (e) => { const f = e.target.files?.[0]; if (f) { onSend(`[Image: ${f.name}]`); setIsThinking(true) } }
  const handleScriptSend = () => { if (!scriptContent.trim()) return; onSend(`[Script]\n${scriptContent}`); setIsThinking(true); setScriptContent(''); setMode('chat') }

  const modes = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'script', label: 'Script', icon: Code },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0a0b10] border-l border-white/10 overflow-hidden">
      {/* Header + Mode Tabs */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Harshita AI Chat</h2>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {modes.map((m) => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                  mode === m.id ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-gray-300'
                }`}>
                <Icon size={12} /> {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* CHAT MODE */}
      {mode === 'chat' && (<>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {(!messages || messages.length === 0) && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Bot size={28} className="text-amber-400" />
              </div>
              <p className="text-sm font-medium text-white">Harshita AI Ready</p>
              <p className="text-xs text-gray-500">Mujhse kuch bhi pucho — main saari services control kar sakti hoon</p>
              <div className="space-y-2 pt-2">
                {[
                  'TA-DA naksha banao',
                  'Cheque bounce ka legal notice bhejo',
                  'Apni sampatti patni ke naam karna hai (gift deed)',
                  'SSC GD ka form fill karo',
                  'Ration card status check karo',
                  'Resume banao',
                  'WhatsApp connect karo',
                  'Naye job openings dikhao',
                ].map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    className="w-full text-left px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-amber-500/30 transition-all">
                    &ldquo;{s}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages?.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                  msg.type === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/10'
                }`}>
                  {renderMessageText(msg.message)}
                  <span className="text-[9px] text-gray-500 mt-1 block">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {msg.type === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isThinking && (
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
              <div className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-xl">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                <motion.span className="w-1.5 h-1.5 rounded-full bg-amber-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Upload bar */}
        <div className="px-3 py-2 border-t border-white/5 flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.xlsx,.txt" />
          <input type="file" ref={imgInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/30 hover:bg-white/10 transition-all">
            <Paperclip size={13} className="text-gray-400" /><span className="text-[10px] text-gray-400">File</span>
          </button>
          <button onClick={() => imgInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-amber-500/30 hover:bg-white/10 transition-all">
            <Image size={13} className="text-gray-400" /><span className="text-[10px] text-gray-400">Image</span>
          </button>
          <span className="text-[9px] text-gray-600 ml-auto">Photo, Sign upload करें</span>
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <VoiceInput
              size="sm"
              lang="hi-IN"
              onResult={(text) => setInput(prev => (prev ? prev + ' ' : '') + text)}
            />
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Boliye ya likhein... 'TA-DA naksha banao' / 'Legal notice bhejo'"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors" />
            <button type="submit" disabled={!input.trim()} className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Send size={16} className="text-black" />
            </button>
          </div>
        </form>
      </>)}

      {/* JOBS / QUEUE PANEL - Real-time Active Tasks */}
      {mode === 'jobs' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase size={12} /> Active Jobs & Queue
          </div>
          {jobs && jobs.length > 0 ? (
            jobs.slice(0, 8).map((job, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">{job.service_type || job.type || 'Task'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                    job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    job.status === 'running' ? 'bg-amber-500/20 text-amber-400' :
                    job.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {job.status || 'queued'}
                  </span>
                </div>
                <div className="text-gray-400 mt-0.5 text-[10px] truncate">
                  {job.candidate_name || job.name || 'Candidate'} • {job.form_url ? 'Form fill' : 'Processing'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 text-xs">
              No active jobs right now.<br />Start a task from the center panel.
            </div>
          )}
          <div className="text-[9px] text-gray-600 text-center pt-2">Live updates every 15s via polling</div>
        </div>
      )}

      {/* VOICE MODE */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <p className="text-sm font-medium text-white">Voice Chat / आवाज़ से बात करें</p>
          <p className="text-xs text-gray-500">Mic button dabao aur apni baat bolo</p>
          <motion.button onClick={handleVoiceToggle} whileTap={{ scale: 0.9 }}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
            }`}>
            {isRecording ? <MicOff size={36} className="text-white" /> : <Mic size={36} className="text-black" />}
          </motion.button>
          <p className="text-xs text-gray-400">{isRecording ? '🔴 Recording... बोलिए...' : 'Tap to speak / बोलने के लिए दबाएं'}</p>
          {isRecording && (
            <motion.div className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="w-1 bg-red-400 rounded-full" animate={{ height: [8, 20, 8] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </motion.div>
          )}
          <div className="w-full mt-4 space-y-2">
            <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">Try saying:</p>
            {['SSC GD ka form bharo', 'Mera resume banao', 'Ration card apply karo'].map((s) => (
              <div key={s} className="px-3 py-2 bg-white/5 rounded-lg text-xs text-gray-400 text-center border border-white/5">&ldquo;{s}&rdquo;</div>
            ))}
          </div>
        </div>
      )}

      {/* SCRIPT MODE */}
      {mode === 'script' && (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-white">Write Script / स्क्रिप्ट लिखें</p>
            <p className="text-xs text-gray-500">Automation instructions likho</p>
          </div>
          <textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)}
            placeholder={"// Yahan script likho...\n// 1. SSC website open karo\n// 2. Form fill karo\n// 3. Documents upload karo\n// 4. Submit karo"}
            className="flex-1 bg-[#0d0e14] border border-white/10 rounded-xl p-4 text-xs text-green-400 font-mono placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none" />
          <div className="flex items-center gap-2">
            <button onClick={() => setMode('chat')} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleScriptSend} disabled={!scriptContent.trim()}
              className="flex-1 px-4 py-2.5 bg-amber-500 rounded-lg text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              <Send size={14} /> Run Script
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

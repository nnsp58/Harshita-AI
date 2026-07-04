import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useSocket } from '../hooks/useSocket'
import api, { authAPI } from '../services/api'
import VoiceInput from '../components/VoiceInput'
import DocumentEditorPanel from '../components/DocumentEditorPanel'
import {
  FileText, Briefcase, Users, Upload, Calculator, Gavel,
  CreditCard, Search, Bot, LogOut, Settings,
  CheckCircle, Clock,
  FormInput, ScanText, Phone, Globe, User, Menu, X,
  ChevronRight, Zap, IndianRupee,
  Send, Mic, MicOff, Image, Code, Paperclip,
  PanelLeftClose, PanelRightClose, MessageSquare, LayoutGrid, Monitor,
  GripVertical, Video, Heart, Plus, Star
} from 'lucide-react'

import Fuse from 'fuse.js'
import { AGENTS, CATEGORIES } from '../data/agents'
import AgentStudioPanel from '../components/Dashboard/AgentStudioPanel'
import AdSenseWidget from '../components/AdSenseWidget'
import LeftPanel from '../components/Dashboard/LeftPanel'

const SERVICES = [
  { id: 'story-video', title: 'Story Video', titleHi: 'कहानी से कार्टून', icon: Video, color: 'bg-indigo-600', route: '/story-video' },
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
  { id: 'pdf-tools', title: 'PDF Tools', titleHi: 'PDF टूल्स', icon: FileText, color: 'bg-red-600', route: '/tools-hub/pdf-to-word.html' },
  { id: 'calculator', title: 'Calculator', titleHi: 'कैलकुलेटर', icon: Calculator, color: 'bg-gray-600', route: '/tools-hub/multifunction-calculator.html' },
  { id: 'image-tools', title: 'Image Editor', titleHi: 'फोटो एडिटर', icon: Image, color: 'bg-yellow-600', route: '/tools-hub/image-compress.html' }
]

// ============ MAIN COMPONENT ============
export default function SimpleDashboard() {
  const navigate = useNavigate()
  const { user, stats, agents, jobs, initialize, logout, setAuth, responseMode } = useStore()
  const { isConnected, sendCommand, messages, setMessages } = useSocket()
  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(360)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [mobileTab, setMobileTab] = useState('center')
  const [resizing, setResizing] = useState(null)
  const [activeFile, setActiveFile] = useState(null) // { url: string, name: string, type: string }
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null) // PRD-UI selected agent
  const [showQuickActions, setShowQuickActions] = useState(false)
  const containerRef = useRef(null)

  const SERVICES_LIST = SERVICES // alias

  const userGoal = user?.preferences?.goal || 'general';

  // Open Onboarding Modal if preferences.goal is missing
  useEffect(() => {
    if (user && (!user.preferences || !user.preferences.goal)) {
      setShowOnboarding(true)
    }
  }, [user])

  const handleSelectGoal = async (goal) => {
    try {
      const response = await authAPI.updatePreferences({ goal })
      if (response.data && response.data.success) {
        const token = useStore.getState().token
        setAuth(token, response.data.data)
        setShowOnboarding(false)
      }
    } catch (err) {
      console.error('Failed to save preferences:', err)
    }
  }

  // Customise services list based on user goal preference
  const getCustomizedServices = () => {
    const defaultServices = [...SERVICES];
    if (userGoal === 'legal') {
      return [
        defaultServices.find(s => s.id === 'legal-draft'),
        defaultServices.find(s => s.id === 'legal-notice'),
        defaultServices.find(s => s.id === 'itr-filing'),
        defaultServices.find(s => s.id === 'tada'),
        ...defaultServices.filter(s => !['legal-draft', 'legal-notice', 'itr-filing', 'tada'].includes(s.id))
      ].filter(Boolean);
    }
    if (userGoal === 'creator') {
      return [
        defaultServices.find(s => s.id === 'story-video'),
        defaultServices.find(s => s.id === 'document-scan'),
        defaultServices.find(s => s.id === 'ai-assistant'),
        ...defaultServices.filter(s => !['story-video', 'document-scan', 'ai-assistant'].includes(s.id))
      ].filter(Boolean);
    }
    if (userGoal === 'student') {
      return [
        { id: 'academy', title: 'Academy & Courses', titleHi: 'एकेडमी व कोर्सेज', icon: FileText, color: 'bg-gradient-to-r from-cyan-500 to-blue-600', route: '/academy' },
        defaultServices.find(s => s.id === 'resume-builder'),
        defaultServices.find(s => s.id === 'ai-assistant'),
        ...defaultServices.filter(s => !['resume-builder', 'ai-assistant'].includes(s.id))
      ].filter(Boolean);
    }
    if (userGoal === 'business') {
      return [
        defaultServices.find(s => s.id === 'itr-filing'),
        defaultServices.find(s => s.id === 'tada'),
        defaultServices.find(s => s.id === 'ration-card'),
        defaultServices.find(s => s.id === 'whatsapp'),
        ...defaultServices.filter(s => !['itr-filing', 'tada', 'ration-card', 'whatsapp'].includes(s.id))
      ].filter(Boolean);
    }
    if (userGoal === 'developer') {
      return [
        { id: 'self-healing', title: 'Self Healing Center', titleHi: 'स्व-सुधार केंद्र', icon: Bot, color: 'bg-emerald-600', route: '/admin/control/self-healing' },
        defaultServices.find(s => s.id === 'ai-assistant'),
        defaultServices.find(s => s.id === 'bulk-import'),
        ...defaultServices.filter(s => !['bulk-import', 'ai-assistant'].includes(s.id))
      ].filter(Boolean);
    }
    return defaultServices;
  };

  const customizedServices = getCustomizedServices();

  // Service click → Direct page open (user requirement)
  const handleServiceClick = useCallback((service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (service.route) {
      navigate(service.route)
      return
    }
    setMobileTab('right')
    const cmd = `${service.title} kaise use karein?`
    sendCommand(cmd)
  }, [user, sendCommand, navigate])

  const handleCommandWithAuth = useCallback((cmd) => {
    if (!user) {
      navigate('/login');
      return;
    }
    sendCommand(cmd);
  }, [user, sendCommand, navigate]);

  const handlePreviewFile = useCallback((fileObj) => {
    setActiveFile(fileObj);
    setMobileTab('center');
  }, []);

  useEffect(() => { initialize() }, [initialize])
  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  // Listen for navigate actions from AI
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.type === 'ai' && lastMsg.action && lastMsg.action.navigate) {
        setTimeout(() => {
          if (lastMsg.action.navigate.startsWith('http')) {
            window.location.href = lastMsg.action.navigate
          } else {
            navigate(lastMsg.action.navigate)
          }
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

      {/* Rule 11: No ads inside Document Workspace / Legal / Resume */}
      {responseMode !== 'DOCUMENT' && (
        <AdSenseWidget slot="1234567890" format="auto" />
      )}

      {/* 3-Panel Resizable Layout */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!leftCollapsed && (
          <div className="hidden lg:flex flex-col shrink-0 overflow-hidden" style={{ width: leftWidth }}>
            <LeftPanel 
              user={user}
              onNavigate={(navData) => {
                if (!user) { navigate('/login'); return; }
                // Rule 1 (Universal Search) & Rule 7 (Templates): direct AI command
                if (navData.intent === 'NATURAL_LANGUAGE_SEARCH' || navData.intent === 'TEMPLATE') {
                  sendCommand(navData.title || navData.query);
                  setMobileTab('right');
                  return;
                }
                // Template click → build a prompt and send to AI Command Center
                if (navData.workspace === 'Document' || navData.workspace === 'Legal') {
                  const prompt = `${navData.title} likhna hai`;
                  sendCommand(prompt);
                  setMobileTab('right');
                } else if (navData.service) {
                  handleServiceClick({ id: navData.service, title: navData.title, route: null });
                }
              }} 
            />
          </div>
        )}
        {/* Left Resize Handle */}
        <ResizeHandle onMouseDown={startResize('left')} onToggle={() => setLeftCollapsed(!leftCollapsed)} collapsed={leftCollapsed} dir="left" />

        {/* Center Panel */}
        <div className="flex-1 min-w-0 hidden lg:flex flex-col">
          {responseMode === 'DOCUMENT' ? (
            <DocumentEditorPanel />
          ) : activeFile ? (
            <FileViewerPanel file={activeFile} onClose={() => setActiveFile(null)} />
          ) : selectedAgent ? (
              <AgentStudioPanel 
                agent={selectedAgent} 
                onGenerate={(prompt) => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setMobileTab('right');
                  sendCommand(prompt);
                }}
                onEditInWorkspace={() => setResponseMode('DOCUMENT')}
              />
          ) : (
            <CenterDashboardPanel stats={stats} agents={agents} jobs={jobs} onServiceClick={handleServiceClick} goal={userGoal} quickActions={customizedServices} onSend={handleCommandWithAuth} />
          )}
        </div>

        {/* Right Resize Handle */}
        <ResizeHandle onMouseDown={startResize('right')} onToggle={() => setRightCollapsed(!rightCollapsed)} collapsed={rightCollapsed} dir="right" />
        {/* Right Panel */}
        {!rightCollapsed && (
          <div className="hidden lg:block shrink-0 overflow-hidden" style={{ width: rightWidth }}>
            <RightChatPanel messages={messages} setMessages={setMessages} onSend={handleCommandWithAuth} isConnected={isConnected} user={user} jobs={jobs} onPreviewFile={handlePreviewFile} />
          </div>
        )}

        {/* Mobile */}
        <div className="flex-1 lg:hidden overflow-hidden">
          {mobileTab === 'left' && (
            <LeftPanel 
              user={user}
              onNavigate={(navData) => {
                if (!user) { navigate('/login'); return; }
                if (navData.intent === 'NATURAL_LANGUAGE_SEARCH' || navData.intent === 'TEMPLATE') {
                  sendCommand(navData.title || navData.query);
                  setMobileTab('center');
                  return;
                }
                if (navData.workspace === 'Document' || navData.workspace === 'Legal') {
                  const prompt = `${navData.title} likhna hai`;
                  sendCommand(prompt);
                } else if (navData.service) {
                  handleServiceClick({ id: navData.service, title: navData.title, route: null });
                }
                setMobileTab('center');
              }} 
            />
          )}
          {mobileTab === 'center' && (
            responseMode === 'DOCUMENT' ? (
              <DocumentEditorPanel />
            ) : activeFile ? (
              <FileViewerPanel file={activeFile} onClose={() => setActiveFile(null)} />
            ) : selectedAgent ? (
              <AgentStudioPanel 
                agent={selectedAgent} 
                onGenerate={(prompt) => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setMobileTab('right');
                  sendCommand(prompt);
                }}
                onEditInWorkspace={() => setResponseMode('DOCUMENT')}
              />
            ) : (
              <CenterDashboardPanel stats={stats} agents={agents} jobs={jobs} onServiceClick={handleServiceClick} goal={userGoal} quickActions={customizedServices} onSend={handleCommandWithAuth} />
            )
          )}
          {mobileTab === 'right' && <RightChatPanel messages={messages} setMessages={setMessages} onSend={handleCommandWithAuth} isConnected={isConnected} user={user} jobs={jobs} onPreviewFile={handlePreviewFile} />}
        </div>
      </div>

      {/* ONBOARDING GOAL MODAL OVERLAY */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Welcome to Harshita AI! / स्वागत है!
                </h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto font-medium">
                  What would you like to do with Harshita AI? Please select your primary focus to customize your experience.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: 'creator', label: 'Content Creator', labelHi: 'कंटेंट क्रिएटर', desc: 'Create videos, stories, audio & blog posts.', emoji: '🎬' },
                  { id: 'student', label: 'Student', labelHi: 'विद्यार्थी', desc: 'Learn AI basics, take quizzes & earn certificates.', emoji: '🎓' },
                  { id: 'business', label: 'Business Owner', labelHi: 'व्यापारी', desc: 'Manage tax filings, calculate routes & campaigns.', emoji: '💼' },
                  { id: 'legal', label: 'Legal User', labelHi: 'वकील / कानून', desc: 'Draft legal agreements, deeds & notices.', emoji: '⚖️' },
                  { id: 'developer', label: 'Developer', labelHi: 'डेवलपर', desc: 'Monitor platform health, APIs & databases.', emoji: '💻' },
                  { id: 'general', label: 'General User', labelHi: 'सामान्य उपयोगकर्ता', desc: 'Access full dashboard and all AI utilities.', emoji: '✨' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectGoal(item.id)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-white/10 transition-all text-left flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-2xl block mb-2">{item.emoji}</span>
                      <h3 className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">{item.label}</h3>
                      <p className="text-[10px] text-gray-400">{item.labelHi}</p>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Quick Actions (PRD-034/PRD-035) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        {showQuickActions && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-in slide-in-from-bottom duration-200">
            {[
              { label: 'New Application', icon: FileText, cmd: 'प्रधानाचार्य को छुट्टी के लिए एप्लीकेशन लिखो' },
              { label: 'Legal Notice', icon: Gavel, cmd: 'Consumer complaint notice bhejo' },
              { label: 'Resume Builder', icon: User, cmd: 'Resume banao' },
              { label: 'Calculator', icon: Calculator, cmd: 'Multifunction calculator' },
              { label: 'Voice Command', icon: Mic, action: () => setMobileTab('right') }
            ].map((act, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setShowQuickActions(false);
                  if (act.action) {
                    act.action();
                  } else {
                    handleCommandWithAuth(act.cmd);
                    setMobileTab('right');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0f111a]/95 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl shadow-2xl transition-all"
              >
                <act.icon size={13} className="text-indigo-400" />
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 hover:rotate-12"
        >
          <Plus size={24} className={`transition-transform duration-200 ${showQuickActions ? 'rotate-45' : ''}`} />
        </button>
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
  // Strip leading routing status prefix if present
  const cleanedText = text.replace(/^\[[^\]]*रूटिंग[^\]]*\]\s*/, '');
  const parts = cleanedText.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return (
    <p className="break-words whitespace-pre-wrap">
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (match) {
          return <a key={i} href={match[2]} className="text-amber-400 hover:text-amber-300 underline font-semibold">{match[1]}</a>;
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
        <button onClick={() => navigate('/pricing')}
          title="Upgrade to Premium"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20">
          ⭐ Upgrade
        </button>
        <button onClick={() => navigate('/admin')}
          title="Admin Dashboard"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold hover:bg-amber-500/20">
          🛡️ Admin
        </button>
        <button onClick={onSettings} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Settings size={16} className="text-gray-400">
          </Settings>
          {/* Old LeftServicesPanel has been fully replaced by the new Smart LeftPanel system (PRD-027 / PRD-028 Phase 2) */}
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

// Old LeftServicesPanel has been fully replaced by the new Smart LeftPanel system (PRD-027 / PRD-028 Phase 2)

// ============ CENTER PANEL ============
function CenterDashboardPanel({ stats, agents, jobs, onServiceClick, goal = 'general', quickActions = [], onSend }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExplorer, setShowExplorer] = useState(false);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerCategory, setExplorerCategory] = useState('All');
  
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('harshita_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('harshita_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const ALL_SERVICES_DATA = [
    { id: 'leave-app', title: 'Leave Application', titleHi: 'प्रार्थना पत्र', desc: 'Write applications for school or office leave.', icon: FileText, color: 'from-blue-500 to-indigo-500', route: '/service/leave-application', categories: ['All', 'Applications', 'Education'] },
    { id: 'legal-notice', title: 'Legal Notice', titleHi: 'कानूनी नोटिस', desc: 'Draft legal warnings and recovery notices.', icon: Gavel, color: 'from-orange-500 to-red-500', route: '/legal-notice', categories: ['All', 'Legal', 'Business'] },
    { id: 'resume-builder', title: 'Resume Builder', titleHi: 'रिज्यूमे मेकर', desc: 'Create professional bio-data and resumes.', icon: FileText, color: 'from-purple-500 to-indigo-500', route: '/resume-builder', categories: ['All', 'Applications', 'Education'] },
    { id: 'story-video', title: 'AI Cartoon Video', titleHi: 'कहानी से कार्टून', desc: 'Generate animated story videos with voiceovers.', icon: Video, color: 'from-pink-500 to-rose-500', route: '/story-video', categories: ['All', 'Video', 'Media'] },
    { id: 'tada', title: 'TA-DA Calculator', titleHi: 'भत्ता कैलकुलेटर', desc: 'Compute traveling allowance maps and reports.', icon: Calculator, color: 'from-amber-500 to-orange-500', route: '/tada-naksha', categories: ['All', 'Tools', 'Government', 'CSC'] },
    { id: 'calculator', title: 'Calculator Tools', titleHi: 'कैलकुलेटर', desc: 'Perform financial and unit conversions.', icon: Calculator, color: 'from-cyan-500 to-blue-500', route: '/tools-hub/multifunction-calculator.html', categories: ['All', 'Tools'] },
    { id: 'form-filling', title: 'Form Filling', titleHi: 'फॉर्म भरना', desc: 'Online form application helpers.', icon: FormInput, color: 'from-blue-500 to-sky-500', route: '/service/form-filling', categories: ['All', 'Applications', 'CSC'] },
    { id: 'bulk-import', title: 'Bulk Import', titleHi: 'बल्क अपलोड', desc: 'Import candidate datasets in bulk.', icon: Upload, color: 'from-indigo-500 to-purple-500', route: '/bulk-import', categories: ['All', 'Applications', 'CSC', 'Tools'] },
    { id: 'candidates', title: 'Candidates Registry', titleHi: 'उम्मीदवार', desc: 'Manage applicant lists and profiles.', icon: Users, color: 'from-teal-500 to-emerald-500', route: '/candidates', categories: ['All', 'Applications', 'Business'] },
    { id: 'ration-card', title: 'Ration Card', titleHi: 'राशन कार्ड', desc: 'Apply or verify state ration card quotas.', icon: CreditCard, color: 'from-pink-500 to-rose-500', route: '/service/ration-card', categories: ['All', 'Applications', 'Government', 'CSC'] },
    { id: 'whatsapp', title: 'WhatsApp Blast', titleHi: 'व्हाट्सएप कैंपेन', desc: 'Send campaigns to users via WhatsApp.', icon: Phone, color: 'from-green-500 to-emerald-600', route: '/service/whatsapp', categories: ['All', 'Business', 'Tools'] },
    { id: 'ai-assistant', title: 'AI Assistant Chat', titleHi: 'AI चैट', desc: 'Conversational assistant for any queries.', icon: Bot, color: 'from-violet-500 to-purple-600', route: '/service/ai-assistant', categories: ['All', 'Education'] },
    { id: 'pdf-tools', title: 'PDF Tools', titleHi: 'PDF टूल्स', desc: 'Merge, split, and convert PDF formats.', icon: FileText, color: 'from-red-500 to-rose-600', route: '/tools-hub/pdf-to-word.html', categories: ['All', 'Tools', 'Media'] },
    { id: 'image-tools', title: 'Image Editor', titleHi: 'फोटो एडिटर', desc: 'Crop, compress, and edit photos.', icon: Image, color: 'from-yellow-500 to-amber-600', route: '/tools-hub/image-compress.html', categories: ['All', 'Image', 'Media'] },
    { id: 'document-scan', title: 'Document OCR', titleHi: 'दस्तावेज़ स्कैन', desc: 'Scan and extract print text from images.', icon: ScanText, color: 'from-purple-500 to-violet-600', route: '/documents', categories: ['All', 'Image', 'Media'] }
  ];

  const TEMPLATES_LIBRARY = [
    { id: 'leave_app', title: 'Leave Application', titleHi: 'प्रार्थना पत्र', category: 'Applications', desc: 'School or office leave application.' },
    { id: 'principal_app', title: 'Principal Application', titleHi: 'प्रधानाचार्य को पत्र', category: 'Applications', desc: 'Official request to school principal.' },
    { id: 'rent_agreement', title: 'Rent Agreement', titleHi: 'किराया अनुबंध', category: 'Legal', desc: 'Tenant-landlord agreement.' },
    { id: 'legal_notice', title: 'Legal Notice', titleHi: 'कानूनी नोटिस', category: 'Legal', desc: 'Court warning notice.' },
    { id: 'reply_notice', title: 'Reply Notice', titleHi: 'नोटिस का जवाब', category: 'Legal', desc: 'Reply to opponent notice.' },
    { id: 'consumer_complaint', title: 'Consumer Complaint', titleHi: 'उपभोक्ता शिकायत', category: 'Legal', desc: 'Complaint letter to consumer court.' },
    { id: 'electricity_complaint', title: 'Electricity Complaint', titleHi: 'बिजली शिकायत', category: 'Government', desc: 'Complaint to electricity board.' },
    { id: 'water_complaint', title: 'Water Complaint', titleHi: 'पानी की शिकायत', category: 'Government', desc: 'Complaint regarding water issues.' },
    { id: 'poster', title: 'Poster Template', titleHi: 'पोस्टर डिज़ाइन', category: 'Media', desc: 'AI custom poster template.' },
    { id: 'thumbnail', title: 'Thumbnail Template', titleHi: 'थंबनेल डिज़ाइन', category: 'Media', desc: 'YouTube video thumbnail template.' }
  ];

  const searchResults = searchQuery.trim()
    ? ALL_SERVICES_DATA.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const [recentDocs, setRecentDocs] = useState([]);
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('harshita_doc_history') || '[]');
      setRecentDocs(history);
    } catch {
      setRecentDocs([]);
    }
  }, []);

  const CATEGORIES_LIST = [
    'All', 'Applications', 'Legal', 'Business', 'Video', 'Image', 'Tools', 'Education', 'Government', 'CSC', 'Media'
  ];

  const filteredServices = activeCategory === 'All'
    ? ALL_SERVICES_DATA
    : ALL_SERVICES_DATA.filter(s => s.categories.includes(activeCategory));

  const favoritesList = ALL_SERVICES_DATA.filter(s => favorites.includes(s.id));

  const POPULAR_SERVICES = [
    { id: 'leave-app', title: 'Leave Application', titleHi: 'प्रार्थना पत्र', desc: 'Write applications for school or office leave.', icon: FileText, color: 'from-blue-500 to-indigo-500', route: '/service/leave-application' },
    { id: 'legal-notice', title: 'Legal Notice', titleHi: 'कानूनी नोटिस', desc: 'Draft legal warnings and recovery notices.', icon: Gavel, color: 'from-orange-500 to-red-500', route: '/legal-notice' },
    { id: 'resume-builder', title: 'Resume Builder', titleHi: 'रिज्यूमे मेकर', desc: 'Create professional bio-data and resumes.', icon: FileText, color: 'from-purple-500 to-indigo-500', route: '/resume-builder' },
    { id: 'story-video', title: 'AI Cartoon Video', titleHi: 'कहानी से कार्टून', desc: 'Generate animated story videos with voiceovers.', icon: Video, color: 'from-pink-500 to-rose-500', route: '/story-video' },
    { id: 'tada', title: 'TA-DA Calculator', titleHi: 'भत्ता कैलकुलेटर', desc: 'Compute traveling allowance maps and reports.', icon: Calculator, color: 'from-amber-500 to-orange-500', route: '/tada-naksha' },
    { id: 'calculator', title: 'Calculator Tools', titleHi: 'कैलकुलेटर', desc: 'Perform financial and unit conversions.', icon: Calculator, color: 'from-cyan-500 to-blue-500', route: '/tools-hub/multifunction-calculator.html' }
  ];

  return (
    <div className="h-full flex flex-col bg-[#020617] overflow-y-auto select-none relative">
      
      {/* Search Header (Sticky) */}
      <div className="sticky top-0 bg-[#020617]/95 backdrop-blur-md border-b border-white/5 p-4 z-40 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-indigo-500 animate-pulse"></span>
            Harshita AI Workspace
          </h2>
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20 transition-colors"
          >
            📂 Template Explorer
          </button>
        </div>

        {/* Top Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Universal Search (e.g. Passport Photo, Leave Application, Rent Agreement)..."
            className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setShowExplorer(false);
              }}
              className={`px-3 py-1 rounded-full text-[9px] font-bold whitespace-nowrap border transition-all ${
                activeCategory === cat && !showExplorer
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Modal overlay */}
      {showExplorer && (
        <div className="p-4 sm:p-6 bg-[#0c0d19] border-b border-white/10 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Mega Template Explorer</h3>
              <p className="text-[9px] text-gray-500">Search and filter 100+ documents and drafting templates</p>
            </div>
            <button onClick={() => setShowExplorer(false)} className="text-gray-500 hover:text-white text-xs">Close ✕</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
              placeholder="Search templates..."
              className="flex-1 bg-[#0a0b10] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-600"
            />
            <select
              value={explorerCategory}
              onChange={(e) => setExplorerCategory(e.target.value)}
              className="bg-[#0a0b10] border border-white/10 rounded-lg p-2 text-xs text-white"
            >
              <option value="All">All Categories</option>
              <option value="Applications">Applications</option>
              <option value="Legal">Legal Notice & Agreements</option>
              <option value="Government">Government Complaints</option>
              <option value="Media">Media Designs</option>
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATES_LIBRARY.filter(t => 
              (explorerCategory === 'All' || t.category === explorerCategory) &&
              (t.title.toLowerCase().includes(explorerSearch.toLowerCase()) || t.titleHi.toLowerCase().includes(explorerSearch.toLowerCase()))
            ).map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setShowExplorer(false);
                  onServiceClick({ id: t.id, title: t.title });
                }}
                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/20 text-left hover:bg-white/10 transition-all"
              >
                <h4 className="text-xs font-bold text-gray-200 truncate">{t.title}</h4>
                <p className="text-[9px] text-gray-500 truncate">{t.titleHi}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        
        {/* Search Results Grid */}
        {searchQuery.trim() !== '' && (
          <div>
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map(s => (
                  <ServiceCard key={s.id} service={s} favorites={favorites} onToggleFavorite={toggleFavorite} onClick={onServiceClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                <HelpCircle size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No results found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Regular Layout */}
        {searchQuery.trim() === '' && (
          <>
            {/* activeCategory is All -> Carousels */}
            {activeCategory === 'All' && !showExplorer && (
              <>
                {/* 1. Favorites */}
                {favoritesList.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Heart size={10} className="fill-amber-500 text-amber-500" />
                      Pinned Favorites / पसंदीदा सेवाएँ
                    </h3>
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-none snap-x py-1">
                      {favoritesList.map(s => (
                        <div key={s.id} className="w-[180px] shrink-0 snap-start">
                          <ServiceCard service={s} favorites={favorites} onToggleFavorite={toggleFavorite} onClick={onServiceClick} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Popular Section (⭐ Most Used) */}
                <div>
                  <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Star size={10} className="text-amber-500" />
                    ⭐ Most Used / सर्वाधिक उपयोग
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {POPULAR_SERVICES.map(s => (
                      <Link
                        key={s.id}
                        to={s.route}
                        className="group h-[135px] p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/20 hover:bg-white/10 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <s.icon size={16} className="text-indigo-400 mb-1.5" />
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{s.title}</h4>
                          <p className="text-[9px] text-gray-500 truncate">{s.titleHi}</p>
                          <p className="text-[9px] text-gray-400 line-clamp-1 mt-1 leading-snug">{s.desc}</p>
                        </div>
                        <div className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5 mt-auto">
                          Launch <ChevronRight size={10} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. Applications Carousel */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      📝 Applications & Forms / प्रार्थना पत्र
                    </h3>
                    <button onClick={() => setActiveCategory('Applications')} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold">
                      View All →
                    </button>
                  </div>
                  <div className="flex items-center gap-4 overflow-x-auto scrollbar-none snap-x py-1">
                    {ALL_SERVICES_DATA.filter(s => s.categories.includes('Applications')).map(s => (
                      <div key={s.id} className="w-[185px] shrink-0 snap-start">
                        <ServiceCard service={s} favorites={favorites} onToggleFavorite={toggleFavorite} onClick={onServiceClick} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Legal Notice & Drafts Carousel */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      ⚖️ Legal & Tax Filing / कानूनी व टैक्स
                    </h3>
                    <button onClick={() => setActiveCategory('Legal')} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold">
                      View All →
                    </button>
                  </div>
                  <div className="flex items-center gap-4 overflow-x-auto scrollbar-none snap-x py-1">
                    {ALL_SERVICES_DATA.filter(s => s.categories.includes('Legal')).map(s => (
                      <div key={s.id} className="w-[185px] shrink-0 snap-start">
                        <ServiceCard service={s} favorites={favorites} onToggleFavorite={toggleFavorite} onClick={onServiceClick} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Recently Used */}
                <div>
                  <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Clock size={10} className="text-amber-500" />
                    Continue Working / हाल की फ़ाइलें
                  </h3>
                  {recentDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentDocs.slice(0, 4).map((doc, idx) => (
                        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:border-indigo-500/20 transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={16} className="text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-200 truncate">{doc.title || doc.type || 'Draft'}</h4>
                              <p className="text-[9px] text-gray-500 truncate">{doc.date || 'Recently created'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded">80% Progress</span>
                            <button
                              onClick={() => {
                                onServiceClick({ id: 'resume_builder', title: doc.title, workspace: 'Document' });
                              }}
                              className="text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded transition-colors"
                            >
                              Resume
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5 text-gray-600 text-xs">
                      No document history found / कोई हाल की फ़ाइल नहीं
                    </div>
                  )}
                </div>
              </>
            )}

            {/* activeCategory is NOT All -> Filtered Grid View */}
            {activeCategory !== 'All' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
                    Category: {activeCategory}
                  </h3>
                  <button onClick={() => setActiveCategory('All')} className="text-[10px] text-gray-500 hover:text-white">
                    ✕ Clear Filters
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredServices.map(s => (
                    <ServiceCard key={s.id} service={s} favorites={favorites} onToggleFavorite={toggleFavorite} onClick={onServiceClick} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Statistics Banner */}
        <div className="border-t border-white/5 pt-6 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {[
              { stat: '40+ AI Agents', desc: 'Expert drafts' },
              { stat: '100+ Templates', desc: 'Zero placeholders' },
              { stat: '30+ Tools', desc: 'Converters & maps' },
              { stat: 'Hindi + English', desc: 'Bilingual translation' },
              { stat: 'Voice Enabled', desc: 'Speech typing' },
              { stat: 'WhatsApp Ready', desc: 'Direct share' }
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 animate-pulse-subtle">
                <p className="text-xs font-bold text-indigo-400">{st.stat}</p>
                <p className="text-[9px] text-gray-500">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-auto pt-4 border-t border-gray-800 shrink-0">
        <AdSenseWidget slot="0987654321" format="fluid" />
      </div>
    </div>
  );
}

// Reusable Compact Service Card
function ServiceCard({ service, favorites, onToggleFavorite, onClick }) {
  const isFav = favorites.includes(service.id);
  return (
    <div
      onClick={() => onClick(service)}
      className="group h-[135px] p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all flex flex-col justify-between cursor-pointer relative"
    >
      <button
        type="button"
        onClick={(e) => onToggleFavorite(e, service.id)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors z-10 p-1"
      >
        <Heart size={12} className={`${isFav ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-400'}`} />
      </button>
      <div>
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
          <service.icon size={14} className="text-indigo-400" />
        </div>
        <h4 className="text-xs font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors truncate pr-4">
          {service.title}
        </h4>
        <p className="text-[9px] text-gray-500 truncate">{service.titleHi}</p>
        <p className="text-[9px] text-gray-400 line-clamp-1 mt-1 leading-snug">{service.desc}</p>
      </div>
      <div className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5 mt-auto">
        Launch <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
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
function RightChatPanel({ messages, setMessages, onSend, isConnected, user, jobs = [], onPreviewFile }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [mode, setMode] = useState('chat')
  const [isRecording, setIsRecording] = useState(false)
  const [scriptContent, setScriptContent] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imgInputRef = useRef(null)

  const loadChatHistory = async () => {
    try {
      const res = await api.get('/auth/chat/history')
      if (res.data && res.data.success) {
        const historyMsgs = res.data.data.map(m => ({
          id: m.id || (Date.now() + Math.random()),
          type: m.type,
          message: m.message,
          timestamp: m.timestamp || new Date().toISOString(),
          skill: m.skill,
          success: m.success
        }))
        if (historyMsgs.length === 0) {
          alert('कोई पुरानी चैट हिस्ट्री नहीं मिली।')
          return
        }
        setMessages(historyMsgs)
        alert(`✅ ${historyMsgs.length} पुरानी चैट संदेश लोड किए गए!`)
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
      alert('चैट हिस्ट्री लोड करने में विफल: ' + (err.response?.data?.error || err.message))
    }
  }

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

      // 🔀 Navigate action — skill wants to open a page (e.g. TADA Naksha form or WhatsApp Web)
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
  const handleFileUpload = (e) => { 
    const f = e.target.files?.[0]; 
    if (f) { 
      if (onPreviewFile) {
        onPreviewFile({ url: URL.createObjectURL(f), name: f.name, type: f.type || 'application/octet-stream' });
      }
      onSend(`[File: ${f.name}]`); 
      setIsThinking(true);
    } 
  }
  const handleImageUpload = async (e) => { 
    const f = e.target.files?.[0]; 
    if (f) { 
      if (onPreviewFile) {
        onPreviewFile({ url: URL.createObjectURL(f), name: f.name, type: f.type || 'image/jpeg' });
      }
      setIsThinking(true);
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', message: `[Uploading Image: ${f.name}]...` }]);
      const formData = new FormData();
      formData.append('file', f);
      try {
        const res = await api.post('/ocr/process', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.success && res.data.text) {
          onSend(`[Image Uploaded: ${f.name}]\n\nOCR Extracted Text:\n"""\n${res.data.text}\n"""\n\nIs application/document ko padhein aur iske aadhar par process karein ya form/draft tayyar karein.`);
        } else {
          onSend(`[Image: ${f.name}]`);
        }
      } catch (err) {
        console.error('OCR failed:', err);
        onSend(`[Image: ${f.name}] (OCR Failed)`);
      }
    } 
  }
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
          <div className="flex items-center gap-2">
            {setMessages && (
              <button type="button" onClick={loadChatHistory} className="text-[9px] bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 text-amber-400 px-2 py-0.5 rounded transition-all flex items-center gap-1 font-bold">
                📜 Load History
              </button>
            )}
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
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
                  {msg.type !== 'user' && msg.message && msg.message.length > 60 && (
                    <button
                      type="button"
                      onClick={() => onPreviewFile?.({
                        name: msg.skill ? `Response: ${msg.skill}` : 'AI Response Summary',
                        type: 'text/markdown',
                        content: msg.message,
                        url: '#'
                      })}
                      className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300 transition-colors font-semibold border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-2 py-1 rounded"
                    >
                      <Monitor size={10} /> Open in Center / सेंटर में खोलें
                    </button>
                  )}
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

// ============ FILE VIEWER PANEL ============
function FileViewerPanel({ file, onClose }) {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  const isPDF = file.type === 'application/pdf'
  const isText = file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'text/markdown'
  
  return (
    <div className="h-full flex flex-col bg-[#020617] animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f111a] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{file.name}</h2>
            <p className="text-[10px] text-gray-500 uppercase truncate">{file.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors shrink-0">
          <X size={16} className="text-gray-400 hover:text-red-400" />
        </button>
      </div>
      <div className="flex-1 bg-black/40 overflow-y-auto relative p-4 sm:p-6">
        {isImage && (
          <div className="w-full h-full flex items-center justify-center">
            <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
        )}
        {isVideo && (
          <div className="w-full h-full flex items-center justify-center">
            <video src={file.url} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
          </div>
        )}
        {isPDF && (
          <iframe src={file.url} className="w-full h-full rounded-lg bg-white" title={file.name} />
        )}
        {isText && (
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto text-sm text-gray-300 leading-relaxed whitespace-pre-wrap select-text">
            {file.content}
          </div>
        )}
        {!isImage && !isVideo && !isPDF && !isText && (
          <div className="text-center bg-white/5 p-8 rounded-2xl border border-white/10">
            <FileText size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-white font-medium mb-1">Preview not available</p>
            <p className="text-xs text-gray-500 mb-4">This file type cannot be previewed directly.</p>
            <a href={file.url} download={file.name} className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors inline-block">
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

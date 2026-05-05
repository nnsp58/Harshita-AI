import { motion } from 'framer-motion'
import {
  Search, FileText, Gavel, Train, Map, ShoppingBasket, LogIn, Bell,
  Play, Pause, RotateCcw, Camera, Edit3, MessageCircle, Wrench, Globe,
  CreditCard, Hash, Vote, Fingerprint, Baby, GraduationCap, Banknote, Bot, Zap
} from 'lucide-react'
import { useStore } from '../../store'
import { useNavigate } from 'react-router-dom'

const agentIcons = {
  JobSearchAgent: Search,
  DocumentAIAgent: FileText,
  LegalDraftAgent: Gavel,
  TicketBookingAgent: Train,
  LandRecordAgent: Map,
  RationCardAgent: ShoppingBasket,
  CSCLoginAgent: LogIn,
  NotifierAgent: Bell,
  OCRAgent: Camera,
  FormFillAgent: Edit3,
  WhatsAppAgent: MessageCircle,
  DocumentFixAgent: Wrench,
  BrowserAgent: Globe,
  PANCardAgent: CreditCard,
  PassportAgent: Hash,
  VoterIDAgent: Vote,
  AadhaarAgent: Fingerprint,
  BirthAgent: Baby,
  ScholarshipAgent: GraduationCap,
  BankAgent: Banknote,
}

const agentLabels = {
  JobSearchAgent: 'Job Search',
  DocumentAIAgent: 'Document AI',
  LegalDraftAgent: 'Legal Draft',
  TicketBookingAgent: 'Ticket Book',
  LandRecordAgent: 'Land Record',
  RationCardAgent: 'Ration Card',
  CSCLoginAgent: 'CSC Login',
  NotifierAgent: 'Notifier',
  OCRAgent: 'OCR Scan',
  FormFillAgent: 'Form Fill',
  WhatsAppAgent: 'WhatsApp',
  DocumentFixAgent: 'Doc Fix',
  BrowserAgent: 'Browser',
  PANCardAgent: 'PAN Card',
  PassportAgent: 'Passport',
  VoterIDAgent: 'Voter ID',
  AadhaarAgent: 'Aadhaar',
  BirthAgent: 'Birth Cert',
  ScholarshipAgent: 'Scholarship',
  BankAgent: 'Banking',
}

const agentGradients = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-violet-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-pink-500 to-fuchsia-500',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-green-500 to-lime-500',
  'from-yellow-500 to-amber-500',
  'from-sky-500 to-blue-500',
  'from-red-500 to-rose-500',
  'from-blue-600 to-indigo-500',
  'from-green-600 to-emerald-500',
  'from-purple-600 to-purple-400',
  'from-pink-600 to-pink-400',
  'from-amber-600 to-orange-400',
  'from-emerald-600 to-cyan-500',
]

const armPositions = [
  { angle: -90, agent: 'JobSearchAgent' },
  { angle: -72, agent: 'DocumentAIAgent' },
  { angle: -54, agent: 'LegalDraftAgent' },
  { angle: -36, agent: 'TicketBookingAgent' },
  { angle: -18, agent: 'LandRecordAgent' },
  { angle: 0, agent: 'RationCardAgent' },
  { angle: 18, agent: 'CSCLoginAgent' },
  { angle: 36, agent: 'NotifierAgent' },
  { angle: 54, agent: 'OCRAgent' },
  { angle: 72, agent: 'FormFillAgent' },
  { angle: 90, agent: 'WhatsAppAgent' },
  { angle: 108, agent: 'DocumentFixAgent' },
  { angle: 126, agent: 'BrowserAgent' },
  { angle: 144, agent: 'PANCardAgent' },
  { angle: 162, agent: 'PassportAgent' },
  { angle: 180, agent: 'VoterIDAgent' },
  { angle: -162, agent: 'AadhaarAgent' },
  { angle: -144, agent: 'BirthAgent' },
  { angle: -126, agent: 'ScholarshipAgent' },
  { angle: -108, agent: 'BankAgent' },
]

export default function RawanModel() {
  const { agents, selectedAgent, setSelectedAgent } = useStore()
  const navigate = useNavigate()

  const getAgentById = (agentName) => {
    const idMap = {
      'JobSearchAgent': 'ssc', 'BankingBot': 'banking', 'DocumentAIAgent': 'document',
      'TicketBookingAgent': 'ticket', 'RationCardAgent': 'ration', 'NotifierAgent': 'notification',
      'LegalDraftAgent': 'legal', 'RailwayBot': 'railway', 'PoliceBot': 'police',
      'DefenceBot': 'defence', 'ArmyBot': 'army', 'PostalBot': 'postal',
      'CSCLoginAgent': 'login', 'LandRecordAgent': 'land', 'OCRAgent': 'ocr',
      'FormFillAgent': 'form', 'WhatsAppAgent': 'whatsapp', 'BrowserAgent': 'browser',
      'PANCardAgent': 'pan', 'PassportAgent': 'passport', 'VoterIDAgent': 'voter',
      'AadhaarAgent': 'aadhaar', 'BirthAgent': 'birth', 'ScholarshipAgent': 'scholarship',
      'BankAgent': 'bank', 'DocumentFixAgent': 'docfix',
    }
    const id = idMap[agentName]
    return agents.find(a => a.id === id) || null
  }

  const handleAgentClick = (agentName) => {
    const agent = getAgentById(agentName)
    if (agent) {
      setSelectedAgent(agent)
      if (['ssc', 'railway', 'police', 'banking'].includes(agent.id)) navigate('/jobs')
      else if (agent.id === 'document') navigate('/documents')
      else navigate('/agents')
    } else {
      navigate('/agents')
    }
  }

  return (
    <div className="relative w-full flex items-center justify-center py-6">
      {/* Background glow effects */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-maroon-600/10 blur-3xl animate-pulse" />
        <div className="absolute w-48 h-48 rounded-full bg-gold-400/10 blur-2xl" style={{ animation: 'pulse 3s ease-in-out infinite reverse' }} />
      </div>

      {/* Orbital rings */}
      <svg className="absolute w-[520px] h-[520px] opacity-10 dark:opacity-20" viewBox="0 0 520 520">
        <circle cx="260" cy="260" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-maroon-500" />
        <circle cx="260" cy="260" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold-400" />
      </svg>

      {/* Main orbital layout */}
      <div className="relative w-[480px] h-[480px] flex-shrink-0">

        {/* CENTER: Modern AI Core (replacing the ugly circle) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            {/* Outer pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-maroon-500 to-gold-400 opacity-30"
            />
            {/* Inner core */}
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-navy-900 shadow-2xl border border-gray-100 dark:border-navy-700 flex flex-col items-center justify-center gap-1 z-10">
              <Zap size={28} className="text-maroon-600 dark:text-gold-400" />
              <span className="text-[10px] font-black tracking-widest text-gray-700 dark:text-gray-300">RAWAN</span>
              <span className="text-[8px] font-bold text-gray-400 tracking-widest">AI CORE</span>
            </div>

            {/* Rotating connection dots */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              {[0, 90, 180, 270].map(deg => (
                <div
                  key={deg}
                  className="absolute w-2 h-2 rounded-full bg-maroon-500"
                  style={{
                    top: '50%', left: '50%',
                    transform: `rotate(${deg}deg) translateX(52px) translate(-50%, -50%)`
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* 20 Agent Nodes around the core */}
        {armPositions.map((pos, idx) => {
          const IconComponent = agentIcons[pos.agent] || Bot
          const agent = getAgentById(pos.agent)
          const isActive = agent?.status === 'active' || agent?.status === 'busy'
          const isSelected = selectedAgent?.id === agent?.id
          const gradient = agentGradients[idx]
          const radius = 195
          const radian = (pos.angle * Math.PI) / 180
          const x = Math.cos(radian) * radius
          const y = Math.sin(radian) * radius

          return (
            <motion.div
              key={pos.agent}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 180 }}
              whileHover={{ scale: 1.2, zIndex: 50 }}
              className="absolute group cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              onClick={() => handleAgentClick(pos.agent)}
            >
              {/* Connector line to center */}
              <svg
                className="absolute pointer-events-none opacity-20"
                style={{
                  width: Math.abs(x) + 16,
                  height: Math.abs(y) + 16,
                  left: x >= 0 ? '-' + (Math.abs(x) - 8) + 'px' : '8px',
                  top: y >= 0 ? '-' + (Math.abs(y) - 8) + 'px' : '8px',
                }}
              />

              {/* Node */}
              <div
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-gold-400 ring-offset-1 ring-offset-transparent'
                    : ''
                } ${
                  isActive
                    ? `bg-gradient-to-br ${gradient} shadow-lg`
                    : 'bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600'
                }`}
              >
                <IconComponent
                  size={18}
                  className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}
                />
                {/* Active dot */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"
                  />
                )}
              </div>

              {/* Tooltip label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <span className="text-[9px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded shadow-lg">
                  {agentLabels[pos.agent]}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

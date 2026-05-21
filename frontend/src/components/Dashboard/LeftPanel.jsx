import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Landmark, FileText, Briefcase, Scale, Bot, MessageSquare, Brain,
  ChevronDown, ChevronRight, MapPin, CreditCard, ShieldCheck,
  ScanText, FolderOpen, Search, FileCheck, GraduationCap,
  Gavel, Calculator, FormInput, Ticket, Upload, Layout,
  Phone, StickyNote, MessageCircle, Globe, Wifi, CheckCircle, FileBarChart
} from 'lucide-react'
import { useStore } from '../../store'

const SKILL_CATEGORIES = [
  {
    name: 'Government Services',
    icon: Landmark,
    skills: [
      { id: 'land_record', displayName: 'Land Record', icon: MapPin },
      { id: 'ration_card', displayName: 'Ration Card', icon: CreditCard },
      { id: 'eligibility_check', displayName: 'Eligibility Check', icon: ShieldCheck },
    ],
  },
  {
    name: 'Documents',
    icon: FileText,
    skills: [
      { id: 'document_ocr', displayName: 'Document OCR', icon: ScanText },
      { id: 'file_processor', displayName: 'File Processor', icon: FolderOpen },
    ],
  },
  {
    name: 'Jobs & Career',
    icon: Briefcase,
    skills: [
      { id: 'job_search', displayName: 'Job Search', icon: Search },
      { id: 'resume_maker', displayName: 'Resume Builder', icon: FileCheck },
      { id: 'result_generator', displayName: 'Result Generator', icon: GraduationCap },
    ],
  },
  {
    name: 'Legal & Finance',
    icon: Scale,
    skills: [
      { id: 'legal_draft', displayName: 'Legal Draft', icon: Gavel },
      { id: 'tada_process', displayName: 'TA-DA Calculator', icon: Calculator },
    ],
  },
  {
    name: 'Automation',
    icon: Bot,
    skills: [
      { id: 'form_fill', displayName: 'Form Fill', icon: FormInput },
      { id: 'ticket_booking', displayName: 'Ticket Booking', icon: Ticket },
      { id: 'bulk_import', displayName: 'Bulk Import', icon: Upload },
      { id: 'ui_builder', displayName: 'UI Builder', icon: Layout },
    ],
  },
  {
    name: 'Communication',
    icon: MessageSquare,
    skills: [
      { id: 'whatsapp', displayName: 'WhatsApp', icon: Phone },
      { id: 'notepad', displayName: 'Notepad', icon: StickyNote },
      { id: 'general_chat', displayName: 'General Chat', icon: MessageCircle },
    ],
  },
  {
    name: 'Intelligence',
    icon: Brain,
    skills: [
      { id: 'web_learning', displayName: 'Web Learning', icon: Globe },
      { id: 'network_monitor', displayName: 'Network Monitor', icon: Wifi },
      { id: 'validator', displayName: 'Validator', icon: CheckCircle },
      { id: 'project_report', displayName: 'Project Report', icon: FileBarChart },
    ],
  },
]

function getSkillStatus(agents, skillId) {
  if (!agents || agents.length === 0) return 'idle'
  const agent = agents.find(
    (a) => a.id === skillId || a.name === skillId || (a.skills && a.skills.includes(skillId))
  )
  if (!agent) return 'idle'
  if (agent.status === 'running' || agent.status === 'active') return 'running'
  if (agent.status === 'busy') return 'busy'
  if (agent.status === 'error') return 'error'
  return 'idle'
}

const statusColors = {
  running: 'bg-green-400',
  busy: 'bg-yellow-400',
  error: 'bg-red-400',
  idle: 'bg-gray-500',
}

export default function LeftPanel({ onSkillClick }) {
  const { agents, fetchAgents } = useStore()
  const [expandedCategories, setExpandedCategories] = useState(
    SKILL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
  )

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const toggleCategory = (name) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0b10] border-r border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills & Capabilities</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {SKILL_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon
          const isExpanded = expandedCategories[category.name]
          return (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
              >
                <CategoryIcon size={14} className="text-maroon-400" />
                <span className="text-xs font-medium text-gray-300 flex-1 text-left">{category.name}</span>
                {isExpanded ? (
                  <ChevronDown size={12} className="text-gray-500" />
                ) : (
                  <ChevronRight size={12} className="text-gray-500" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {category.skills.map((skill) => {
                      const SkillIcon = skill.icon
                      const status = getSkillStatus(agents, skill.id)
                      return (
                        <button
                          key={skill.id}
                          onClick={() => onSkillClick && onSkillClick(skill)}
                          className="w-full flex items-center gap-2 px-3 pl-7 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
                        >
                          <SkillIcon size={13} className="text-gray-400 group-hover:text-maroon-400 transition-colors" />
                          <span className="text-xs text-gray-400 group-hover:text-gray-200 flex-1 text-left truncate">
                            {skill.displayName}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${statusColors[status]} shrink-0`} />
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

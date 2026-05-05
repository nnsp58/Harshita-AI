import { Search, FileText, Gavel, Train, Map, ShoppingBasket, LogIn, Bell, Power, Play, Pause, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../../store'

const iconMap = {
  JobSearchAgent: Search,
  DocumentAIAgent: FileText,
  LegalDraftAgent: Gavel,
  TicketBookingAgent: Train,
  LandRecordAgent: Map,
  RationCardAgent: ShoppingBasket,
  CSCLoginAgent: LogIn,
  NotifierAgent: Bell,
}

const statusColors = {
  active: 'bg-emerald-500',
  idle: 'bg-gray-400',
  busy: 'bg-amber-500',
  error: 'bg-rose-500',
}

export default function AgentCard({ agent, index = 0, onClick }) {
  const { startAgent, stopAgent, restartAgent } = useStore()
  const IconComponent = iconMap[agent.id] || Search

  const handleControl = (e, action) => {
    e.stopPropagation()
    if (action === 'start') startAgent(agent.id)
    else if (action === 'stop') stopAgent(agent.id)
    else if (action === 'restart') restartAgent(agent.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`card card-hover p-4 cursor-pointer group relative ${
        agent.status === 'active' ? 'border-emerald-200 dark:border-emerald-800' :
        agent.status === 'busy' ? 'border-amber-200 dark:border-amber-800' :
        agent.status === 'error' ? 'border-rose-200 dark:border-rose-800' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              agent.status === 'active'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : agent.status === 'busy'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : agent.status === 'error'
                ? 'bg-gradient-to-br from-rose-500 to-red-600'
                : 'bg-gray-200 dark:bg-navy-700'
            }`}
          >
            <IconComponent
              size={24}
              className={['active', 'busy'].includes(agent.status) ? 'text-white' : 'text-gray-600 dark:text-gray-300'}
            />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
              {agent.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`badge ${agent.status === 'active' ? 'badge-success' : agent.status === 'busy' ? 'badge-warning' : agent.status === 'error' ? 'badge-error' : 'badge-info'}`}>
            {agent.status === 'active' ? '● Active' : agent.status === 'busy' ? '● Busy' : agent.status === 'error' ? '● Error' : '● Idle'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{agent.jobsCompleted?.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Jobs Done</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{agent.avgResponseTime}s</p>
          <p className="text-xs text-gray-500">Avg Time</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
          <p className="text-lg font-bold text-maroon-600 dark:text-maroon-400">${((agent.costPerRun || 0) * 1000).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Cost/1K</p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => handleControl(e, 'start')}
          disabled={agent.status === 'active'}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Start"
        >
          <Play size={16} />
        </button>
        <button
          onClick={(e) => handleControl(e, 'stop')}
          disabled={agent.status !== 'active' && agent.status !== 'busy'}
          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Stop"
        >
          <Pause size={16} />
        </button>
        <button
          onClick={(e) => handleControl(e, 'restart')}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          title="Restart"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Click indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold-400/50 rounded-xl pointer-events-none" />
    </motion.div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Search, FileText, Gavel, Train, Map, ShoppingBasket, LogIn, Bell,
  Play, Pause, RotateCcw, Power, ShoppingCart, Download, Upload, Star
} from 'lucide-react'
import { useStore } from '../store'
import AgentCard from '../components/Agent/AgentCard'

// Available marketplace agents (future)
const availableMarketplaceAgents = [
  {
    id: ' ImmigrationAgent',
    name: 'Immigration Assistant',
    description: 'Help with passport, visa applications',
    icon: 'passport',
    price: '$9.99/mo',
    rating: 4.8,
    installed: false,
  },
  {
    id: 'TaxFilingAgent',
    name: 'Tax Filing Helper',
    description: 'Automate ITR, GST filings',
    icon: 'file-tax',
    price: '$14.99/mo',
    rating: 4.9,
    installed: false,
  },
  {
    id: ' ScholarshipAgent',
    name: 'Scholarship Finder',
    description: 'Find and apply for scholarships',
    icon: 'award',
    price: '$4.99/mo',
    rating: 4.7,
    installed: false,
  },
]

export default function Agents() {
  const { agents, startAgent, stopAgent, restartAgent, selectedAgent, setSelectedAgent, marketplaceVisible, toggleMarketplace } = useStore()
  const [filter, setFilter] = useState('all') // all, active, idle, error

  const filteredAgents = agents.filter(a => {
    if (filter === 'all') return true
    if (filter === 'active') return a.status === 'active' || a.status === 'busy'
    return a.status === filter
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Agent Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor and control your 20-armed workforce
          </p>
        </div>
        <button
          onClick={toggleMarketplace}
          className="btn-primary flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          Marketplace
          {availableMarketplaceAgents.some(a => a.installed) && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {availableMarketplaceAgents.filter(a => a.installed).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'idle', 'busy', 'error'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-maroon-600 text-white'
                : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {agents.filter(a => a.status === (f === 'active' ? 'active' : f)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAgents.map((agent, idx) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={idx}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}
      </div>

      {/* Marketplace Modal */}
      <AnimatePresence>
        {marketplaceVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={toggleMarketplace}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                    <ShoppingCart className="text-gold-500" size={24} />
                    Agent Marketplace
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Install new AI agents to expand capabilities
                  </p>
                </div>
                <button
                  onClick={toggleMarketplace}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg"
                >
                  ×
                </button>
              </div>

              {/* Marketplace Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableMarketplaceAgents.map((agent, idx) => {
                    const IconComponent = iconMap[agent.id] || Bot
                    return (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`card p-5 relative ${
                          agent.installed ? 'border-emerald-300' : ''
                        }`}
                      >
                        {agent.installed && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                            <Download size={12} /> Installed
                          </span>
                        )}
                        <div className="w-12 h-12 bg-gradient-to-br from-maroon-500 to-maroon-700 rounded-xl flex items-center justify-center mb-3">
                          <IconComponent size={24} className="text-white" />
                        </div>
                        <h3 className="font-heading font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>

                        <div className="flex items-center gap-2 mt-3 text-xs">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star size={12} fill="currentColor" />
                            {agent.rating}
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-maroon-600">{agent.price}</span>
                        </div>

                        <button
                          disabled={agent.installed}
                          className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all ${
                            agent.installed
                              ? 'bg-emerald-100 text-emerald-700 cursor-default'
                              : 'btn-primary'
                          }`}
                        >
                          {agent.installed ? 'Installed ✓' : 'Install Agent'}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Coming Soon section */}
                <div className="mt-8 p-6 border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-2xl text-center">
                  <h3 className="font-heading font-semibold text-lg mb-2">More Agents Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    We're adding new agents for banking, healthcare, education, and more. Request an agent or suggest features!
                  </p>
                  <button className="btn-secondary mt-4">Suggest New Agent</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Agent Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-maroon-500 to-maroon-700 rounded-2xl flex items-center justify-center">
                  {(() => {
                    const Icon = iconMap[selectedAgent.id] || Bot
                    return <Icon size={32} className="text-white" />
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold">{selectedAgent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedAgent.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startAgent(selectedAgent.id)}
                  disabled={selectedAgent.status === 'active'}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Play size={16} /> Start
                </button>
                <button
                  onClick={() => stopAgent(selectedAgent.id)}
                  disabled={selectedAgent.status !== 'active' && selectedAgent.status !== 'busy'}
                  className="btn-ghost flex items-center gap-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  <Pause size={16} /> Stop
                </button>
                <button
                  onClick={() => restartAgent(selectedAgent.id)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Restart
                </button>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Agent stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-xl">
                <p className="text-sm text-gray-500">Jobs Completed</p>
                <p className="text-2xl font-bold">{selectedAgent.jobsCompleted?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-xl">
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}s</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-xl">
                <p className="text-sm text-gray-500">Cost per 1K runs</p>
                <p className="text-2xl font-bold text-maroon-600">${(selectedAgent.costPerRun * 1000).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-xl">
                <p className="text-sm text-gray-500">Uptime (Last 24h)</p>
                <p className="text-2xl font-bold text-emerald-600">99.9%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

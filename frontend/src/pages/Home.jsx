import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, Users, FileText, Search,
  Activity, Bot, FileCheck, CheckCircle,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import { useStore } from '../store'
import StatsCard from '../components/Common/StatsCard'
import QuickActionCard from '../components/Common/QuickActionCard'
import ActivityTimeline from '../components/Common/ActivityTimeline'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getAgentStatusColor(status) {
  switch (status) {
    case 'active':
    case 'running':
      return 'bg-emerald-500'
    case 'busy':
    case 'processing':
      return 'bg-amber-500'
    case 'error':
    case 'failed':
      return 'bg-rose-500'
    default:
      return 'bg-gray-400'
  }
}

export default function Home() {
  const { stats, agents, jobs, user, initialize } = useStore()
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const recentJobs = jobs.slice(0, 5)
  const userName = user?.name || user?.username || 'there'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate()} &mdash; {stats.activeJobs || 0} active job{stats.activeJobs !== 1 ? 's' : ''}, {stats.agentsOnline || 0} agent{stats.agentsOnline !== 1 ? 's' : ''} online, {stats.successRate || 0}% success rate
        </p>
      </motion.div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={UploadCloud}
            title="New Bulk Import"
            description="Upload candidate data for batch processing"
            linkTo="/bulk-import"
            color="maroon"
          />
          <QuickActionCard
            icon={Users}
            title="Manage Candidates"
            description="View, add, or verify your candidates"
            linkTo="/candidates"
            color="blue"
          />
          <QuickActionCard
            icon={FileText}
            title="View Documents"
            description="Track documents and their processing status"
            linkTo="/documents"
            color="gold"
          />
          <QuickActionCard
            icon={Search}
            title="Search Jobs"
            description="Browse and monitor all automation jobs"
            linkTo="/jobs"
            color="emerald"
          />
        </div>
      </section>

      {/* Stats Row */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs || 0}
            icon={Activity}
            color="blue"
            subtitle={`${stats.todayJobs || 0} today`}
          />
          <StatsCard
            title="Documents Pending"
            value={stats.pendingDocuments || 0}
            icon={FileCheck}
            color="gold"
            subtitle="Awaiting processing"
          />
          <StatsCard
            title="Agents Online"
            value={stats.agentsOnline || 0}
            icon={Bot}
            color="emerald"
            subtitle={`${agents.length} total agents`}
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.successRate || 0}%`}
            icon={CheckCircle}
            color="maroon"
            subtitle="Overall accuracy"
          />
        </div>
      </section>

      {/* Activity Timeline and Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <ActivityTimeline activities={recentJobs} />
        </div>

        {/* Agent Status */}
        <div className="card p-6">
          <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">Agent Status</h2>
          {agents.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-navy-800 rounded-full border border-gray-100 dark:border-navy-700"
                >
                  <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                    {agent.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Bot size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No agents connected</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Section - Collapsible */}
      {isAdmin && (
        <section className="card overflow-hidden">
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-maroon-50 dark:bg-maroon-950/30 flex items-center justify-center">
                <Shield size={16} className="text-maroon-600 dark:text-maroon-400" />
              </div>
              <div>
                <h2 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Admin Insights</h2>
                <p className="text-xs text-gray-500">Infrastructure health and platform overview</p>
              </div>
            </div>
            {adminOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {adminOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-gray-100 dark:border-navy-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
                    {/* Infrastructure Health */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Infrastructure Health</h3>
                      <div className="space-y-2">
                        {agents.slice(0, 6).map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-800 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{agent.name}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-gray-400">{agent.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Owner Insights */}
                    <div className="p-5 bg-gradient-to-br from-maroon-900 to-navy-950 rounded-2xl text-white">
                      <h3 className="text-sm font-bold text-gold-400 mb-3">Owner Insights</h3>
                      <p className="text-xs text-gray-400 mb-4">Platform optimized for CSC VLE automation.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] text-gray-500">Revenue</p>
                          <p className="text-lg font-bold">{`\u20B9${stats.revenue || 0}`}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] text-gray-500">Today Jobs</p>
                          <p className="text-lg font-bold">{stats.todayJobs || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  )
}

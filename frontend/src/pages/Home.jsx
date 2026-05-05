import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Activity, DollarSign, Bot, UploadCloud, 
  FileCheck, ShieldCheck, ChevronRight, Zap, Target,
  Star, Clock, Archive, UserCheck
} from 'lucide-react'
import { useStore } from '../store'

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card p-6 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16 bg-${color}-500`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-heading font-black mt-2">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950 text-${color}-600`}>
        <Icon size={28} />
      </div>
    </div>
  </motion.div>
)

export default function Home() {
  const { stats, agents, jobs, candidates, operators, user, initialize } = useStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Admin Header */}
      <div>
        <h1 className="text-3xl font-heading font-black text-gray-900 dark:text-white">Admin Command Center</h1>
        <p className="text-gray-500">Global Overview of Rawan SaaS Platform Infrastructure</p>
      </div>

      {/* Global Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total VLE Users" value={candidates.length || 1} icon={Users} color="blue" subtitle="Across registered centers" />
        <StatsCard title="Global Revenue" value={`₹${stats.revenue || 0}`} icon={DollarSign} color="gold" subtitle="System-wide earnings" />
        <StatsCard title="Core Agents" value={agents.length} icon={Bot} color="emerald" subtitle="All systems operational" />
        <StatsCard title="Success Rate" value={`${stats.successRate || 92}%`} icon={Activity} color="purple" subtitle="Global automation accuracy" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Infrastructure Health</h2>
          <div className="space-y-4">
             {agents.slice(0, 6).map(agent => (
               <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-800 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                   <span className="font-medium">{agent.name}</span>
                 </div>
                 <span className="text-[10px] font-bold uppercase text-gray-400">{agent.status}</span>
               </div>
             ))}
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-maroon-900 to-navy-950 text-white border-0">
          <h2 className="text-xl font-heading font-bold mb-4 text-gold-400">Owner Insights</h2>
          <p className="text-sm text-gray-400 mb-6">Your platform is currently optimized for CSC VLE automation. Current bottlenecks: CAPTCHA (Manual).</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
               <p className="text-xs text-gray-500">Server Load</p>
               <p className="text-xl font-bold">12%</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
               <p className="text-xs text-gray-500">Active Queues</p>
               <p className="text-xl font-bold">24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderVLEDashboard = () => (
    <div className="space-y-8">
      {/* VLE Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-gray-900 dark:text-white">Business Dashboard</h1>
          <p className="text-gray-500">Manage your CSC Operators and Automation Workflow</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Archive size={18} /> Export History
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-maroon-500/20 shadow-lg">
            <UploadCloud size={18} /> New Bulk Task
          </button>
        </div>
      </div>

      {/* Operational Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="My Total Tasks" value={jobs.length} icon={Target} color="blue" subtitle="Local work history" />
        <StatsCard title="Staff Performance" value={`${stats.successRate || 0}%`} icon={Star} color="amber" subtitle="Operator success average" />
        <StatsCard title="Live Ops" value={jobs.filter(j => j.status === 'processing').length} icon={Activity} color="emerald" subtitle="Active forms filling" />
        <StatsCard title="Total VLE Revenue" value={`₹${stats.revenue || 0}`} icon={DollarSign} color="gold" subtitle="Earnings via automation" />
      </section>

      {/* Operators & History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent History */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Clock className="text-maroon-600" size={24} /> Recent Work History
            </h2>
            <button className="text-sm font-bold text-maroon-600 hover:underline">View All History</button>
          </div>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-800/50 rounded-2xl border border-gray-100 dark:border-navy-700">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    job.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{job.type || 'Sarkari Job'}</p>
                    <p className="text-xs text-gray-500">Candidate: {job.candidate} • {job.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-xs font-black uppercase tracking-widest ${job.status === 'completed' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {job.status}
                   </p>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Archive size={48} className="mx-auto mb-4 opacity-20" />
                <p>Your work history is empty. Start a bulk task.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Operator Performance */}
        <div className="card p-6 border-gold-200/50">
          <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
            <UserCheck className="text-gold-500" size={24} /> Staff Performance
          </h2>
          <div className="space-y-6">
            {operators.map((op) => (
              <div key={op.id} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center font-bold text-navy-600 text-xs">
                      {op.name.charAt(0)}
                    </div>
                    <p className="text-sm font-bold group-hover:text-maroon-600 transition-colors">{op.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{op.jobs} Jobs</p>
                </div>
                <div className="w-full bg-gray-100 dark:bg-navy-900 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (op.jobs / 50) * 100)}%` }}
                    className="bg-maroon-600 h-full rounded-full" 
                  />
                </div>
              </div>
            ))}
            {operators.length === 0 && (
               <div className="text-center py-6">
                 <p className="text-xs text-gray-500 mb-4">No operators added yet.</p>
                 <button className="btn-secondary text-xs w-full">Manage Staff in Settings</button>
               </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-maroon-50 dark:bg-maroon-950/30 rounded-2xl border border-maroon-100 dark:border-maroon-900">
             <p className="text-xs font-bold text-maroon-700 dark:text-maroon-400">VLE Pro Tip:</p>
             <p className="text-[11px] text-maroon-600/70 dark:text-maroon-500 mt-1">
               Give your top operator a bonus for 100% success rate this week.
             </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {user?.role === 'admin' ? renderAdminDashboard() : renderVLEDashboard()}
    </div>
  )
}

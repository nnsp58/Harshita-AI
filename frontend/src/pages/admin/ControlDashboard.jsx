import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Activity, Users, Briefcase, Brain, MessageSquare, TrendingUp, AlertTriangle, RefreshCw, Zap } from 'lucide-react'
import api from '../../services/api'

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-[10px] text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default function ControlDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/control/overview')
      setData(res.data?.data || null)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const triggerUpgrade = async () => {
    if (!confirm('Manual upgrade trigger karein? System ~5 sec maintenance mode mein jayega.')) return
    setUpgrading(true)
    try {
      await api.post('/learning/upgrade-now')
      alert('Upgrade triggered!')
      setTimeout(load, 3000)
    } catch (e) { alert('Failed: ' + e.message) }
    setUpgrading(false)
  }

  if (loading) return <AdminLayout title="System Overview"><div className="text-gray-500">Loading...</div></AdminLayout>
  if (!data) return <AdminLayout title="System Overview"><div className="text-red-400">Failed to load</div></AdminLayout>

  return (
    <AdminLayout title="System Overview / सिस्टम अवलोकन">
      <div className="space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={data.users?.total || 0} icon={Users} color="bg-blue-500/30" sub="VLEs + operators + admins" />
          <StatCard title="Total Jobs" value={data.jobs?.total || 0} icon={Briefcase} color="bg-emerald-500/30" sub={`${data.jobs?.completed || 0} completed`} />
          <StatCard title="Conversations" value={data.conversations?.totalSessions || 0} icon={MessageSquare} color="bg-purple-500/30" sub={`${data.conversations?.totalMessages || 0} msgs total`} />
          <StatCard title="Success Rate" value={`${data.learning?.successRate || 0}%`} icon={TrendingUp} color="bg-amber-500/30" sub={`${data.learning?.totalInteractions || 0} interactions`} />
        </div>

        {/* Learning insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><Brain size={16} className="text-amber-400"/> AI Learning Insights</h3>
              <button onClick={triggerUpgrade} disabled={upgrading}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-black rounded-lg text-[10px] font-bold disabled:opacity-30 hover:bg-amber-400">
                <RefreshCw size={11} className={upgrading ? 'animate-spin' : ''}/> {upgrading ? 'Upgrading...' : 'Run Upgrade Now'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] text-gray-500">Skills Learning</p>
                <p className="text-lg font-bold">{data.learning?.skillsLearned || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] text-gray-500">Patterns Found</p>
                <p className="text-lg font-bold">{data.learning?.patternsDiscovered || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] text-gray-500">Failures Tracked</p>
                <p className="text-lg font-bold text-amber-400">{data.learning?.totalFailures || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] text-gray-500">Feedbacks</p>
                <p className="text-lg font-bold">{data.learning?.totalFeedback || 0}</p>
              </div>
            </div>

            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Top Skills Used</h4>
            <div className="space-y-1.5">
              {(data.learning?.topSkills || []).slice(0, 8).map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-1.5 text-xs">
                  <span className="text-gray-300">{s.skill}</span>
                  <span className="text-amber-400 font-bold">{s.count}</span>
                </div>
              ))}
              {(!data.learning?.topSkills || data.learning.topSkills.length === 0) && (
                <p className="text-xs text-gray-500 italic">No usage data yet</p>
              )}
            </div>
          </div>

          {/* System info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Activity size={16} className="text-emerald-400"/> System Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Uptime</span><span className="text-emerald-400">{Math.floor((data.uptime || 0) / 60)} min</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Jobs</span><span>{data.jobs?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="text-emerald-400">{data.jobs?.completed || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Failed</span><span className="text-red-400">{data.jobs?.failed || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Candidates</span><span>{data.candidates?.total || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active Users</span><span>{data.conversations?.uniqueUsers || 0}</span></div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600">Last updated: {new Date(data.timestamp).toLocaleString('hi-IN')}</p>
      </div>
    </AdminLayout>
  )
}

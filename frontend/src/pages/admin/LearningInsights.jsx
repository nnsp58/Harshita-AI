import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Brain, AlertTriangle, MessageSquare, Calendar } from 'lucide-react'
import api from '../../services/api'

export default function LearningInsights() {
  const [stats, setStats] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/learning/stats'),
      api.get('/learning/schedule'),
    ])
      .then(([s, sc]) => {
        setStats(s.data?.data || null)
        setSchedule(sc.data?.data || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout title="AI Learning"><div className="text-gray-500">Loading...</div></AdminLayout>

  const lastUpgrade = stats?.lastUpgrade

  return (
    <AdminLayout title="AI Learning Insights / सीखने की जानकारी">
      <div className="space-y-6">
        {/* Schedule */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-amber-300">
            <Calendar size={16}/> Upgrade Schedule / अपग्रेड समय
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><p className="text-[9px] text-gray-500">Mode</p><p className="font-bold uppercase">{schedule?.mode || 'N/A'}</p></div>
            <div><p className="text-[9px] text-gray-500">Window</p><p className="font-bold">{schedule?.windowStart} - {schedule?.windowEnd}</p></div>
            <div><p className="text-[9px] text-gray-500">Next Run In</p><p className="font-bold text-amber-400">{schedule?.minutesUntilUpgrade || 0} min</p></div>
            <div><p className="text-[9px] text-gray-500">Status</p>
              <p className={`font-bold ${schedule?.isInMaintenance ? 'text-red-400' : 'text-emerald-400'}`}>
                {schedule?.isInMaintenance ? '🔧 Upgrading' : '✓ Idle'}
              </p>
            </div>
          </div>
        </div>

        {/* Last upgrade report */}
        {lastUpgrade && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold mb-3">Last Upgrade Report</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-xs">
              <div><p className="text-[9px] text-gray-500">Started</p><p>{new Date(lastUpgrade.startedAt).toLocaleString('hi-IN')}</p></div>
              <div><p className="text-[9px] text-gray-500">Duration</p><p>{lastUpgrade.durationMs ? (lastUpgrade.durationMs/1000).toFixed(1) + 's' : 'N/A'}</p></div>
              <div><p className="text-[9px] text-gray-500">Status</p>
                <p className={lastUpgrade.success ? 'text-emerald-400' : 'text-red-400'}>{lastUpgrade.success ? '✓ Success' : '✗ Failed'}</p>
              </div>
            </div>
            <div className="space-y-1">
              {(lastUpgrade.tasks || []).map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-1.5 text-[10px]">
                  <span className={t.success ? 'text-emerald-400' : 'text-red-400'}>
                    {t.success ? '✓' : '✗'} {t.name}
                  </span>
                  <span className="text-gray-500">{t.durationMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Brain size={16} className="text-purple-400"/> Learning Engine</h3>
            <pre className="text-[10px] text-gray-400 whitespace-pre-wrap">{JSON.stringify(stats?.learning, null, 2)}</pre>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><MessageSquare size={16} className="text-blue-400"/> Conversations</h3>
            <pre className="text-[10px] text-gray-400 whitespace-pre-wrap">{JSON.stringify(stats?.conversations, null, 2)}</pre>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

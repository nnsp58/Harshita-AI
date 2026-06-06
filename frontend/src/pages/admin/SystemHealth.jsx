import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Server, Cpu, HardDrive } from 'lucide-react'
import api from '../../services/api'

export default function SystemHealth() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => api.get('/admin/control/health')
      .then(r => setData(r.data?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false))
    load()
    const t = setInterval(load, 10000) // refresh every 10s
    return () => clearInterval(t)
  }, [])

  if (loading) return <AdminLayout title="System Health"><div className="text-gray-500">Loading...</div></AdminLayout>
  if (!data) return <AdminLayout title="System Health"><div className="text-red-400">Failed to load</div></AdminLayout>

  const memUsed = data.memory?.heapUsed || 0
  const memTotal = data.memory?.heapTotal || 1
  const memPct = ((memUsed / memTotal) * 100).toFixed(0)

  return (
    <AdminLayout title="System Health / सिस्टम स्वास्थ्य">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold flex items-center gap-2"><Server size={14} className="text-emerald-400"/> Server Uptime</h3>
            </div>
            <p className="text-2xl font-bold">{Math.floor(data.uptime / 60)} <span className="text-xs text-gray-500">min</span></p>
            <p className="text-[10px] text-gray-500">{Math.floor(data.uptime / 3600)}h {Math.floor((data.uptime % 3600) / 60)}m</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold flex items-center gap-2"><HardDrive size={14} className="text-blue-400"/> Memory</h3>
              <span className={`text-[9px] font-bold ${memPct > 80 ? 'text-red-400' : memPct > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>{memPct}%</span>
            </div>
            <p className="text-2xl font-bold">{memUsed} <span className="text-xs text-gray-500">MB</span></p>
            <div className="w-full h-1.5 bg-white/5 rounded mt-2 overflow-hidden">
              <div className={`h-full ${memPct > 80 ? 'bg-red-500' : memPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${memPct}%` }}/>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">RSS: {data.memory?.rss} MB</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold flex items-center gap-2"><Cpu size={14} className="text-amber-400"/> Skills Loaded</h3>
            </div>
            <p className="text-2xl font-bold">{data.skillsLoaded}</p>
            <p className="text-[10px] text-gray-500">Active AI skills</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold mb-3">Nightly Upgrade</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Mode</span><span className="font-bold uppercase">{data.nightlyUpgrade?.mode}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Window</span><span>{data.nightlyUpgrade?.windowStart} - {data.nightlyUpgrade?.windowEnd}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Notify Before</span><span>{data.nightlyUpgrade?.notifyMinutesBefore} min</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Final Warning</span><span>{data.nightlyUpgrade?.finalWarningMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={data.nightlyUpgrade?.isInMaintenance ? 'text-red-400' : 'text-emerald-400'}>
                  {data.nightlyUpgrade?.isInMaintenance ? 'Maintenance' : 'Idle'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold mb-3">Network</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={data.network?.isOnline ? 'text-emerald-400' : 'text-red-400'}>
                  {data.network?.isOnline ? '● Online' : '● Offline'}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Latency</span><span>{data.network?.latency || '—'} ms</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Node Version</span><span>{data.node}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Platform</span><span>{data.platform}</span></div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 text-center">Auto-refreshing every 10 seconds</p>
      </div>
    </AdminLayout>
  )
}

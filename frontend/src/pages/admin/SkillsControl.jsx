import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Zap, Wifi, WifiOff } from 'lucide-react'
import api from '../../services/api'

export default function SkillsControl() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/control/skills')
      .then(r => setSkills(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Skills Control / स्किल्स नियंत्रण">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-8">Loading...</div>
        ) : skills.map(s => (
          <div key={s.name} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">{s.displayName}</h3>
                <p className="text-[10px] text-gray-500">{s.name} <span className="text-gray-600">v{s.version}</span></p>
              </div>
              {s.canRunOffline ? <WifiOff size={14} className="text-emerald-400" title="Offline capable"/> : <Wifi size={14} className="text-blue-400" title="Online required"/>}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
              <div className="bg-white/5 rounded px-2 py-1.5">
                <p className="text-gray-500">Intents</p>
                <p className="text-sm font-bold">{s.intents}</p>
              </div>
              <div className="bg-white/5 rounded px-2 py-1.5">
                <p className="text-gray-500">Keywords</p>
                <p className="text-sm font-bold">{s.keywords} <span className="text-emerald-400 text-[9px]">+{s.learnedKeywords}</span></p>
              </div>
              <div className="bg-white/5 rounded px-2 py-1.5">
                <p className="text-gray-500">Used</p>
                <p className="text-sm font-bold">{s.usageCount}x</p>
              </div>
              <div className="bg-white/5 rounded px-2 py-1.5">
                <p className="text-gray-500">Success</p>
                <p className="text-sm font-bold text-emerald-400">{s.successRate}%</p>
              </div>
            </div>
            <div className="mt-2 px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold inline-block">
              {s.category}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

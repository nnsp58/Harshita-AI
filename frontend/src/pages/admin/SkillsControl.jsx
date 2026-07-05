import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Zap, Wifi, WifiOff, Search, Info, ShieldAlert, Cpu, HeartPulse, Terminal } from 'lucide-react'
import api from '../../services/api'

export default function SkillsControl() {
  const [skills, setSkills] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadSkills = () => {
    setLoading(true)
    api.get('/admin/control/skills')
      .then(res => {
        setSkills(res.data?.data || [])
        setSummary(res.data?.summary || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setTimeout(loadSkills, 0)
  }, [])

  const getStatusBadge = (status) => {
    const classes = {
      'Active': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'In Development': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Disabled': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Broken': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Missing': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'Hidden': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    }[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${classes}`}>
        {status}
      </span>
    )
  }

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      (skill.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.description || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || skill.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout title="All Skills / सभी स्किल्स">
      <div className="space-y-6">
        
        {/* Statistics HUD */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Registered', val: summary.totalRegistered, color: 'border-white/10 text-white' },
              { label: 'Active', val: summary.totalActive, color: 'border-emerald-500/20 text-emerald-400' },
              { label: 'In Dev', val: summary.totalInDevelopment, color: 'border-amber-500/20 text-amber-400' },
              { label: 'Broken', val: summary.totalBroken, color: 'border-red-500/20 text-red-400' },
              { label: 'Missing', val: summary.totalMissing, color: 'border-rose-500/20 text-rose-400' },
              { label: 'Hidden', val: summary.totalHidden, color: 'border-indigo-500/20 text-indigo-400' },
              { label: 'Disabled', val: summary.totalDisabled, color: 'border-gray-500/20 text-gray-400' }
            ].map((sumCard, idx) => (
              <div key={idx} className={`bg-white/5 border rounded-xl p-3 flex flex-col justify-between ${sumCard.color}`}>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">{sumCard.label}</span>
                <p className="text-xl font-black mt-1">{sumCard.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter controls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-3.5 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search skills by name, intent, description..." 
              className="w-full bg-[#0f111a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold whitespace-nowrap">Filter Status:</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="all">Show All Skills</option>
              <option value="active">Active Only</option>
              <option value="in development">In Development</option>
              <option value="broken">Broken Only</option>
              <option value="missing">Missing Only</option>
              <option value="hidden">Hidden Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>

        {/* Grid view */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
              Auditing files...
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No matching skills found in database audit.
            </div>
          ) : filteredSkills.map(s => (
            <div key={s.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate" title={s.displayName}>{s.displayName}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{s.name} <span className="text-gray-600 font-sans">v{s.version}</span></p>
                  </div>
                  {getStatusBadge(s.status)}
                </div>

                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed min-h-[32px]">{s.description}</p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white/5 rounded px-2.5 py-1.5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider font-bold">Input Type</p>
                    <p className="text-gray-200 mt-0.5 font-bold">{s.inputType}</p>
                  </div>
                  <div className="bg-white/5 rounded px-2.5 py-1.5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider font-bold">Output Type</p>
                    <p className="text-gray-200 mt-0.5 font-bold">{s.outputType}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Zap size={12} className="text-amber-500" />
                    <span>Intents: <strong>{s.intentsCount}</strong></span>
                  </div>
                  {s.canRunOffline ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <WifiOff size={12} /> Offline OK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Wifi size={12} /> Online Required
                    </span>
                  )}
                </div>

                {/* Required APIs list */}
                <div className="bg-white/5 rounded p-2 text-[9px] space-y-1">
                  <span className="text-gray-500 uppercase tracking-wider font-bold block text-[8px]">Required APIs & Keys</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.requiredAPIs && s.requiredAPIs.length > 0 ? (
                      s.requiredAPIs.map((apiName, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono text-[8px]">
                          {apiName}
                        </span>
                      ))
                    ) : s.name === 'story_video' ? (
                      ['GEMINI', 'OPENAI', 'ELEVENLABS', 'FAL_AI'].map((apiName, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono text-[8px]">
                          {apiName}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No credentials required</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

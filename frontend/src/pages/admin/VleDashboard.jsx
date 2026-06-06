import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Briefcase, Users, IndianRupee, MessageSquare } from 'lucide-react'
import api from '../../services/api'

export default function VleDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/vle/overview')
      .then(r => setData(r.data?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout title="My Dashboard"><div className="text-gray-500">Loading...</div></AdminLayout>

  return (
    <AdminLayout title={`Welcome ${data?.name || 'VLE'} / स्वागत है`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">My Jobs</p>
                <p className="text-2xl font-bold">{data?.jobs?.total || 0}</p>
                <p className="text-[10px] text-emerald-400">{data?.jobs?.completed || 0} done</p>
              </div>
              <Briefcase size={20} className="text-blue-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">My Candidates</p>
                <p className="text-2xl font-bold">{data?.candidates || 0}</p>
              </div>
              <Users size={20} className="text-purple-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Skills Used</p>
                <p className="text-2xl font-bold">{data?.skillsUsed || 0}</p>
              </div>
              <MessageSquare size={20} className="text-amber-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Earnings</p>
                <p className="text-2xl font-bold">₹{data?.earnings || 0}</p>
              </div>
              <IndianRupee size={20} className="text-emerald-400"/>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><MessageSquare size={14}/> Recent Skills Used</h3>
          {(!data?.recentSkills || data.recentSkills.length === 0) ? (
            <p className="text-xs text-gray-500 italic">No activity yet — start using services from main dashboard</p>
          ) : (
            <div className="space-y-1.5">
              {data.recentSkills.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2 text-xs">
                  <div>
                    <p className="font-medium">{s.skill}</p>
                    <p className="text-[10px] text-gray-500">{s.messageCount} messages</p>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {s.lastActive ? new Date(s.lastActive).toLocaleString('hi-IN') : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

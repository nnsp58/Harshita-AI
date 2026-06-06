import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Users, Briefcase, IndianRupee, Activity } from 'lucide-react'
import api from '../../services/api'

export default function CscDashboard() {
  const [overview, setOverview] = useState(null)
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/csc/overview'),
      api.get('/admin/csc/operators'),
    ])
      .then(([ov, op]) => {
        setOverview(ov.data?.data || null)
        setOperators(op.data?.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout title="CSC Overview"><div className="text-gray-500">Loading...</div></AdminLayout>

  return (
    <AdminLayout title="CSC Owner Dashboard / सीएससी मालिक">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Operators</p>
                <p className="text-2xl font-bold">{overview?.operators || 0}</p>
              </div>
              <Users size={20} className="text-blue-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Total Jobs</p>
                <p className="text-2xl font-bold">{overview?.jobs?.total || 0}</p>
                <p className="text-[10px] text-gray-500">{overview?.jobs?.completed || 0} completed</p>
              </div>
              <Briefcase size={20} className="text-emerald-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Candidates</p>
                <p className="text-2xl font-bold">{overview?.candidates || 0}</p>
              </div>
              <Activity size={20} className="text-purple-400"/>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Revenue</p>
                <p className="text-2xl font-bold">₹{overview?.revenue || 0}</p>
              </div>
              <IndianRupee size={20} className="text-amber-400"/>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold">My Operators ({operators.length})</h3>
          </div>
          {operators.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic">No operators registered yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-white/5">
                  <tr className="text-[10px] uppercase text-gray-500">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {operators.map(o => (
                    <tr key={o.id} className="hover:bg-white/5">
                      <td className="px-4 py-2">{o.name}</td>
                      <td className="px-4 py-2 text-gray-400">{o.email}</td>
                      <td className="px-4 py-2"><span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{o.role}</span></td>
                      <td className="px-4 py-2"><span className={o.is_active ? 'text-emerald-400' : 'text-red-400'}>{o.is_active ? '● Active' : '● Inactive'}</span></td>
                      <td className="px-4 py-2 text-[10px] text-gray-500">{o.created_at ? new Date(o.created_at).toLocaleDateString('hi-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

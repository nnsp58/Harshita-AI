import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { User, Shield, Edit3 } from 'lucide-react'
import api from '../../services/api'

export default function UsersControl() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/control/users')
      .then(r => setUsers(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const roleColors = {
    superadmin: 'bg-red-500/20 text-red-400 border-red-500/30',
    csc_admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    operator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <AdminLayout title="All Users / सभी उपयोगकर्ता">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2"><Shield size={16}/> Total: {users.length} users</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white/5">
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">CSC</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[9px] font-bold">
                          {(u.name || 'U')[0]}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-400">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${roleColors[u.role] || 'bg-gray-500/20'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{u.csc_id || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[9px] font-bold ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {u.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[10px] text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('hi-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

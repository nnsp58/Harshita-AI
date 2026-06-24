import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import {
  Shield, Users, Activity, Settings, ArrowLeft, LogOut,
  Brain, Zap, BarChart3, MessageSquare, Briefcase, Server,
  HeartPulse, Code2
} from 'lucide-react'

const NAV_BY_ROLE = {
  superadmin: [
    { id: 'overview', label: 'System Overview', icon: Activity, path: '/admin/control' },
    { id: 'users', label: 'All Users', icon: Users, path: '/admin/control/users' },
    { id: 'skills', label: 'All Skills', icon: Zap, path: '/admin/control/skills' },
    { id: 'self-healing', label: 'Self-Healing Center', icon: HeartPulse, path: '/admin/control/self-healing' },
    { id: 'developer', label: 'Developer Center', icon: Code2, path: '/admin/control/developer-center' },
    { id: 'learning', label: 'AI Learning', icon: Brain, path: '/admin/control/learning' },
    { id: 'health', label: 'System Health', icon: Server, path: '/admin/control/health' },
  ],
  csc_admin: [
    { id: 'overview', label: 'CSC Overview', icon: Activity, path: '/admin/csc' },
    { id: 'operators', label: 'My Operators', icon: Users, path: '/admin/csc/operators' },
    { id: 'jobs', label: 'All Jobs', icon: Briefcase, path: '/admin/csc/jobs' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/csc/analytics' },
  ],
  operator: [
    { id: 'overview', label: 'My Dashboard', icon: Activity, path: '/admin/vle' },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase, path: '/admin/vle/jobs' },
    { id: 'earnings', label: 'Earnings', icon: BarChart3, path: '/admin/vle/earnings' },
  ],
}


export default function AdminLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useStore()
  const role = user?.role || 'operator'
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.operator

  const handleLogout = () => { logout(); navigate('/login') }

  const roleBadge = {
    superadmin: { label: 'SUPERADMIN', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    csc_admin: { label: 'CSC ADMIN', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    operator: { label: 'VLE / OPERATOR', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  }[role]

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0b10] border-r border-white/10 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-white/10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3">
            <ArrowLeft size={14}/> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-amber-400" />
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link key={item.id} to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                  active ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <Icon size={14}/> {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-white/5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold">
              {(user?.name || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20">
            <LogOut size={12}/> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-[#0f111a]/95 backdrop-blur-xl border-b border-white/10 px-6 py-3">
          <h1 className="text-base font-bold text-white">{title || 'Admin Panel'}</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

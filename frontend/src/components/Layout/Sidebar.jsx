import { NavLink } from 'react-router-dom'
import {
  Home, Search, FileText, Bot, Users, Settings, CreditCard,
  ChevronLeft, ChevronRight, Sparkles, Menu, X, FileSpreadsheet
} from 'lucide-react'
import { useStore } from '../../store'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, user } = useStore()

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/candidates', icon: Users, label: 'Candidates' },
    { path: '/bulk-import', icon: FileSpreadsheet, label: 'Bulk Import' },
    { path: '/jobs', icon: Search, label: 'Work History' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    ...(user?.role === 'admin' ? [
      { path: '/agents', icon: Bot, label: 'Agents' },
      { path: '/subscription', icon: CreditCard, label: 'Subscription' }
    ] : []),
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-maroon-900 via-maroon-800 to-maroon-900 text-white transition-all duration-300 z-[9999] flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-maroon-700/50">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-maroon-900" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-gold-400 tracking-tight">Rawan</h1>
              <p className="text-xs text-gray-300 -mt-1">Multi-Agent AI</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-maroon-900" />
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-maroon-700/50 rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-gold-500/20 to-gold-400/10 text-gold-300 border-l-4 border-gold-400'
                  : 'hover:bg-maroon-700/30 text-gray-200 hover:text-white border-l-4 border-transparent'
              }`
            }
          >
            <item.icon size={22} className={sidebarOpen ? '' : 'mx-auto'} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
            {!sidebarOpen && (
              <span className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer slogan */}
      <div className="p-4 border-t border-maroon-700/50">
        {sidebarOpen ? (
          <p className="text-xs text-gray-300 text-center italic">
            "20 Arms working for you, 24x7"
          </p>
        ) : (
          <div className="text-center">
            <Bot className="w-6 h-6 mx-auto text-gold-400" />
          </div>
        )}
      </div>

      {/* Mobile close button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden absolute -right-3 top-4 bg-maroon-600 text-white p-2 rounded-full shadow-lg border-2 border-maroon-700 hover:bg-maroon-700 transition-colors z-60"
      >
        <X size={16} />
      </button>
    </aside>
  )
}

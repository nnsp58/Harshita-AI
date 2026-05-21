import { Bell, Moon, Sun, Globe, User } from 'lucide-react'
import { useStore } from '../../store'
import { motion } from 'framer-motion'

export default function DashboardHeader() {
  const { user, unreadCount, darkMode, toggleDarkMode, currentTask } = useStore()

  return (
    <header className="h-14 bg-[#0f111a] border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-[180px]">
        <img src="/harshita ai.png" alt="Harshita AI" className="w-8 h-8 rounded-lg" />
        <span className="font-heading font-bold text-white text-sm tracking-wide">HARSHITA AI</span>
      </div>

      {/* Center: Address bar */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <Globe size={14} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 truncate">
            {currentTask ? currentTask.description : 'Ready for commands...'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 min-w-[180px] justify-end">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-gray-300" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-maroon-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {darkMode ? <Sun size={18} className="text-gold-400" /> : <Moon size={18} className="text-gray-300" />}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-maroon-500 to-gold-500 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-xs text-gray-300 hidden lg:block">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  )
}

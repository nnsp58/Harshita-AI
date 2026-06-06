import { Bell, Menu, User, LogOut, Search, ChevronDown, Settings as SettingsIcon, Command } from 'lucide-react'
import { useStore } from '../../store'
import { useState } from 'react'

export default function Header() {
  const { sidebarOpen, toggleSidebar, user, logout, notifications, unreadCount, markRead } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface-100/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-surface-200 rounded-lg transition-colors md:hidden"
        >
          <Menu size={20} className="text-gray-300" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-heading font-bold text-white text-sm tracking-wide">N-DIZI AI</span>
          </div>
        </div>

        {/* Global search / command palette trigger */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-100 border border-white/10 rounded-lg text-xs text-gray-400 hover:border-primary-500/50 hover:text-gray-200 transition-colors">
          <Command size={12} />
          <span>Search anything...</span>
          <span className="ml-2 px-1.5 py-0.5 bg-surface-200 rounded text-[9px] text-gray-500">⌘K</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-surface-200 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-100 border border-white/10 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-md">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-heading font-semibold text-white">Notifications</h3>
              </div>
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-surface-200 cursor-pointer ${!n.read ? 'bg-primary-500/10' : ''}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          n.type === 'success'
                            ? 'bg-success-500'
                            : n.type === 'warning'
                            ? 'bg-warning-500'
                            : n.type === 'error'
                            ? 'bg-danger-500'
                            : 'bg-accent-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No notifications yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-surface-200 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow">
              <User size={16} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-200 truncate max-w-[120px]">{user?.name || 'VLE'}</p>
              <p className="text-xs text-gray-500">VLE</p>
            </div>
            <ChevronDown size={16} className="hidden md:block text-gray-500" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-100 border border-white/10 rounded-xl shadow-xl z-50 backdrop-blur-md">
              <div className="p-3 border-b border-white/10">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.village}, {user?.district}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-200 rounded-lg text-gray-300">
                  <User size={16} />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-200 rounded-lg text-gray-300">
                  <SettingsIcon size={16} />
                  Settings
                </button>
                <hr className="my-2 border-white/10" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-400 hover:bg-danger-500/10 rounded-lg"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

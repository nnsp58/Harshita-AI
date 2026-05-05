import { Bell, Menu, User, LogOut, Menu as MenuIcon, Search, ChevronDown } from 'lucide-react'
import { useStore } from '../../store'
import { useState } from 'react'

export default function Header() {
  const { sidebarOpen, toggleSidebar, user, logout, notifications, unreadCount, markRead } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between px-4 transition-all duration-300 z-40 ${
        sidebarOpen ? 'left-64' : 'left-20'
      }`}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs, documents, candidates..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-navy-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-gray-100 dark:border-navy-700 z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-100 dark:border-navy-700">
                <h3 className="font-heading font-semibold">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-navy-700">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-navy-700/50 cursor-pointer ${!n.read ? 'bg-maroon-50 dark:bg-maroon-900/20' : ''}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          n.type === 'success'
                            ? 'bg-emerald-500'
                            : n.type === 'warning'
                            ? 'bg-amber-500'
                            : n.type === 'error'
                            ? 'bg-rose-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{n.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.time}</p>
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
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-maroon-500 to-maroon-700 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium truncate max-w-[120px]">{user?.name || 'VLE'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">VLE</p>
            </div>
            <ChevronDown size={16} className="hidden md:block text-gray-400" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-gray-100 dark:border-navy-700 z-50">
              <div className="p-3 border-b border-gray-100 dark:border-navy-700">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.village}, {user?.district}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg">
                  <User size={16} />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg">
                  <Settings size={16} />
                  Settings
                </button>
                <hr className="my-2 border-gray-100 dark:border-navy-700" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
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

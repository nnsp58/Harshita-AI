import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import socketService from '../../services/socket'
import { useStore } from '../../store'
import { useEffect } from 'react'

export default function DashboardLayout() {
  const { sidebarOpen, initialize, stopPolling, toggleSidebar, isAuthenticated, user, fetchJobs, fetchStats, fetchAgents } = useStore()

  // Initialize data and start polling when authenticated
  useEffect(() => {
    console.log('DashboardLayout useEffect, isAuthenticated:', isAuthenticated)
    if (isAuthenticated) {
      initialize()
      
      // Connect WebSocket
      if (user?.id) {
        const socket = socketService.connect(user.id)
        
        // Global listeners for real-time updates
        socketService.on('state_change', (data) => {
          console.log('📡 Job state change:', data)
          fetchJobs() // Reload jobs on state change
        })
        
        socketService.on('job_completed', (data) => {
          console.log('📡 Job completed:', data)
          fetchJobs()
          fetchStats()
        })
      }
    }
    
    // Cleanup on unmount
    return () => {
      stopPolling()
      socketService.disconnect()
    }
  }, [isAuthenticated, initialize, stopPolling, user, fetchJobs, fetchStats])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 transition-colors">
      <Sidebar />
      <Header />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64 ml-0' : 'md:ml-20 ml-0'
        }`}
      >
        <div className="p-2 xs:p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

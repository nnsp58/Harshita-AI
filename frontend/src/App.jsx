import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from './components/Layout/DashboardLayout'
import Home from './pages/Home'
import Agents from './pages/Agents'
import Jobs from './pages/Jobs'
import Documents from './pages/Documents'
import LegalDraft from './pages/LegalDraft'
import Candidates from './pages/Candidates'
import Settings from './pages/Settings'
import Subscription from './pages/Subscription'
import BulkImport from './pages/BulkImport'
import Login from './pages/Login'
import { useStore } from './store'

function App() {
  const { darkMode, isAuthenticated, logout } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  // Watch for auth errors
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('Unauthorized API call detected, logging out...')
      logout()
    }
    window.addEventListener('auth_unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized)
  }, [logout])

  // Robust initialization check
  useEffect(() => {
    const checkAuth = () => {
      // Small delay to ensure Zustand has rehydrated
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-maroon-600/20 rounded-full" />
          <div className="w-16 h-16 border-4 border- gold-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="mt-6 text-gold-400 font-heading font-bold animate-pulse">RAWAN AI PLATFORM</p>
        <p className="text-gray-500 text-xs mt-2 font-mono uppercase tracking-[0.2em]">Initializing 20-Armed System...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Home />} />
          <Route path="agents" element={<Agents />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="documents" element={<Documents />} />
          <Route path="legal" element={<LegalDraft />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="bulk-import" element={<BulkImport />} />
          <Route path="settings" element={<Settings />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

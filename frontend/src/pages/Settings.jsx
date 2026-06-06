import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Bell, MessageCircle, Wifi, WifiOff,
  ArrowLeft, User, Shield, Database, Globe, Save, LogOut,
  Moon, Sun, Phone, Mail, MapPin, Building2, CreditCard
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, darkMode, toggleDarkMode } = useStore()

  const [activeTab, setActiveTab] = useState('profile')
  const [waStatus, setWaStatus] = useState({ enabled: false, isReady: false })
  const [waLoading, setWaLoading] = useState(false)
  const [networkStatus, setNetworkStatus] = useState({ online: true })
  const [saved, setSaved] = useState(false)

  // Profile form
  const [profile, setProfile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('harshita_csc_profile') || '{}')
      return {
        cscName: saved.cscName || 'My CSC Center',
        ownerName: saved.ownerName || user?.name || '',
        email: saved.email || user?.email || '',
        phone: saved.phone || '',
        address: saved.address || '',
        district: saved.district || '',
        state: saved.state || 'Uttar Pradesh',
        pincode: saved.pincode || '',
        cscId: saved.cscId || user?.csc_id || '',
      }
    } catch {
      return { cscName: '', ownerName: user?.name || '', email: user?.email || '', phone: '', address: '', district: '', state: 'Uttar Pradesh', pincode: '', cscId: '' }
    }
  })

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('harshita_notif_prefs') || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [waRes] = await Promise.allSettled([api.get('/whatsapp/status')])
        if (waRes.status === 'fulfilled') setWaStatus(waRes.value.data?.data || waRes.value.data || {})
      } catch {}
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const saveProfile = () => {
    localStorage.setItem('harshita_csc_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveNotifications = (key, val) => {
    const updated = { ...notifications, [key]: val }
    setNotifications(updated)
    localStorage.setItem('harshita_notif_prefs', JSON.stringify(updated))
  }

  const handleConnectWhatsApp = async () => {
    setWaLoading(true)
    try { await api.post('/whatsapp/start') } catch {}
    setWaLoading(false)
  }

  const handleLogout = () => {
    if (confirm('Logout karna chahte hain?')) {
      logout()
      navigate('/login')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', labelHi: 'प्रोफाइल', icon: User },
    { id: 'preferences', label: 'Preferences', labelHi: 'सेटिंग्स', icon: SettingsIcon },
    { id: 'integrations', label: 'Integrations', labelHi: 'इंटीग्रेशन', icon: Database },
    { id: 'security', label: 'Security', labelHi: 'सुरक्षा', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold flex items-center gap-2"><SettingsIcon size={18}/> Settings / सेटिंग्स</h1>
          <p className="text-[10px] text-gray-500">Apni preferences aur profile manage karein</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-400 font-bold">
            ✓ Saved
          </motion.div>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
        {/* Sidebar tabs */}
        <aside className="bg-white/5 border border-white/10 rounded-xl p-2 h-fit md:sticky md:top-20">
          <nav className="space-y-1">
            {tabs.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                    activeTab === t.id ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  <Icon size={14}/>
                  <span>{t.label}</span>
                  <span className="text-[9px] opacity-60 ml-auto">{t.labelHi}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-3 pt-3 border-t border-white/10">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20">
              <LogOut size={14}/> Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-4">
          {activeTab === 'profile' && <ProfileTab profile={profile} setProfile={setProfile} onSave={saveProfile} user={user} />}
          {activeTab === 'preferences' && <PreferencesTab darkMode={darkMode} toggleDarkMode={toggleDarkMode} notifications={notifications} saveNotifications={saveNotifications} />}
          {activeTab === 'integrations' && <IntegrationsTab waStatus={waStatus} waLoading={waLoading} onConnectWA={handleConnectWhatsApp} networkStatus={networkStatus} />}
           {activeTab === 'security' && <SecurityTab user={user} />}

           {/* Data Export */}
           <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
             <h4 className="font-medium mb-2">Export Your Data</h4>
             <p className="text-xs text-gray-400 mb-3">Download all your data (GDPR compliant). Includes profile, jobs, documents, and history.</p>
             <button
               onClick={async () => {
                 try {
                   const res = await fetch('/api/export/my-data', {
                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                   })
                   const blob = await res.blob()
                   const url = window.URL.createObjectURL(blob)
                   const a = document.createElement('a')
                   a.href = url
                   a.download = 'harshita-my-data.json'
                   a.click()
                 } catch (e) {
                   alert('Export failed: ' + e.message)
                 }
               }}
               className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
             >
               Download My Data (JSON)
             </button>
           </div>
         </main>
       </div>
     </div>
   )
 }

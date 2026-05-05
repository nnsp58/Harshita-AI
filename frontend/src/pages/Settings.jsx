import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Bell, MessageCircle, Wifi, WifiOff,
  QrCode, RefreshCcw, Zap, Building2, Users, UserPlus, Trash2
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'

export default function Settings() {
  const { user, darkMode, toggleDarkMode, operators, addOperator, removeOperator } = useStore()
  
  // WhatsApp state
  const [waStatus, setWaStatus] = useState({ enabled: false, isReady: false, activeSessions: 0 })
  const [waLoading, setWaLoading] = useState(false)
  const [waQr, setWaQr] = useState(null)

  // Network Monitor state
  const [networkStatus, setNetworkStatus] = useState({ online: true, monitoringJobs: 0, pausedJobs: [] })

  useEffect(() => {
    // Poll WhatsApp and network status every 30s (Reduced frequency to avoid 429)
    const fetchStatus = async () => {
      try {
        const [waRes, healthRes] = await Promise.allSettled([
          api.get('/whatsapp/status'),
          api.get('/health', { baseURL: 'http://localhost:3001' })
        ])
        if (waRes.status === 'fulfilled') setWaStatus(waRes.value.data)
        if (healthRes.status === 'fulfilled') setNetworkStatus(healthRes.value.data.network || networkStatus)
      } catch {}
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [networkStatus])

  const handleConnectWhatsApp = async () => {
    setWaLoading(true)
    try {
      await api.post('/whatsapp/start')
    } catch (e) {
      console.error('WhatsApp start error:', e)
    } finally {
      setWaLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your Rawan command center</p>
      </div>

      {/* System Status Section (OWNER ONLY) */}
      {user?.role === 'admin' && (
        <section className="card p-6 border-gold-200 bg-gold-50/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Zap className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold">Admin: System Health</h2>
              <p className="text-sm text-gray-500">Autonomous systems operational status (AI Engine Active)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'System AI Engine', desc: 'Secure SaaS Backend', status: 'operational' },
              { name: 'Parallel Workflow', desc: 'Active Queue Orchestrator', status: 'operational' },
              { name: 'OCR & Parser', desc: 'Zero-Cost Extraction', status: 'operational' },
              { name: 'Result Generator', desc: 'Automatic HTML Reports', status: 'operational' },
              { name: 'Browser Nodes', desc: 'Virtual Browser Network', status: 'operational' },
              { name: 'Service Uptime', desc: 'Live Monitoring Active', status: 'operational' }
            ].map((service, i) => (
              <div key={i} className="p-4 bg-white dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{service.name}</p>
                  <p className="text-xs text-gray-400">{service.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Center Profile */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg">Center Profile</h2>
            <p className="text-sm text-gray-500">Identity for your CSC Business</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Center Name</label>
            <input type="text" defaultValue="Varanasi Main CSC" className="input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Owner Name</label>
            <input type="text" defaultValue="VLE Admin" className="input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Location</label>
            <input type="text" defaultValue="Bhadohi, Varanasi" className="input" />
          </div>
        </div>
      </section>

      {/* WhatsApp Connect */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">WhatsApp Bot</h2>
              <p className="text-sm text-gray-500">Collect candidate docs via WhatsApp</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${waStatus.isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {waStatus.isReady ? '🟢 Connected' : '⚫ Disconnected'}
          </div>
        </div>

        {waStatus.isReady ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center">
             <p className="text-sm">WhatsApp Integration is Active. Candidates can send messages to your system.</p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            {waQr && (
              <div className="inline-block p-4 bg-white rounded-xl border-2 border-dashed border-emerald-400">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waQr)}`} alt="WhatsApp QR" />
                <p className="text-xs mt-2 text-gray-500">Scan to connect bot</p>
              </div>
            )}
            <button onClick={handleConnectWhatsApp} className="w-full btn-primary flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Connect WhatsApp Bot
            </button>
          </div>
        )}
      </section>

      {/* Network Monitor */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${networkStatus.online ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {networkStatus.online ? <Wifi className="text-emerald-600" size={20} /> : <WifiOff className="text-rose-600" size={20} />}
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg">Network Guard</h2>
            <p className="text-sm text-gray-500">Auto-rescue bots on network failure</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">Current Status: <span className="font-bold">{networkStatus.online ? 'Stable Connect' : 'Disconnected'}</span></p>
      </section>
    </div>
  )
}

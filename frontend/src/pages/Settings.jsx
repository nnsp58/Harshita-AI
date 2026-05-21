import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Bell, MessageCircle, Wifi, WifiOff,
  QrCode, RefreshCcw, Zap, Building2, Users, UserPlus, Trash2, ShieldCheck, Database
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'

export default function Settings() {
  const { user } = useStore()
  
  const [waStatus, setWaStatus] = useState({ enabled: false, isReady: false, activeSessions: 0 })
  const [waLoading, setWaLoading] = useState(false)
  const [waQr, setWaQr] = useState(null)
  const [networkStatus, setNetworkStatus] = useState({ online: true, monitoringJobs: 0, pausedJobs: [] })

  useEffect(() => {
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full text-sm">
      {/* Header (Compact) */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 shrink-0">
        <SettingsIcon size={20} className="text-gray-400" />
        <h1 className="text-lg font-semibold text-gray-200">Settings</h1>
      </div>

      <div className="flex-1 overflow-auto mt-4 px-1">
        {/* VS Code Style Settings List */}
        <div className="space-y-8 max-w-3xl">
          
          {/* Admin Health Section */}
          {user?.role === 'admin' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">System Health (Admin)</h3>
              <div className="border border-white/5 rounded-md bg-[#090b10] overflow-hidden">
                {[
                  { id: 'engine', name: 'System AI Engine', desc: 'Secure SaaS Backend' },
                  { id: 'workflow', name: 'Parallel Workflow', desc: 'Active Queue Orchestrator' },
                  { id: 'ocr', name: 'OCR & Parser', desc: 'Zero-Cost Extraction' },
                  { id: 'result', name: 'Result Generator', desc: 'Automatic HTML Reports' }
                ].map((service, i, arr) => (
                  <div key={service.id} className={`flex items-center justify-between p-3 hover:bg-white/5 transition-colors ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-medium">{service.name}</span>
                      <span className="text-[10px] text-gray-500">{service.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-500">Operational</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Center Profile</h3>
            <div className="border border-white/5 rounded-md bg-[#090b10] overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Center Name</span>
                <input type="text" defaultValue="Varanasi Main CSC" className="bg-transparent border border-white/10 rounded px-2 py-1 text-gray-300 w-64 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Owner Name</span>
                <input type="text" defaultValue="VLE Admin" className="bg-transparent border border-white/10 rounded px-2 py-1 text-gray-300 w-64 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Location</span>
                <input type="text" defaultValue="Bhadohi, Varanasi" className="bg-transparent border border-white/10 rounded px-2 py-1 text-gray-300 w-64 focus:outline-none focus:border-gold-500 text-sm" />
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Integrations</h3>
            <div className="border border-white/5 rounded-md bg-[#090b10] overflow-hidden">
              {/* WhatsApp */}
              <div className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">WhatsApp Bot</span>
                  <span className="text-[10px] text-gray-500">Collect candidate docs via WhatsApp</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] ${waStatus.isReady ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {waStatus.isReady ? 'Connected' : 'Disconnected'}
                  </span>
                  {!waStatus.isReady && (
                    <button onClick={handleConnectWhatsApp} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-xs transition-colors">
                      {waLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Network Guard */}
              <div className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">Network Guard</span>
                  <span className="text-[10px] text-gray-500">Auto-rescue bots on network failure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${networkStatus.online ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {networkStatus.online ? 'Stable Connect' : 'Offline'}
                  </span>
                  {networkStatus.online ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-rose-500" />}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

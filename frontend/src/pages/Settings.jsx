import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Bell, MessageCircle, Wifi, WifiOff,
  QrCode, RefreshCcw, Zap, Building2, Users, UserPlus, Trash2,
  Sun, Moon, User
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'team', label: 'Team' },
]

export default function Settings() {
  const { user, darkMode, toggleDarkMode, operators, addOperator, removeOperator } = useStore()

  const [activeTab, setActiveTab] = useState('profile')
  const [newOperatorName, setNewOperatorName] = useState('')

  // WhatsApp state
  const [waStatus, setWaStatus] = useState({ enabled: false, isReady: false, activeSessions: 0 })
  const [waLoading, setWaLoading] = useState(false)
  const [waQr, setWaQr] = useState(null)

  // Network Monitor state
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
  }, [])

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

  const handleAddOperator = () => {
    if (newOperatorName.trim()) {
      addOperator({ name: newOperatorName.trim() })
      setNewOperatorName('')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your Rawan command center</p>
      </div>

      {/* System Status Section (ADMIN ONLY) */}
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

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-maroon-600 text-white'
                : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
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
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
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
                {waStatus.isReady ? '\u{1F7E2} Connected' : '\u26AB Disconnected'}
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Status: <span className="font-bold">{networkStatus.online ? 'Stable Connect' : 'Disconnected'}</span></p>
          </section>
        </div>
      )}

      {activeTab === 'preferences' && (
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <SettingsIcon className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">Preferences</h2>
              <p className="text-sm text-gray-500">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {darkMode ? 'Dark theme is active' : 'Light theme is active'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-maroon-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Notification Preferences</h3>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-800 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-maroon-600 focus:ring-maroon-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Job Completion Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when jobs finish</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-800 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-maroon-600 focus:ring-maroon-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Error Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alert when a job fails or needs attention</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-800 rounded-lg cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-maroon-600 focus:ring-maroon-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp Messages</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notify when candidates send documents</p>
                </div>
              </label>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'team' && (
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">Team Management</h2>
              <p className="text-sm text-gray-500">Manage operators who can use this system</p>
            </div>
          </div>

          {/* Add Operator Form */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newOperatorName}
              onChange={(e) => setNewOperatorName(e.target.value)}
              placeholder="Enter operator name"
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddOperator()}
            />
            <button onClick={handleAddOperator} className="btn-primary flex items-center gap-2">
              <UserPlus size={16} />
              Add
            </button>
          </div>

          {/* Operator List */}
          {operators.length > 0 ? (
            <div className="space-y-2">
              {operators.map((op) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{op.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{op.jobs || 0} jobs completed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeOperator(op.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    aria-label={`Remove ${op.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No operators added yet. Add team members above.</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Save, CheckCircle, X, Wrench } from 'lucide-react'
import { io as socketIO } from 'socket.io-client'

/**
 * UpgradeNotification — Listens to Socket.IO 'system_notification' events
 * Shows popup notifications for upgrade window:
 *  - 30 min advance warning
 *  - 5 min final warning + auto-save trigger
 *  - During upgrade: full-screen overlay
 *  - After upgrade: success notification
 */
const DRAFT_KEY = 'harshita_pending_drafts'

export default function UpgradeNotification() {
  const [notif, setNotif] = useState(null)
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    // Connect to socket
    const socket = socketIO(import.meta.env.PROD ? window.location.origin : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    socket.on('system_notification', (payload) => {
      setNotif(payload)

      // Auto-actions based on action type
      if (payload.action === 'auto_save_now') {
        triggerAutoSave()
      }
      if (payload.action === 'show_overlay') {
        setMaintenance(true)
      }
      if (payload.action === 'resume_work') {
        setMaintenance(false)
        // Auto-dismiss success after 5 sec
        setTimeout(() => setNotif(null), 5000)
      }
    })

    // Poll schedule every 5 min for fallback (in case socket disconnects)
    const pollSchedule = async () => {
      if (!navigator.onLine) return; // Prevent fetch errors when offline
      try {
        const res = await fetch('/api/learning/schedule')
        const data = await res.json()
        if (data?.data?.isInMaintenance) setMaintenance(true)
      } catch {}
    }
    pollSchedule()
    const interval = setInterval(pollSchedule, 5 * 60 * 1000)

    return () => {
      socket.off('system_notification')
      socket.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Trigger save event so other components save their drafts
  const triggerAutoSave = () => {
    window.dispatchEvent(new CustomEvent('harshita-auto-save'))
    // Mark in localStorage that we should resume after upgrade
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      url: window.location.pathname,
    }))
  }

  const dismiss = () => setNotif(null)

  return (
    <>
      {/* Notification Toast */}
      <AnimatePresence>
        {notif && !maintenance && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 z-[100] max-w-md w-[90%] sm:w-auto"
          >
            <div className={`rounded-2xl shadow-2xl border p-4 backdrop-blur-xl ${
              notif.severity === 'success'
                ? 'bg-emerald-900/90 border-emerald-500/50'
                : notif.severity === 'warning'
                ? 'bg-amber-900/90 border-amber-500/50'
                : 'bg-blue-900/90 border-blue-500/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {notif.severity === 'success' ? <CheckCircle size={20} className="text-emerald-300" />
                    : notif.severity === 'warning' ? <AlertTriangle size={20} className="text-amber-300" />
                    : <Wrench size={20} className="text-blue-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{notif.title}</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">{notif.titleHi}</p>
                  <p className="text-xs text-gray-200 mt-2">{notif.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{notif.messageHi}</p>
                  {notif.windowStart && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      🕐 Window: {notif.windowStart} - {notif.windowEnd}
                    </p>
                  )}
                  {notif.action === 'auto_save_now' && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-300">
                      <Save size={11} /> Auto-saving drafts...
                    </div>
                  )}
                </div>
                <button onClick={dismiss} className="shrink-0 p-1 hover:bg-white/10 rounded">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Maintenance Overlay */}
      <AnimatePresence>
        {maintenance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="text-center max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <Wrench size={80} className="text-amber-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">🔧 System Upgrading</h2>
              <p className="text-amber-300 mb-1">सिस्टम अपग्रेड हो रहा है</p>
              <p className="text-sm text-gray-300 mb-4">
                Harshita AI is learning new improvements from today's interactions.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                आज की बातचीत से Harshita AI नई बातें सीख रहा है। आपका कार्य सेव हो गया है।
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-amber-400 rounded-full" />
                Please wait... कृपया प्रतीक्षा करें
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

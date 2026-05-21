import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Upload, Search, FileText, Zap, Clock } from 'lucide-react'
import { useStore } from '../../store'

const quickActions = [
  { id: 'automation', label: 'Start Automation', icon: Zap, color: 'from-maroon-500 to-maroon-700', command: 'start automation' },
  { id: 'upload', label: 'Upload Document', icon: Upload, color: 'from-navy-500 to-navy-700', command: 'upload document' },
  { id: 'jobs', label: 'Search Jobs', icon: Search, color: 'from-gold-500 to-gold-700', command: 'search jobs' },
  { id: 'report', label: 'Generate Report', icon: FileText, color: 'from-green-500 to-green-700', command: 'generate report' },
]

function TaskBar({ currentTask }) {
  if (!currentTask) return null
  const progress = currentTask.progress || 0
  const currentStep = currentTask.currentStep || 0
  const totalSteps = currentTask.steps || 1

  return (
    <div className="px-4 py-3 bg-white/5 border-b border-white/10">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-300 truncate flex-1">{currentTask.description}</span>
        <span className="text-[10px] text-gray-500 ml-2">Step {currentStep}/{totalSteps}</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-maroon-500 to-gold-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

function WelcomeScreen({ onAction }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-maroon-500/20 to-gold-500/20 flex items-center justify-center">
            <Zap size={28} className="text-maroon-400" />
          </div>
          <h2 className="text-lg font-heading font-semibold text-white mb-2">Welcome to Harshita AI</h2>
          <p className="text-sm text-gray-400 mb-6">Choose a quick action or type a command to get started</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                onClick={() => onAction && onAction(action.command)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-maroon-500/50 hover:bg-white/10 transition-all group text-left"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white">{action.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ActivityFeed({ activityLog }) {
  const feedRef = useRef(null)

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [activityLog])

  if (!activityLog || activityLog.length === 0) {
    return (
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock size={12} />
          <span className="text-[11px]">Activity feed - waiting for actions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-white/10 max-h-40 overflow-hidden flex flex-col">
      <div className="px-4 py-1.5 border-b border-white/5">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Activity</span>
      </div>
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        {activityLog.slice(-20).map((entry) => (
          <div key={entry.id} className="flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
              entry.type === 'user' ? 'bg-blue-400' :
              entry.type === 'ai' ? 'bg-green-400' : 'bg-gray-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 truncate">{entry.message}</p>
            </div>
            <span className="text-[9px] text-gray-600 shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CenterPanel({ onAction }) {
  const { currentTask, activityLog } = useStore()

  return (
    <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
      <TaskBar currentTask={currentTask} />
      <WelcomeScreen onAction={onAction} />
      <ActivityFeed activityLog={activityLog} />
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeftClose, PanelRightClose, Monitor, MessageSquare, LayoutGrid } from 'lucide-react'
import { useStore } from '../../store'
import { useSocket } from '../../hooks/useSocket'
import DashboardHeader from './DashboardHeader'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import StatusBar from './StatusBar'

export default function WorkspaceDashboard() {
  const { initialize, addActivityLog } = useStore()
  const { isConnected, sendCommand, messages } = useSocket()
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('center') // mobile tabs

  useEffect(() => {
    initialize()
  }, [initialize])

  // Sync socket messages to activity log
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.type !== 'user') {
        addActivityLog(lastMsg)
      }
    }
  }, [messages, addActivityLog])

  const handleSkillClick = useCallback((skill) => {
    sendCommand(`Use ${skill.displayName}`)
  }, [sendCommand])

  const handleQuickAction = useCallback((command) => {
    sendCommand(command)
  }, [sendCommand])

  const tabs = [
    { id: 'left', label: 'Skills', icon: LayoutGrid },
    { id: 'center', label: 'Workspace', icon: Monitor },
    { id: 'right', label: 'Chat', icon: MessageSquare },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden">
      <DashboardHeader />

      {/* Mobile tabs - visible < 1024px */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-[#0f111a]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-maroon-400 border-b-2 border-maroon-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Desktop 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Desktop */}
        <AnimatePresence initial={false}>
          {!leftCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block shrink-0 overflow-hidden"
            >
              <LeftPanel onSkillClick={handleSkillClick} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse/Expand left toggle - Desktop */}
        <button
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          className="hidden lg:flex items-center justify-center w-5 hover:bg-white/5 transition-colors border-r border-white/5"
          title={leftCollapsed ? 'Show skills panel' : 'Hide skills panel'}
        >
          <PanelLeftClose size={12} className={`text-gray-600 transition-transform ${leftCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Center Panel - always visible on desktop, tab-controlled on mobile */}
        <div className="flex-1 min-w-0 hidden lg:flex flex-col">
          <CenterPanel onAction={handleQuickAction} />
        </div>

        {/* Collapse/Expand right toggle - Desktop */}
        <button
          onClick={() => setRightCollapsed(!rightCollapsed)}
          className="hidden lg:flex items-center justify-center w-5 hover:bg-white/5 transition-colors border-l border-white/5"
          title={rightCollapsed ? 'Show chat panel' : 'Hide chat panel'}
        >
          <PanelRightClose size={12} className={`text-gray-600 transition-transform ${rightCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Right Panel - Desktop */}
        <AnimatePresence initial={false}>
          {!rightCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block shrink-0 overflow-hidden"
            >
              <RightPanel
                messages={messages}
                onSendCommand={sendCommand}
                isConnected={isConnected}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile panel views */}
        <div className="flex-1 lg:hidden">
          {activeTab === 'left' && <LeftPanel onSkillClick={handleSkillClick} />}
          {activeTab === 'center' && <CenterPanel onAction={handleQuickAction} />}
          {activeTab === 'right' && (
            <RightPanel
              messages={messages}
              onSendCommand={sendCommand}
              isConnected={isConnected}
            />
          )}
        </div>
      </div>

      <StatusBar isConnected={isConnected} />
    </div>
  )
}

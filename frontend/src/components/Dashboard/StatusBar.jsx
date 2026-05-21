import { Activity, Cpu, Wifi, WifiOff } from 'lucide-react'
import { useStore } from '../../store'

export default function StatusBar({ isConnected }) {
  const { agents, currentTask } = useStore()

  const activeCount = agents ? agents.filter(
    (a) => a.status === 'running' || a.status === 'active'
  ).length : 0

  return (
    <footer className="h-8 bg-[#0a0b10] border-t border-white/10 flex items-center px-4 shrink-0">
      <div className="flex items-center gap-6 w-full text-[11px] text-gray-500">
        {/* Active agents */}
        <div className="flex items-center gap-1.5">
          <Cpu size={11} className="text-gray-500" />
          <span>{activeCount} agent{activeCount !== 1 ? 's' : ''} active</span>
        </div>

        {/* Current task */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Activity size={11} className="text-gray-500 shrink-0" />
          <span className="truncate">
            {currentTask ? currentTask.description : 'Idle'}
          </span>
        </div>

        {/* Network status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <Wifi size={11} className="text-green-400" />
              <span className="text-green-400">Connected</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <WifiOff size={11} className="text-red-400" />
              <span className="text-red-400">Offline</span>
            </>
          )}
        </div>

        {/* System health */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Healthy</span>
        </div>
      </div>
    </footer>
  )
}

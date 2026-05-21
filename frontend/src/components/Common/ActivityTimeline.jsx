import { FileCheck, Clock, AlertCircle, Loader } from 'lucide-react'

function getRelativeTime(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const date = new Date(timestamp)
  const diff = now - date.getTime()

  if (isNaN(diff)) return timestamp

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500'
    case 'processing':
    case 'running':
      return 'bg-blue-500 animate-pulse'
    case 'failed':
    case 'error':
      return 'bg-rose-500'
    case 'queued':
    case 'pending':
      return 'bg-amber-500'
    default:
      return 'bg-gray-400'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'completed':
      return FileCheck
    case 'processing':
    case 'running':
      return Loader
    case 'failed':
    case 'error':
      return AlertCircle
    default:
      return Clock
  }
}

export default function ActivityTimeline({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Clock size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No recent activity</p>
        <p className="text-xs mt-1">Your completed jobs will appear here</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-navy-700" />

      {activities.map((activity, index) => {
        const StatusIcon = getStatusIcon(activity.status)
        return (
          <div key={activity.id || index} className="relative flex items-start gap-4 py-3">
            {/* Status dot */}
            <div className={`relative z-10 w-[10px] h-[10px] mt-1.5 ml-[10px] rounded-full ring-2 ring-white dark:ring-navy-900 ${getStatusColor(activity.status)}`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {activity.type || 'Job'}
                </p>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {getRelativeTime(activity.timestamp || activity.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {activity.candidate || 'Unknown candidate'}
                {activity.status && (
                  <span className={`ml-2 inline-flex items-center gap-1 ${
                    activity.status === 'completed' ? 'text-emerald-500' :
                    activity.status === 'failed' || activity.status === 'error' ? 'text-rose-500' :
                    'text-blue-500'
                  }`}>
                    <StatusIcon size={10} />
                    {activity.status}
                  </span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

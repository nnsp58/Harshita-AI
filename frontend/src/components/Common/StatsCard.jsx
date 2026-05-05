import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-gray-400'

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    maroon: 'bg-gradient-to-br from-maroon-500 to-maroon-600',
    gold: 'bg-gradient-to-br from-gold-400 to-gold-500',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500',
    rose: 'bg-gradient-to-br from-rose-500 to-red-500',
    navy: 'bg-gradient-to-br from-navy-500 to-navy-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card card-hover p-5 relative overflow-hidden`}
    >
      {/* Background icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {Icon && <Icon size={64} />}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <h3 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {Icon && <Icon size={24} className="text-white" />}
        </div>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
            {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'}
          </span>
        )}
      </div>
    </motion.div>
  )
}

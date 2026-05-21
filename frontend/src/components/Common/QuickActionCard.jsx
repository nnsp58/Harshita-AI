import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function QuickActionCard({ icon: Icon, title, description, linkTo, color = 'maroon' }) {
  const colorClasses = {
    maroon: 'bg-maroon-50 dark:bg-maroon-950/30 text-maroon-600 dark:text-maroon-400 group-hover:bg-maroon-100 dark:group-hover:bg-maroon-900/40',
    gold: 'bg-gold-50 dark:bg-gold-950/30 text-gold-600 dark:text-gold-400 group-hover:bg-gold-100 dark:group-hover:bg-gold-900/40',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40',
    navy: 'bg-navy-50 dark:bg-navy-950/30 text-navy-600 dark:text-navy-400 group-hover:bg-navy-100 dark:group-hover:bg-navy-900/40',
  }

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={linkTo}
        className="card card-hover p-6 flex flex-col items-center text-center gap-3 group block h-full"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${colorClasses[color] || colorClasses.maroon}`}>
          {Icon && <Icon size={28} />}
        </div>
        <h3 className="font-heading font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  )
}

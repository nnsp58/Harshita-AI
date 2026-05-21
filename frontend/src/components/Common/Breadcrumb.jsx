import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const pathLabels = {
  '': 'Dashboard',
  'candidates': 'Candidates',
  'bulk-import': 'Bulk Import',
  'jobs': 'Job Queue',
  'documents': 'Documents',
  'agents': 'Agents',
  'legal': 'Legal Draft',
  'settings': 'Settings',
  'subscription': 'Subscription',
}

export default function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  // Don't show breadcrumb on home page
  if (segments.length === 0) return null

  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...segments.map((segment, index) => ({
      label: pathLabels[segment] || segment,
      path: '/' + segments.slice(0, index + 1).join('/'),
    })),
  ]

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={crumb.path} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
            {isLast ? (
              <span className="font-bold text-gray-700 dark:text-gray-200">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-maroon-600 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

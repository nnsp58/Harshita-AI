import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionLink, onAction }) {
  return (
    <div className="card p-12 text-center">
      {Icon && <Icon size={48} className="mx-auto mb-4 opacity-30" />}
      <h3 className="font-heading font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary inline-flex items-center gap-2">
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionLink && onAction && (
        <button onClick={onAction} className="btn-primary inline-flex items-center gap-2">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

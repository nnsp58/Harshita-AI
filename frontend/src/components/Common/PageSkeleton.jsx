export default function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="skeleton h-8 w-48 rounded-lg" />

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="skeleton h-24 rounded-lg" />
        <div className="skeleton h-24 rounded-lg" />
        <div className="skeleton h-24 rounded-lg" />
        <div className="skeleton h-24 rounded-lg" />
      </div>

      {/* Content block */}
      <div className="skeleton h-64 rounded-lg" />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Loader2, Play, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react'
import { useStore } from '../store'

const statusIcons = {
  completed: <CheckCircle className="text-emerald-500" size={16} />,
  running: <Loader2 className="text-amber-500 animate-spin" size={16} />,
  queued: <Clock className="text-blue-500" size={16} />,
  pending: <Clock className="text-blue-500" size={16} />,
  failed: <XCircle className="text-rose-500" size={16} />,
  cancelled: <XCircle className="text-gray-500" size={16} />,
  ready_for_review: <ShieldCheck className="text-purple-500" size={16} />,
}

const statusClass = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  running: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  queued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function formatDate(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default function Jobs() {
  const { jobs = [], fetchJobs, startJob } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startingId, setStartingId] = useState('')
  const [error, setError] = useState('')

  const filteredJobs = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return jobs.filter(job => {
      const candidateName = job.candidate?.name || job.candidate || ''
      const service = job.service_type || job.type || job.title || ''
      const matchesSearch =
        service.toLowerCase().includes(q) ||
        candidateName.toLowerCase().includes(q) ||
        String(job.id || '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [jobs, searchTerm, statusFilter])

  const handleStart = async (jobId) => {
    setStartingId(jobId)
    setError('')
    try {
      await startJob(jobId)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not start job.')
    } finally {
      setStartingId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Job Queue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create jobs from Candidates, then start and monitor them here</p>
        </div>
        <button onClick={fetchJobs} className="btn-secondary flex items-center gap-2 w-fit">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input w-auto">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-rose-700 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">{error}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-navy-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
              {filteredJobs.map(job => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-navy-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">#{String(job.id).slice(0, 8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{job.service_type || job.type || job.title}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <p>{job.candidate?.name || job.candidate || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{job.candidate?.mobile || ''}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[job.status] || statusClass.pending}`}>
                      {statusIcons[job.status] || statusIcons.pending}
                      {String(job.status || 'pending').replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{job.priority ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(job.updated_at || job.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    {['pending', 'failed', 'cancelled'].includes(job.status) ? (
                      <div className="flex flex-col gap-2">
                        {job.candidate?.verification_status !== 'verified' && (
                          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded flex items-center gap-1">
                            <ShieldCheck size={12} />
                            Candidate not verified
                          </div>
                        )}
                        <button
                          onClick={() => handleStart(job.id)}
                          disabled={startingId === job.id || job.candidate?.verification_status !== 'verified'}
                          className="btn-primary py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {startingId === job.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                          Start
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">No action</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>No jobs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

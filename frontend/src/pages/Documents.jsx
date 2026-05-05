import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, FileText, FileCheck, XCircle, Loader2, Eye, Check, X,
  Filter, Search, ImageIcon, File, Clock, BookOpen, UserCircle, PenTool
} from 'lucide-react'
import { useStore } from '../store'

export default function Documents() {
  const { documents } = useStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewDoc, setPreviewDoc] = useState(null)

  const filteredDocs = documents.filter(doc =>
    statusFilter === 'all' || doc.status === statusFilter
  )

  const statusConfig = {
    completed: { icon: FileCheck, color: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    processing: { icon: Loader2, color: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', animate: true },
    failed: { icon: XCircle, color: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    pending: { icon: Clock, color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  }

  const fileTypeIcons = {
    pdf: File,
    jpg: ImageIcon,
    jpeg: ImageIcon,
    png: ImageIcon,
    default: FileText,
  }

  const getFileIcon = (name) => {
    const ext = name.split('.').pop()?.toLowerCase()
    const Icon = fileTypeIcons[ext] || FileText
    return <Icon size={24} />
  }

  const requiredDocs = [
    { name: 'Caste Certificate', id: 'caste', icon: BookOpen, status: 'pending' },
    { name: 'EWS Certificate', id: 'ews', icon: FileText, status: 'pending' },
    { name: 'Passport Size Photo', id: 'photo', icon: UserCircle, status: 'pending' },
    { name: 'Signature Scan', id: 'sign', icon: PenTool, status: 'pending' },
    { name: '10th Marksheet', id: '10th', icon: FileText, status: 'pending' },
    { name: '12th Marksheet', id: '12th', icon: FileText, status: 'pending' },
    { name: 'Graduate Degree', id: 'grad', icon: FileText, status: 'pending' },
    { name: 'Post Graduate Degree', id: 'pg', icon: FileText, status: 'pending' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Document Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Agent "Rawan" will use these to auto-fill your job applications</p>
        </div>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Upload size={20} />
          Upload All Documents
          <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>

      {/* Requirement Table */}
      <div className="card p-6 border-gold-200 bg-gold-50/20">
        <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="text-gold-500" size={20} /> Job Requirement Checklist
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {requiredDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-lg border border-gray-100 dark:border-navy-700">
              <div className="p-2 bg-gray-50 dark:bg-navy-900 rounded">
                <doc.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{doc.name}</p>
                <p className="text-[10px] text-amber-600">Pending</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search documents..." className="input pl-10" />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const config = statusConfig[doc.status] || statusConfig.pending
          const IconComponent = config.icon

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-4 relative overflow-hidden ${doc.status === 'completed' ? 'border-emerald-200' : ''}`}
            >
              {/* Status badge top-right */}
              <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
                <IconComponent
                  size={16}
                  className={config.animate ? 'animate-spin' : ''}
                />
              </div>

              {/* Document icon & name */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  doc.type === 'Aadhaar' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  doc.type === 'Marksheet' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                  doc.type === 'PAN' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300'
                }`}>
                  {getFileIcon(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" title={doc.name}>{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                  <p className="text-xs text-gray-400 mt-1">Candidate: {doc.candidate}</p>
                </div>
              </div>

              {/* Extracted data preview (if completed) */}
              {doc.extracted && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-navy-800/50 rounded-lg text-xs">
                  <p className="font-medium mb-1">Extracted:</p>
                  <div className="space-y-1 text-gray-600 dark:text-gray-300">
                    {Object.entries(doc.extracted).slice(0, 3).map(([key, val]) => (
                      <p key={key}><span className="capitalize">{key}:</span> {String(val).substring(0, 30)}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Error message (if failed) */}
              {doc.error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-xs">
                  <p className="font-medium text-rose-700 dark:text-rose-300">{doc.error}</p>
                </div>
              )}

              {/* Upload time */}
              <p className="text-xs text-gray-400 mb-3">
                Uploaded: {doc.uploaded_at || doc.uploadedAt || 'Recently'}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 btn-ghost text-sm flex items-center justify-center gap-2">
                  <Eye size={16} /> Preview
                </button>
                {doc.status === 'completed' && (
                  <>
                    <button className="btn-primary text-sm px-3 py-2 flex items-center gap-1">
                      <Check size={14} /> Approve
                    </button>
                    <button className="btn-ghost text-sm px-3 py-2 text-rose-600 hover:bg-rose-50">
                      <X size={14} />
                    </button>
                  </>
                )}
                {doc.status === 'failed' && (
                  <button className="btn-secondary text-sm">Retry</button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredDocs.length === 0 && (
        <div className="card p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-heading font-semibold text-lg mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">Upload Aadhaar, marksheets, or other documents to get started</p>
          <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
            <Upload size={20} /> Upload First Document
            <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        </div>
      )}
    </div>
  )
}

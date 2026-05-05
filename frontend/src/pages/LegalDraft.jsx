import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, Sparkles, Save, Trash2 } from 'lucide-react'
import { useStore } from '../store'

const documentTypes = [
  { id: 'affidavit', name: 'Affidavit', icon: '📄' },
  { id: 'noc', name: 'No Objection Certificate (NOC)', icon: '📝' },
  { id: 'rent_agreement', name: 'Rent Agreement', icon: '🏠' },
  { id: 'declaration', name: 'Declaration', icon: '✍️' },
]

export default function LegalDraft() {
  const { user } = useStore()
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    address: '',
    purpose: '',
  })
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState([
    { id: 1, type: 'affidavit', name: 'Affidavit for Name Change', createdAt: '2025-01-18', status: 'completed' },
    { id: 2, type: 'noc', name: 'NOC for Vehicle Transfer', createdAt: '2025-01-17', status: 'completed' },
  ])

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setDrafts([{
        id: Date.now(),
        type: selectedType,
        name: `${selectedType?.charAt(0).toUpperCase() + selectedType?.slice(1)} - ${formData.fullName}`,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'completed'
      }, ...drafts])
      setLoading(false)
      setSelectedType(null)
      setFormData({ fullName: '', fatherName: '', address: '', purpose: '' })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Legal Draft Studio</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Create affidavits, NOCs, rent agreements, and declarations using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template selector */}
        <div className="lg:col-span-1 card p-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <FileText size={20} /> Select Template
          </h2>
          <div className="space-y-3">
            {documentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === type.id
                    ? 'border-maroon-500 bg-maroon-50 dark:bg-maroon-900/20'
                    : 'border-gray-200 dark:border-navy-700 hover:border-maroon-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.id === 'affidavit' && 'Sworn statement for legal purposes'}
                      {type.id === 'noc' && 'No objection certificate for transfers'}
                      {type.id === 'rent_agreement' && 'Property rental contract'}
                      {type.id === 'declaration' && 'General purpose declaration'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedType ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold flex items-center gap-2">
                  <Sparkles className="text-gold-500" size={20} />
                  AI-Powered Draft
                </h2>
                <span className="badge badge-info">Using Groq AI</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ram Kumar Sharma"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Father's / Husband's Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Late Sh. Mohan Lal"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full residential address..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="label">Purpose / Additional Details</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Purpose of affidavit, property details for rent agreement, etc."
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.fullName}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Draft
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="card p-12 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-heading font-semibold text-xl mb-2">Select a Template</h3>
              <p className="text-gray-500">Choose a legal document type from the left panel to get started</p>
            </div>
          )}

          {/* Recent drafts */}
          {drafts.length > 0 && (
            <div className="mt-6">
              <h3 className="font-heading font-semibold mb-4">Recent Drafts</h3>
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-maroon-100 dark:bg-maroon-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="text-maroon-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{draft.name}</p>
                      <p className="text-xs text-gray-500">{draft.createdAt}</p>
                    </div>
                    <span className="badge badge-success">Ready</span>
                    <button className="btn-ghost p-2">
                      <Download size={18} />
                    </button>
                    <button className="btn-ghost p-2">
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

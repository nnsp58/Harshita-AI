import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, Download, CheckCircle, XCircle,
  AlertTriangle, Play, RefreshCcw, Users, Zap, ChevronRight
} from 'lucide-react'
import api from '../services/api'

const SERVICE_OPTIONS = [
  { value: 'ssc',           label: '📚 SSC CGL / CHSL' },
  { value: 'army',          label: '⚔️ Indian Army' },
  { value: 'railway',       label: '🚂 Railway (RRB)' },
  { value: 'banking',       label: '🏦 Banking (IBPS/SBI)' },
  { value: 'police',        label: '🚔 Police' },
  { value: 'postal',        label: '📬 India Post' },
  { value: 'apprenticeship',label: '🔧 Apprenticeship' },
]

export default function BulkImport() {
  const fileRef = useRef(null)
  const [step, setStep] = useState('upload') // upload | preview | importing | done
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [serviceType, setServiceType] = useState('ssc')
  const [autoSubmit, setAutoSubmit] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Handle file drop or selection
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setError(null)
    setStep('previewing')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await api.post('/bulk/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPreview(res.data)
      setStep('preview')
    } catch (err) {
      setError(err.response?.data?.error || 'File parse error')
      setStep('upload')
      setFile(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setStep('importing')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('serviceType', serviceType)
    formData.append('autoSubmit', autoSubmit ? 'true' : 'false')

    try {
      const res = await api.post('/bulk/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed')
      setStep('preview')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    const res = await api.get('/bulk/template', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'rawan_candidate_template.xlsx'
    a.click()
  }

  const reset = () => {
    setStep('upload'); setFile(null); setPreview(null)
    setResult(null); setError(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Bulk Import</h1>
          <p className="text-gray-500 mt-1">Excel se 100+ candidates ek saath process karein</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          Sample Excel Download Karein
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['Upload', 'Preview', 'Import', 'Done'].map((s, i) => {
          const stepMap = { 0: 'upload', 1: 'preview', 2: 'importing', 3: 'done' }
          const current = { upload: 0, previewing: 1, preview: 1, importing: 2, done: 3 }[step]
          const active = current >= i
          return (
            <span key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-maroon-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i + 1}
              </span>
              <span className={active ? 'text-maroon-600 font-semibold' : 'text-gray-400'}>{s}</span>
              {i < 3 && <ChevronRight size={14} className="text-gray-300" />}
            </span>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
          <XCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── STEP 1: Upload ── */}
      {(step === 'upload' || step === 'previewing') && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragOver ? 'border-maroon-500 bg-maroon-50 dark:bg-maroon-900/20' : 'border-gray-300 dark:border-navy-600 hover:border-maroon-400'}`}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {step === 'previewing' ? (
              <div className="space-y-3">
                <RefreshCcw size={40} className="mx-auto text-maroon-500 animate-spin" />
                <p className="font-semibold text-maroon-600">Parsing Excel...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-maroon-100 dark:bg-maroon-900/30 rounded-2xl flex items-center justify-center mx-auto">
                  <FileSpreadsheet size={32} className="text-maroon-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">Excel File Yahan Drop Karein</p>
                  <p className="text-sm text-gray-500 mt-1">ya click karke file select karein</p>
                  <p className="text-xs text-gray-400 mt-2">.xlsx, .xls, .csv supported • Max 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* How to make Excel guide */}
          <div className="card p-6 mt-4">
            <h2 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-maroon-500" />
              Excel File Kaise Banayein?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Step 1 — Template Download Karein</p>
                <button onClick={handleDownloadTemplate} className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                  <Download size={15} /> Template Download
                </button>
                <p className="text-xs text-gray-500">Yeh file MS Excel ya Google Sheets mein khulegi</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Step 2 — Data Bharo</p>
                <div className="space-y-1">
                  {[
                    ['Name*', 'Candidate ka pura naam (Hindi ya English)'],
                    ['Father Name*', 'Pita ka naam'],
                    ['DOB*', 'DD/MM/YYYY format (15/08/1998)'],
                    ['Gender', 'Male / Female'],
                    ['Category', 'OBC / SC / ST / General'],
                    ['Aadhaar*', '12 digit number (space ke bina)'],
                    ['Phone*', '10 digit mobile number'],
                    ['Service*', 'SSC / Army / Railway / Banking'],
                  ].map(([col, desc]) => (
                    <div key={col} className="flex gap-2 text-xs">
                      <span className="font-bold text-maroon-600 min-w-[90px]">{col}</span>
                      <span className="text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── STEP 2: Preview ── */}
      {step === 'preview' && preview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-maroon-600">{preview.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total Rows</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{preview.valid}</p>
              <p className="text-xs text-gray-500 mt-1">Valid Candidates</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-rose-500">{preview.errors.length}</p>
              <p className="text-xs text-gray-500 mt-1">Errors</p>
            </div>
          </div>

          {/* Errors */}
          {preview.errors.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl">
              <p className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle size={16} /> {preview.errors.length} rows mein problem hai:
              </p>
              {preview.errors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-xs text-amber-600">Row {e.row}: {e.error}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-navy-700">
              <p className="font-semibold text-sm">Preview — Pehle 5 Candidates</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-navy-800">
                    <th className="p-3 text-left text-gray-500">Row</th>
                    <th className="p-3 text-left text-gray-500">Naam</th>
                    <th className="p-3 text-left text-gray-500">Phone</th>
                    <th className="p-3 text-left text-gray-500">Aadhaar</th>
                    <th className="p-3 text-left text-gray-500">Service</th>
                    <th className="p-3 text-left text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((c, i) => (
                    <tr key={i} className="border-t border-gray-50 dark:border-navy-700">
                      <td className="p-3 text-gray-400">{c.rowNum}</td>
                      <td className="p-3 font-medium">{c.personal.fullName}</td>
                      <td className="p-3 text-gray-500">{c.contact.phone}</td>
                      <td className="p-3 text-gray-500">{'****' + (c.documents.aadhaar || '').slice(-4)}</td>
                      <td className="p-3"><span className="badge-info text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c.serviceType || serviceType}</span></td>
                      <td className="p-3"><span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> Ready</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import settings */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Import Settings</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type Override</label>
              <p className="text-xs text-gray-400">Excel mein 'Service' column hai toh uski priority rahegi. Yahan fallback service choose karein:</p>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="input"
              >
                {SERVICE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto Submit</p>
                <p className="text-xs text-gray-400">Off rakho = VLE review karke manually submit karega (Recommended)</p>
              </div>
              <button
                onClick={() => setAutoSubmit(!autoSubmit)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoSubmit ? 'bg-maroon-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSubmit ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={reset} className="btn-secondary flex-1">
              ← Naya File
            </button>
            <button
              onClick={handleImport}
              disabled={preview.valid === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Play size={16} />
              {preview.valid} Candidates Import Karein
            </button>
          </div>
        </motion.div>
      )}

      {/* ── STEP 3: Importing ── */}
      {step === 'importing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-maroon-100 dark:bg-maroon-900/30 rounded-full flex items-center justify-center mx-auto">
            <Zap size={40} className="text-maroon-600 animate-pulse" />
          </div>
          <div>
            <p className="text-xl font-bold">Jobs Queue Ho Rahe Hain...</p>
            <p className="text-gray-500 mt-2">Rawan har candidate ke liye ek automation job bana raha hai</p>
          </div>
          <div className="flex justify-center">
            <RefreshCcw size={24} className="text-maroon-500 animate-spin" />
          </div>
        </motion.div>
      )}

      {/* ── STEP 4: Done ── */}
      {step === 'done' && result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="card p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">Import Successful!</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                <p className="text-3xl font-bold text-emerald-600">{result.queued}</p>
                <p className="text-xs text-gray-500 mt-1">Jobs Queued</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{result.batchId?.slice(-6)}</p>
                <p className="text-xs text-gray-500 mt-1">Batch ID</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                <p className="text-3xl font-bold text-amber-600">{result.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">Skipped</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Jobs Page pe jayein aur progress dekhein. CAPTCHA/OTP milne par notification aayega.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="btn-secondary flex-1">Aur Import Karein</button>
            <a href="/jobs" className="btn-primary flex-1 text-center">Jobs Monitor Karein →</a>
          </div>
        </motion.div>
      )}
    </div>
  )
}

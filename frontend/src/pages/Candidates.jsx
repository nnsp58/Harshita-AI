import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BriefcaseBusiness, CheckCircle, Loader2, MapPin, Phone, Save, Search, ShieldCheck, UserRound } from 'lucide-react'
import { useStore } from '../store'

const serviceOptions = [
  { value: 'ssc', label: 'SSC Registration' },
  { value: 'army', label: 'Army Recruitment' },
  { value: 'railway', label: 'Railway Recruitment' },
  { value: 'banking', label: 'Banking Recruitment' },
  { value: 'police', label: 'Police Recruitment' },
  { value: 'defence', label: 'Defence Recruitment' },
  { value: 'postal', label: 'Postal / IPPB' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'ration', label: 'Ration Card' },
]

export default function Candidates() {
  const { candidates = [], createJob, fetchCandidates, fetchJobs, getCandidateVerification, verifyCandidate } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [serviceType, setServiceType] = useState('ssc')
  const [priority, setPriority] = useState(1)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [verificationProfile, setVerificationProfile] = useState(null)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationSaving, setVerificationSaving] = useState(false)

  const filteredCandidates = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return candidates.filter(candidate =>
      (candidate.name || '').toLowerCase().includes(q) ||
      (candidate.aadhaar_number || '').includes(q) ||
      (candidate.mobile || '').includes(q) ||
      (candidate.village || '').toLowerCase().includes(q) ||
      (candidate.district || '').toLowerCase().includes(q)
    )
  }, [candidates, searchTerm])

  const selectedCandidate = candidates.find(candidate => candidate.id === selectedCandidateId)

  const selectCandidate = async (candidate) => {
    setSelectedCandidateId(candidate.id)
    setMessage('')
    setError('')
    setVerificationLoading(true)
    try {
      const verification = await getCandidateVerification(candidate.id)
      setVerificationProfile(verification.profile)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load verification form.')
    } finally {
      setVerificationLoading(false)
    }
  }

  const updateProfile = (path, value) => {
    setVerificationProfile(prev => {
      const next = structuredClone(prev || {})
      const parts = path.split('.')
      let cursor = next
      for (let i = 0; i < parts.length - 1; i++) {
        cursor[parts[i]] = cursor[parts[i]] || {}
        cursor = cursor[parts[i]]
      }
      cursor[parts.at(-1)] = value
      return next
    })
  }

  const handleVerify = async () => {
    if (!selectedCandidateId || !verificationProfile) return
    setVerificationSaving(true)
    setError('')
    setMessage('')
    try {
      await verifyCandidate(selectedCandidateId, {
        profile: verificationProfile,
        corrections: { source: 'dashboard_verification_form' },
      })
      setMessage('Candidate master form verified and saved. It will be reused for future jobs.')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not verify candidate.')
    } finally {
      setVerificationSaving(false)
    }
  }

  const handleCreateJob = async (event) => {
    event.preventDefault()
    if (!selectedCandidateId) {
      setError('Select a candidate first.')
      return
    }
    if (selectedCandidate?.verification_status !== 'verified') {
      setError('Verify the candidate master form before creating or starting jobs.')
      return
    }

    setCreating(true)
    setError('')
    setMessage('')

    try {
      const result = await createJob({
        candidate_id: selectedCandidateId,
        service_type: serviceType,
        priority: Number(priority),
        notes: `Created from dashboard for ${selectedCandidate?.name || 'candidate'}`,
      })
      setMessage(`Job created: ${result?.id || 'ready in queue'}`)
      await fetchJobs()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not create job.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Candidates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create service jobs directly from candidate records</p>
        </div>
        <button onClick={fetchCandidates} className="btn-secondary w-fit">Refresh</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-navy-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, Aadhaar, mobile, village..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                {filteredCandidates.map(candidate => (
                  <motion.tr
                    key={candidate.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={selectedCandidateId === candidate.id ? 'bg-maroon-50 dark:bg-maroon-900/20' : 'hover:bg-gray-50 dark:hover:bg-navy-800/30'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserRound size={18} className="text-maroon-600" />
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-gray-500">Aadhaar ****{String(candidate.aadhaar_number || '').slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone size={14} />
                        {candidate.mobile}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{candidate.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin size={14} />
                        {candidate.village}, {candidate.district}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{candidate.state} - {candidate.pincode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{candidate._count?.documents ?? candidate.documents?.length ?? 0}</td>
                    <td className="px-6 py-4 text-sm">{candidate._count?.jobs ?? candidate.jobs?.length ?? 0}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selectCandidate(candidate)}
                        className="btn-secondary text-sm py-2"
                      >
                        Select
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Search size={42} className="mx-auto mb-3 opacity-30" />
              <p>No candidates found</p>
            </div>
          )}
        </div>

        <form onSubmit={handleCreateJob} className="card p-5 h-fit space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h2 className="font-heading font-bold text-lg">Master Form</h2>
          </div>

          {selectedCandidate && (
            <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
              selectedCandidate.verification_status === 'verified'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20'
            }`}>
              Status: {selectedCandidate.verification_status || 'needs_review'}
            </div>
          )}

          {verificationLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Loading verification form...
            </div>
          )}

          {verificationProfile && (
            <div className="space-y-3 border-b border-gray-200 dark:border-navy-700 pb-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={verificationProfile.personal?.fullName || ''} onChange={e => updateProfile('personal.fullName', e.target.value)} />
              </div>
              <div>
                <label className="label">Father Name</label>
                <input className="input" value={verificationProfile.personal?.fatherName || ''} onChange={e => updateProfile('personal.fatherName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">DOB</label>
                  <input type="date" className="input" value={verificationProfile.personal?.dob || ''} onChange={e => updateProfile('personal.dob', e.target.value)} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={verificationProfile.personal?.gender || 'male'} onChange={e => updateProfile('personal.gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Mobile</label>
                <input className="input" value={verificationProfile.contact?.phone || ''} onChange={e => updateProfile('contact.phone', e.target.value)} />
              </div>
              <div>
                <label className="label">Aadhaar</label>
                <input className="input" value={verificationProfile.documents?.aadhaar || ''} onChange={e => updateProfile('documents.aadhaar', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Village</label>
                  <input className="input" value={verificationProfile.address?.line1 || ''} onChange={e => updateProfile('address.line1', e.target.value)} />
                </div>
                <div>
                  <label className="label">Tehsil</label>
                  <input className="input" value={verificationProfile.address?.line2 || ''} onChange={e => updateProfile('address.line2', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">District</label>
                  <input className="input" value={verificationProfile.address?.district || ''} onChange={e => updateProfile('address.district', e.target.value)} />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input" value={verificationProfile.address?.pincode || ''} onChange={e => updateProfile('address.pincode', e.target.value)} />
                </div>
              </div>
              <button type="button" onClick={handleVerify} disabled={verificationSaving} className="btn-primary w-full flex items-center justify-center gap-2">
                {verificationSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Verify Master Form
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={20} className="text-maroon-600" />
            <h2 className="font-heading font-bold text-lg">Create Job</h2>
          </div>

          <div>
            <label className="label">Selected Candidate</label>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800 text-sm min-h-[48px]">
              {selectedCandidate ? (
                <>
                  <p className="font-medium">{selectedCandidate.name}</p>
                  <p className="text-gray-500">{selectedCandidate.mobile}</p>
                </>
              ) : (
                <span className="text-gray-500">Choose a candidate from the table</span>
              )}
            </div>
          </div>

          <div>
            <label className="label">Service</label>
            <select value={serviceType} onChange={(event) => setServiceType(event.target.value)} className="input">
              {serviceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Priority</label>
            <input
              type="number"
              min="0"
              max="10"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="input"
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <CheckCircle size={16} />
              {message}
            </div>
          )}
          {error && <div className="text-sm text-rose-700 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={creating || !selectedCandidateId} className="btn-primary w-full flex items-center justify-center gap-2">
            {creating ? <Loader2 size={18} className="animate-spin" /> : <BriefcaseBusiness size={18} />}
            Create Job
          </button>
        </form>
      </div>
    </div>
  )
}

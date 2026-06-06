import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, Scale, Check, Phone, Mail, Building2, Hash, Award } from 'lucide-react'
import api from '../services/api'

export default function AdvocateProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    enrollmentNumber: '',
    chamberAddress: '',
    phone: '',
    email: '',
    court: '',
    barAssociation: '',
  })

  useEffect(() => {
    api.get('/advocate/profile')
      .then(r => { if (r.data?.data) setProfile(p => ({ ...p, ...r.data.data })) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!profile.name || !profile.enrollmentNumber) {
      alert('नाम और Enrollment Number ज़रूरी हैं')
      return
    }
    setSaving(true)
    try {
      await api.post('/advocate/profile', profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.error || e.message))
    }
    setSaving(false)
  }

  const handleClear = async () => {
    if (!confirm('Clear advocate profile?')) return
    await api.delete('/advocate/profile').catch(() => {})
    setProfile({ name: '', enrollmentNumber: '', chamberAddress: '', phone: '', email: '', court: '', barAssociation: '' })
  }

  const f = (key) => (e) => setProfile({ ...profile, [key]: e.target.value })

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <header className="sticky top-0 z-40 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold flex items-center gap-2"><Scale size={18}/> Advocate Profile</h1>
          <p className="text-[10px] text-gray-500">यह profile letterhead पर automatic use होगी</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-400 font-bold">
            ✓ Saved
          </motion.div>
        )}
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-300">
                💡 Yeh profile ek baar setup karne ke baad har legal notice par automatic use hogi.
                Letterhead par advocate ka naam, enrollment, chamber address, contact print honge.
              </p>
            </div>

            <Section title="Personal Details / व्यक्तिगत विवरण" icon={Award}>
              <Field label="Advocate Name *" hint="Adv. Ramesh Kumar"
                value={profile.name} onChange={f('name')} icon={Scale} />
              <Field label="Enrollment Number *" hint="UP/12345/2018"
                value={profile.enrollmentNumber} onChange={f('enrollmentNumber')} icon={Hash} />
            </Section>

            <Section title="Contact / संपर्क" icon={Phone}>
              <Field label="Phone *" hint="9876543210"
                value={profile.phone} onChange={f('phone')} icon={Phone} type="tel" />
              <Field label="Email" hint="advocate@example.com"
                value={profile.email} onChange={f('email')} icon={Mail} type="email" />
            </Section>

            <Section title="Chamber / Office" icon={Building2}>
              <Field label="Chamber Address *" hint="12, Civil Court Road, Lucknow, UP - 226001"
                value={profile.chamberAddress} onChange={f('chamberAddress')} icon={Building2}
                multiline />
              <Field label="Practising Court" hint="District Court Lucknow / High Court Allahabad"
                value={profile.court} onChange={f('court')} />
              <Field label="Bar Association" hint="Lucknow Bar Association"
                value={profile.barAssociation} onChange={f('barAssociation')} />
            </Section>

            <div className="flex items-center gap-3 pt-4">
              <button onClick={handleSave} disabled={saving || !profile.name || !profile.enrollmentNumber}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-bold rounded-xl flex items-center justify-center gap-2">
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Saving...</>
                ) : (
                  <><Save size={16}/> Save Profile</>
                )}
              </button>
              <button onClick={handleClear}
                className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20">
                <Trash2 size={16}/>
              </button>
            </div>

            {/* Letterhead preview */}
            {profile.name && profile.enrollmentNumber && (
              <div className="mt-6 bg-white text-black p-6 rounded-xl shadow-2xl font-serif">
                <p className="text-[10px] text-gray-500 mb-2 italic font-sans">Letterhead Preview:</p>
                <div className="text-center border-b-2 border-black pb-3 mb-3">
                  <h2 className="text-xl font-bold">{profile.name.toUpperCase()}</h2>
                  <p className="text-sm">Advocate</p>
                  {profile.court && <p className="text-xs">Practising at: {profile.court}</p>}
                </div>
                <div className="text-xs space-y-0.5">
                  <p><b>Enrollment No:</b> {profile.enrollmentNumber}</p>
                  {profile.chamberAddress && <p><b>Chamber:</b> {profile.chamberAddress}</p>}
                  {profile.phone && <p><b>Phone:</b> {profile.phone}{profile.email && ` | Email: ${profile.email}`}</p>}
                  {profile.barAssociation && <p><b>Member:</b> {profile.barAssociation}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold flex items-center gap-2 text-amber-400">
        <Icon size={16}/> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, hint, value, onChange, icon: Icon, type = 'text', multiline = false }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-1 flex items-center gap-1">
        {Icon && <Icon size={11}/>}
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={onChange} placeholder={hint} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none" />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={hint}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
      )}
    </div>
  )
}

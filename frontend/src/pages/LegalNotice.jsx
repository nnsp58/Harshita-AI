import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Download, Eye, Sparkles, Save, Trash2, ArrowLeft, X,
  Wand2, Languages, Edit3, Printer, Copy, Check
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'
import LegalDocumentEditor from '../components/LegalDocumentEditor'

const noticeTypes = [
  { id: 'cheque_bounce', name: 'Cheque Bounce / चेक बाउंस', icon: '💳', desc: 'Section 138 NI Act notice for dishonoured cheque', example: 'Example: "Mohan Kumar ne ₹50,000 ka cheque diya tha jo bounce ho gaya hai, usko notice bhejna hai"' },
  { id: 'eviction', name: 'Eviction Notice / बेदखली नोटिस', icon: '🏠', desc: 'Tenant eviction notice', example: 'Example: "Kirayedar Suresh 3 mahine se kiraya nahi de raha hai aur makaan khali nahi kar raha, usko eviction notice bhejo"' },
  { id: 'money_recovery', name: 'Money Recovery / राशी वसूली', icon: '💰', desc: 'Recover money lent to someone', example: 'Example: "Rahul ko maine pichle saal ₹2 Lakh udhar diye the, ab wo wapas nahi kar raha hai, recovery notice bhejo"' },
  { id: 'defamation', name: 'Defamation / मानहानि', icon: '⚠️', desc: 'Stop defamation and claim damages', example: 'Example: "Rakesh ne social media par mere khilaf jhoothe aarop lagaye hain jisse meri image kharab hui hai, ₹5 Lakh ka defamation notice bhejo"' },
  { id: 'property_dispute', name: 'Property Dispute / सम्पत्ति विवाद', icon: '🏡', desc: 'Property ownership or possession dispute', example: 'Example: "Mera padosi mere khali plot par zabardasti kabza karne ki koshish kar raha hai, usko legal notice bhejna hai"' },
  { id: 'recovery_of_dues', name: 'Recovery of Dues / बकाया वसूली', icon: '📋', desc: 'Recover pending dues', example: 'Example: "Company XYZ ne mere pichle 6 mahine ke bill pass nahi kiye hain, total ₹1,50,000 pending hain, payment notice bhejo"' },
  { id: 'breach_contract', name: 'Breach of Contract / अनुबंध भंग', nameHi: 'अनुबंध भंग', icon: '📄', desc: 'Compensate for contract breach', example: 'Example: "Contractor Mukesh ne building construction ka kaam agreement ke hisab se poora nahi kiya, breach of contract ka notice bhejo"' },
  { id: 'consumer_complaint', name: 'Consumer Complaint / उपभोक्ता शिकायत', icon: '🛒', desc: 'File consumer court complaint', example: 'Example: "Maine ABC shop se fridge kharida tha jo defective nikla aur wo log replace nahi kar rahe, consumer court ka notice bhejo"' },
]

const STORAGE_KEY = 'harshita_legal_notices'

function loadNotices() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveNotices(notices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices))
}

export default function LegalNotice() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [selectedType, setSelectedType] = useState(null)
  const [naturalInput, setNaturalInput] = useState('')
  const [generatedNotice, setGeneratedNotice] = useState(null)
  const [editedNotice, setEditedNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [notices, setNotices] = useState(loadNotices)

  // Generate legal notice using AI
  const generateNotice = async () => {
    if (!selectedType || !naturalInput.trim()) {
      alert('Pehle notice type chunein aur details likhein!')
      return
    }
    setLoading(true)
    try {
      const noticeType = noticeTypes.find(t => t.id === selectedType)
      const cmd = `Legal notice banao - ${noticeType.name}: ${naturalInput.trim()}. Language: Hindi+English. Advocate letterhead par likho.`

      const res = await api.post('/command', { cmd, userId: user?.id || 'demo', context: { skill: 'legal_notice', noticeType: selectedType } })
      const aiResponse = res.data?.message || ''

      const fullNotice = generateNoticeTemplate(selectedType, naturalInput, aiResponse)
      setGeneratedNotice(fullNotice)
      setEditedNotice(fullNotice.content)
    } catch (e) {
      console.error('AI error, using template:', e)
      const fullNotice = generateNoticeTemplate(selectedType, naturalInput, '')
      setGeneratedNotice(fullNotice)
      setEditedNotice(fullNotice.content)
    }
    setLoading(false)
  }

  // Save notice
  const saveNotice = () => {
    if (!generatedNotice) return
    const newNotice = {
      id: Date.now(),
      type: selectedType,
      typeName: noticeTypes.find(t => t.id === selectedType)?.name,
      title: generatedNotice.title,
      content: editedNotice || generatedNotice.content,
      naturalInput,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'completed',
    }
    const updated = [newNotice, ...notices].slice(0, 50)
    setNotices(updated)
    saveNotices(updated)
    alert('✅ Notice saved!')
  }

  const downloadNotice = (notice) => {
    const content = notice?.content || editedNotice || generatedNotice?.content || ''
    const title = notice?.title || generatedNotice?.title || 'legal_notice'
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^\w]+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function generateNoticeTemplate(type, input, aiResponse) {
    const today = new Date().toLocaleDateString('en-IN')

    const titles = {
      cheque_bounce: 'Cheque Bounce Notice / चेक बाउंस नोटिस',
      eviction: 'Eviction Notice / बेदखली नोटिस',
      money_recovery: 'Money Recovery Notice / राशी वसूली नोटिस',
      defamation: 'Defamation Notice / मानहानि नोटिस',
      property_dispute: 'Property Dispute Notice / सम्पत्ति विवाद नोटिस',
      recovery_of_dues: 'Recovery of Dues Notice / बकाया वसूली नोटिस',
      breach_contract: 'Breach of Contract Notice / अनुबंध भंग नोटिस',
      consumer_complaint: 'Consumer Complaint Notice / उपभोक्ता शिकायत नोटिस',
    }

    const subjectMap = {
      cheque_bounce: 'Under Section 138 of the Negotiable Instruments Act, 1881 — Notice for Dishonour of Cheque',
      eviction: 'Notice for Eviction of Tenant',
      money_recovery: 'Legal Notice for Recovery of Money',
      defamation: 'Legal Notice for Defamation',
      property_dispute: 'Legal Notice regarding Property Dispute',
      recovery_of_dues: 'Notice for Recovery of Outstanding Dues',
      breach_contract: 'Notice for Breach of Contract',
      consumer_complaint: 'Consumer Complaint Notice before Consumer Forum',
    }

    const typeName = titles[type] || 'Legal Notice'
    const subject = subjectMap[type] || subjectMap.money_recovery

    return {
      title: typeName,
      content: `LEGAL NOTICE
${'═'.repeat(70)}

DATE: ${today}

TO,
[RESPONDENT NAME]
[RESPONDENT ADDRESS]

SUBJECT: ${subject}

Dear Sir/Madam,

This is a formal legal notice sent on behalf of my client [CLIENT NAME], regarding the following matter:

${aiResponse ? aiResponse : `BRIEF: ${input}`}

DEMANDS / RELIEFS SOUGHT:

1. You are hereby directed to [SPECIFIC ACTION REQUIRED] within 15 days from receipt of this notice.

2. Failing which, [CONSEQUENCES] shall be initiated without further notice.

3. All costs and consequences shall be borne by you.

This notice is issued without prejudice to all other rights and remedies available to my client under law.

Kindly treat this notice as urgent and mandatory.

Yours faithfully,

[ADVOCATE NAME]
[ENROLLMENT NUMBER]
[ADVOCATE COUNCIL/STATE]
[Chamber Address]
[Phone / Email]

CC: [Client Copy]
    [Concerned Authority, if any]

═══
Note: This is a draft legal notice generated by AI. Please review carefully and consult with a practicing advocate before sending.`
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Legal Notice / वकील का नोटिस</h1>
          <p className="text-[10px] text-gray-500">Advocate letterhead par professional legal notice</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Notice Types */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-20">
          <h2 className="text-xs font-bold mb-3 flex items-center gap-2 text-gray-300">
            <FileText size={14}/> Notice Type / नोटिस का प्रकार
          </h2>
          <div className="space-y-1.5">
            {noticeTypes.map(type => (
              <button key={type.id} onClick={() => setSelectedType(type.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                  selectedType === type.id
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{type.name}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">{type.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Input + Editor */}
        <div className="lg:col-span-6 space-y-4">
          {selectedType ? (
            <>
              {/* AI Input */}
              <div className="bg-white/5 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="text-orange-400" size={16} />
                    AI से notice बनाएं
                  </h3>
                </div>

                <p className="text-[11px] text-gray-400 mb-2">
                  जिसके खिलाफ नोटिस भेजना है और क्या मांग करनी है, briefly likhein.
                </p>
                <textarea value={naturalInput} onChange={e => setNaturalInput(e.target.value)}
                  rows={4}
                  placeholder={noticeTypes.find(t => t.id === selectedType)?.example || 'Apni samasya yahan likhein...'}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />

                <button onClick={generateNotice} disabled={loading || !naturalInput.trim()}
                  className="mt-3 w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  {loading ? 'Generating...' : 'Generate Legal Notice'}
                </button>
              </div>

              {/* Editor */}
              {generatedNotice && (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300">
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Edit3 size={16} /> Professional Legal Editor
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveNotice} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded flex items-center gap-2">
                        <Save size={14}/> Save
                      </button>
                    </div>
                  </div>

                  <LegalDocumentEditor
                    initialContent={editedNotice || generatedNotice.content || ''}
                    documentTitle={generatedNotice.title || 'Legal Notice'}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <FileText size={48} className="mx-auto mb-3 text-gray-600" />
              <h3 className="text-base font-bold mb-1">Select a Notice Type</h3>
              <p className="text-xs text-gray-500">Left side se notice type chunein</p>
            </div>
          )}
        </div>

        {/* RIGHT: Saved Notices */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-20">
            <h2 className="text-xs font-bold mb-3 flex items-center gap-2 text-gray-300">
              <Save size={14}/> Saved Notices ({notices.length})
            </h2>
            {notices.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic">कोई saved notice नहीं</p>
            ) : (
              <div className="space-y-2">
                {notices.slice(0, 10).map(n => (
                  <div key={n.id} className="p-2 bg-white/5 border border-white/10 rounded-lg text-[10px]">
                    <p className="font-medium text-gray-300 truncate">{n.title}</p>
                    <p className="text-[9px] text-gray-500">{n.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

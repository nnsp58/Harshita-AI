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
  { 
    id: 'cheque_bounce', 
    name: 'Cheque Bounce / चेक बाउंस', 
    icon: '💳', 
    desc: 'Section 138 NI Act notice for dishonoured cheque', 
    example: 'Example: "Mohan Kumar ne ₹50,000 ka cheque diya tha jo bounce ho gaya hai, usko notice bhejna hai"',
    placeholder: 'Enter cheque number, bank name, cheque date, bounce date, amount, sender name, receiver name, and reason for bounce...',
    helpText: 'चेक बाउंस का नोटिस (Section 138 NI Act) भेजने के लिए चेक की तारीख, बैंक का नाम, चेक नंबर और बाउंस होने का कारण (जैसे: Insufficient Funds) दर्ज करें।',
    guidance: 'Tip: Cheque bounce होने के 30 दिनों के भीतर कानूनी नोटिस भेजना अनिवार्य है।'
  },
  { 
    id: 'eviction', 
    name: 'Eviction Notice / बेदखली नोटिस', 
    icon: '🏠', 
    desc: 'Tenant eviction notice', 
    example: 'Example: "Kirayedar Suresh 3 mahine se kiraya nahi de raha hai aur makaan khali nahi kar raha, usko eviction notice bhejo"',
    placeholder: 'Enter tenant name, rented property address, rent amount, period of default, lease start date, and notice period (e.g. 15 days)...',
    helpText: 'किराएदार से घर/दुकान खाली करवाने के लिए मकान मालिक और किराएदार का विवरण, किराए की राशि, डिफ़ॉल्ट की अवधि और नोटिस पीरियड (15/30 दिन) दर्ज करें।',
    guidance: 'Tip: Rental housing act के अनुसार किराएदार को पर्याप्त समय (कम से कम 15 दिन) देना आवश्यक है।'
  },
  { 
    id: 'money_recovery', 
    name: 'Money Recovery / राशी वसूली', 
    icon: '💰', 
    desc: 'Recover money lent to someone', 
    example: 'Example: "Rahul ko maine pichle saal ₹2 Lakh udhar diye the, ab wo wapas nahi kar raha hai, recovery notice bhejo"',
    placeholder: 'Enter borrower name, address, amount lent, lending date, promised return date, agreement details (if any), and interest rate...',
    helpText: 'उधार या बकाया राशि की वसूली के लिए लेनदार और देनदार का नाम, दी गई राशि, तारीख, और भुगतान न करने का विवरण दर्ज करें।',
    guidance: 'Tip: Limitation Act के तहत ऋण वसूली के लिए 3 वर्ष की समय सीमा होती है।'
  },
  { 
    id: 'defamation', 
    name: 'Defamation / मानहानि', 
    icon: '⚠️', 
    desc: 'Stop defamation and claim damages', 
    example: 'Example: "Rakesh ne social media par mere khilaf jhoothe aarop lagaye hain jisse meri image kharab hui hai, ₹5 Lakh ka defamation notice bhejo"',
    placeholder: 'Enter defamer\'s name, platform used (e.g., WhatsApp, Facebook, Newspaper), exact defamatory statement, date of incident, and damages claimed...',
    helpText: 'झूठे आरोपों से हुई मानहानि (Defamation) को रोकने और हर्जाना मांगने के लिए आरोपी का विवरण, सोशल मीडिया पोस्ट/बयान, और हर्जाने की राशि दर्ज करें।',
    guidance: 'Tip: मानहानि के लिए IPC Section 499/500 या सिविल डैमेज क्लेम के तहत नोटिस भेजा जाता है।'
  },
  { 
    id: 'property_dispute', 
    name: 'Property Dispute / सम्पत्ति विवाद', 
    icon: '🏡', 
    desc: 'Property ownership or possession dispute', 
    example: 'Example: "Mera padosi mere khali plot par zabardasti kabza karne ki koshish kar raha hai, usko legal notice bhejna hai"',
    placeholder: 'Enter property details (Plot no, Khasra, boundaries), dispute description (illegal construction, boundary wall breach), and sender/receiver details...',
    helpText: 'भूमि या संपत्ति विवाद, अवैध कब्जे, या सीमा विवाद के संबंध में संपत्ति का विवरण (प्लॉट नंबर, सीमाएं) और विवाद का विवरण दर्ज करें।',
    guidance: 'Tip: संपत्ति विवाद में चतुर्सीमा (पूर्व, पश्चिम, उत्तर, दक्षिण) का स्पष्ट विवरण होना चाहिए।'
  },
  { 
    id: 'recovery_of_dues', 
    name: 'Recovery of Dues / बकाया वसूली', 
    icon: '📋', 
    desc: 'Recover pending dues', 
    example: 'Example: "Company XYZ ne mere pichle 6 mahine ke bill pass nahi kiye hain, total ₹1,50,000 pending hain, payment notice bhejo"',
    placeholder: 'Enter company/person name, pending invoice numbers, invoice dates, total outstanding amount, and services/goods supplied...',
    helpText: 'व्यापारिक या व्यावसायिक बकाया (Outstanding Dues) की वसूली के लिए इनवॉइस नंबर, तारीख, आपूर्ति की गई सेवाओं/सामान और बकाया राशि का विवरण दर्ज करें।',
    guidance: 'Tip: इनवॉइस या वर्क आर्डर की कॉपी संदर्भ के रूप में रखना फायदेमंद होता है।'
  },
  { 
    id: 'breach_contract', 
    name: 'Breach of Contract / अनुबंध भंग', 
    icon: '📄', 
    desc: 'Compensate for contract breach', 
    example: 'Example: "Contractor Mukesh ne building construction ka kaam agreement ke hisab se poora nahi kiya, breach of contract ka notice bhejo"',
    placeholder: 'Enter contractor/firm name, agreement date, contract terms breached, losses suffered, amount paid, and contract value...',
    helpText: 'अनुबंध का उल्लंघन (Breach of Contract) होने पर हर्जाना मांगने या कार्य पूरा करने के लिए अनुबंध की तारीख, शर्तों के उल्लंघन का विवरण दर्ज करें।',
    guidance: 'Tip: लिखित अनुबंध (Written Agreement) के उल्लंघन पर कानूनी नोटिस अत्यधिक प्रभावी होता है।'
  },
  { 
    id: 'consumer_complaint', 
    name: 'Consumer Complaint / उपभोक्ता शिकायत', 
    icon: '🛒', 
    desc: 'File consumer court complaint', 
    example: 'Example: "Maine ABC shop se fridge kharida tha jo defective nikla aur wo log replace nahi kar rahe, consumer court ka notice bhejo"',
    placeholder: 'Enter seller/manufacturer details, purchase bill number, bill date, product/service deficiency details, price paid, and relief sought...',
    helpText: 'खराब उत्पाद या सेवा में कमी (Consumer Complaint) के लिए विक्रेता/कंपनी का विवरण, बिल संख्या, तारीख, उत्पाद का मूल्य और हर्जाने का विवरण दर्ज करें।',
    guidance: 'Tip: उपभोक्ता फोरम (Consumer Forum) में मामला दर्ज करने से पहले 15 दिन का कानूनी नोटिस भेजना आवश्यक है।'
  },
  { 
    id: 'construction_dispute', 
    name: 'Construction Dispute / ठेका विवाद', 
    icon: '🏗️', 
    desc: 'Notice to contractor for default/abandonment', 
    example: 'Example: "Makaan ka theka diya tha deepchand ko, advance 42200/- rupaye lekar theka beech me chhod diya hai. Paise wapas nahi kar raha hai."',
    placeholder: 'Enter contractor name, contract amount, advance paid, date of contract, work location, specific defaults (abandoning work, bad quality), and refund amount...',
    helpText: 'मकान निर्माण या अन्य ठेकेदारी विवाद (Construction Dispute) के लिए ठेकेदार का विवरण, दिया गया एडवांस, अधूरे काम का ब्योरा और नुकसान का दावा दर्ज करें।',
    guidance: 'Tip: ठेका विवादों में एडवांस भुगतान और अधूरे काम की तस्वीरें/सबूत महत्वपूर्ण साक्ष्य होते हैं।'
  }
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
      let aiResponse = res.data?.message || ''

      aiResponse = aiResponse.replace(/^\[[^\]]{0,80}रूटिंग[^\]]{0,80}\]\s*/gi, '').trim()

      let fullNotice
      if (aiResponse.length > 300 || aiResponse.includes('REJECTED')) {
        fullNotice = { title: noticeType.name, content: aiResponse }
      } else {
        fullNotice = generateNoticeTemplate(selectedType, naturalInput, aiResponse)
      }
      
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
      construction_dispute: 'Construction Dispute Notice / ठेका विवाद नोटिस',
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
      construction_dispute: 'Legal Notice for Construction Contract Breach and Refund',
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
              <button key={type.id} onClick={() => {
                  setSelectedType(type.id)
                  setNaturalInput('')
                  setGeneratedNotice(null)
                  setEditedNotice('')
                }}
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

                {/* Dynamic Help Text */}
                <p className="text-[11px] text-gray-400 mb-2 whitespace-pre-line">
                  💡 {noticeTypes.find(t => t.id === selectedType)?.helpText}
                </p>

                {/* Dynamic Guidance Card */}
                <div className="text-[10px] bg-orange-500/10 border border-orange-500/30 rounded p-2.5 mb-3 text-orange-300">
                  <strong>{noticeTypes.find(t => t.id === selectedType)?.name} Guidance:</strong>
                  <p className="mt-1">{noticeTypes.find(t => t.id === selectedType)?.guidance}</p>
                </div>

                <textarea value={naturalInput} onChange={e => setNaturalInput(e.target.value)}
                  rows={4}
                  placeholder={noticeTypes.find(t => t.id === selectedType)?.placeholder || 'Apni samasya yahan likhein...'}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />

                <div className="mt-2 text-[10px] text-gray-500 italic">
                  {noticeTypes.find(t => t.id === selectedType)?.example}
                </div>

                <button onClick={generateNotice} disabled={loading || !naturalInput.trim()}
                  className="mt-3 w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  {loading ? 'Generating Notice...' : 'Generate Legal Notice'}
                </button>
              </div>

              {/* Editor or Rejection UI */}
              {generatedNotice && (generatedNotice.content.startsWith('REJECTED:') || generatedNotice.content.includes('REJECTED:')) ? (
                <div className="bg-orange-950/40 border border-orange-500/40 rounded-xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto text-orange-400 text-lg font-bold">
                    ⚠️
                  </div>
                  <h3 className="text-sm font-bold text-orange-400">Notice Rejected — Classification Mismatch</h3>
                  <div className="text-xs text-gray-300 max-w-md mx-auto whitespace-pre-wrap">
                    {generatedNotice.content.replace('REJECTED:', '').trim()}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {(() => {
                      const lower = generatedNotice.content.toLowerCase();
                      const suggestions = [];
                      if (lower.includes('cheque bounce')) suggestions.push({ id: 'cheque_bounce', name: 'Cheque Bounce Notice' });
                      if (lower.includes('eviction')) suggestions.push({ id: 'eviction', name: 'Eviction Notice' });
                      if (lower.includes('money recovery') || lower.includes('recovery of money')) suggestions.push({ id: 'money_recovery', name: 'Money Recovery Notice' });
                      if (lower.includes('defamation')) suggestions.push({ id: 'defamation', name: 'Defamation Notice' });
                      if (lower.includes('property dispute')) suggestions.push({ id: 'property_dispute', name: 'Property Dispute Notice' });
                      if (lower.includes('recovery of dues') || lower.includes('outstanding dues')) suggestions.push({ id: 'recovery_of_dues', name: 'Recovery of Dues Notice' });
                      if (lower.includes('contract breach') || lower.includes('breach of contract')) suggestions.push({ id: 'breach_contract', name: 'Breach of Contract Notice' });
                      if (lower.includes('consumer complaint') || lower.includes('consumer court')) suggestions.push({ id: 'consumer_complaint', name: 'Consumer Complaint' });
                      if (lower.includes('construction dispute') || lower.includes('theka') || lower.includes('contractor')) suggestions.push({ id: 'construction_dispute', name: 'Construction Dispute' });
                      
                      const isDraftRecommend = lower.includes('affidavit') || lower.includes('gift deed') || lower.includes('partition') || lower.includes('rent agreement') || lower.includes('will') || lower.includes('noc') || lower.includes('power of attorney') || lower.includes('declaration');

                      return (
                        <>
                          {suggestions.map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedType(s.id);
                                setGeneratedNotice(null);
                                setEditedNotice('');
                              }}
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-[11px] transition-all"
                            >
                              Switch to {s.name}
                            </button>
                          ))}
                          {isDraftRecommend && (
                            <button
                              onClick={() => navigate('/legal-draft')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] transition-all"
                            >
                              Go to Legal Draft Studio
                            </button>
                          )}
                          <button
                            onClick={() => setGeneratedNotice(null)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[11px]"
                          >
                            Dismiss
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : generatedNotice && (
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

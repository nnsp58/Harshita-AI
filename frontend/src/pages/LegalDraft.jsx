import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Download, Eye, Save, Trash2, ArrowLeft, X,
  Wand2, Edit3, Printer, Copy, Check
} from 'lucide-react'
import { useStore } from '../store'
import api from '../services/api'
import LegalDocumentEditor from '../components/LegalDocumentEditor'

const documentTypes = [
  { id: 'affidavit', name: 'Affidavit / शपथ पत्र', icon: '📄', desc: 'Sworn statement for legal purposes' },
  { id: 'gift_deed', name: 'Gift Deed / दान विलेख', icon: '🎁', desc: 'Property gift to family member' },
  { id: 'partition_deed', name: 'Partition Deed / बंटवारा', icon: '📑', desc: 'Property division among family' },
  { id: 'noc', name: 'NOC / अनापत्ति प्रमाण', icon: '📝', desc: 'No objection certificate' },
  { id: 'rent_agreement', name: 'Rent Agreement / किराया अनुबंध', icon: '🏠', desc: 'Property rental contract' },
  { id: 'declaration', name: 'Declaration / घोषणा', icon: '✍️', desc: 'General purpose declaration' },
  { id: 'power_of_attorney', name: 'Power of Attorney / मुख्तारनामा', icon: '⚖️', desc: 'Legal authorization' },
  { id: 'will', name: 'Will / वसीयत', icon: '📜', desc: 'Last will and testament' },
]

const STORAGE_KEY = 'harshita_legal_drafts'

function loadDrafts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveDrafts(drafts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

// Local fallback template generator (used only when backend AI fails or returns short text)
function generateTemplateDraft(docType, userInput, aiResponse = '', lang = 'both') {
  const today = new Date().toLocaleDateString('en-IN')
  const input = userInput?.trim() || ''
  const isHi = lang === 'hi'
  const isEn = lang === 'en'
  const showBoth = lang === 'both'

  // ── SMART INTENT: user says "पुत्री / daughter / हर्षिता के नाम" → Gift Deed ──
  const isGiftHint = /पुत्री\s*के\s*नाम|daughter|हर्षिता|पुत्री\s*को\s*दान/i.test(input)
  const docTypeIsGift = isGiftHint || docType === 'gift_deed'

  const titleMap = {
    gift_deed: 'Gift Deed / दान विलेख',
    partition_deed: 'Partition Deed / बंटवारा विलेख',
    noc: 'No Objection Certificate / अनापत्ति प्रमाण पत्र',
    rent_agreement: 'Rent Agreement / किराया अनुबंध',
    affidavit: 'Affidavit / शपथ पत्र',
    declaration: 'Declaration / घोषणा पत्र',
    power_of_attorney: 'Power of Attorney / मुख्तारनामा',
    will: 'Last Will and Testament / वसीयत'
  }
  const title = (docTypeIsGift ? 'gift_deed' : docType) in titleMap
    ? titleMap[docTypeIsGift ? 'gift_deed' : docType]
    : 'Legal Document / कानूनी दस्तावेज़'

  // If backend gave a good long draft, prefer it (strip any routing prefix first)
  let backendDraft = (aiResponse || '').replace(/^\[[^\]]{0,80}रूटिंग[^\]]{0,80}\]\s*/gi, '').trim()
  if (backendDraft.length > 300) {
    return { title, content: backendDraft }
  }

  // ── STRONG ENTITY EXTRACTION (Senior Advocate Level) ─────────────────────
  const cleanInput = input.replace(/\s+/g, ' ').trim()

  // 1. Self Name (Donor)
  let selfName = '[नाम / Name]'
  let selfMatch = cleanInput.match(/मैं\s+([\u0900-\u097F\w\s]+?)\s+पुत्र/i)
  if (!selfMatch) selfMatch = cleanInput.match(/^([\u0900-\u097F\w\s]+?)\s+पुत्र/i)
  if (!selfMatch) selfMatch = cleanInput.match(/(?:मेरा\s+नाम|mera\s+naam|my\s+name|name|naam)\s*[:=\-]?\s*([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:vill|post|district|dist|pita|father|son|daughter|wife|s\/o|d\/o|w\/o|resident|निवासी|पुत्र|पिता|$))/i)
  if (!selfMatch) selfMatch = cleanInput.match(/मेरा\s+नाम\s+(\S+(?:\s+\S+){0,3})\s*है/i)
  if (!selfMatch) selfMatch = cleanInput.match(/मेरे\s+नाम\s+(\S+(?:\s+\S+){0,3})\s*(?:हैं|है)/i)
  if (!selfMatch) selfMatch = cleanInput.match(/नाम\s*[:=\-]?\s*([\u0900-\u097F\w\s]+?)(?:\s+पिता|$)/i)
  if (selfMatch) selfName = selfMatch[1].trim()

  // 2. Father Name
  let fatherName = '[पिता का नाम / Father\'s Name]'
  let fatherMatch = cleanInput.match(/(?:पुत्र| S\/o)\s+(?:श्री\s+)?([\u0900-\u097F\w\s]+?)(?:\s+विलेज|का निवासी|निवासी|हूँ)/i)
  if (!fatherMatch) fatherMatch = cleanInput.match(/पुत्र\s+(?:श्री\s+)?([\u0900-\u097F\w\s]+?)(?:\s+विलेज|\s+का निवासी|निवासी)/i)
  if (!fatherMatch) fatherMatch = cleanInput.match(/(?:पिता\s*का\s*नाम|pita\s*ka\s*naam|father\s*name|father|pita)\s*[:=\-]?\s*([A-Za-z\u0900-\u097F\s]+?)(?:\s+(?:vill|post|district|resident|निवासी|$))/i)
  if (fatherMatch) fatherName = fatherMatch[1].trim()

  // 3. Address
  let address = '[पूरा पता / Full Address]'
  let addrMatch = cleanInput.match(/निवासी\s+(.+?)(?:[।]\s*मैं|मैं अपनी|का निवासी|$)/i)
  if (!addrMatch) {
    addrMatch = cleanInput.match(/(?:vill(?:age)?|village|ग्राम|vill\s+post)\s*(?:and)?\s*post\s+(.+?)(?:\s+(?:dist|district|जिला|अंचल|tehsil|तहसील|pin|पिन|\d{6}|$))/i)
  }
  if (!addrMatch) {
    addrMatch = cleanInput.match(/(?:village|ग्राम|vill|पता|address)\s*[:=\-]?\s*(.+?)(?:pita|father|नाम|name|$)/i)
  }
  if (addrMatch) {
    address = addrMatch[1].trim()
  }

  // 4. Daughter Name
  let daughterName = ''
  let daughterMatch = cleanInput.match(/पुत्री\s+([^\s,，.]+(?:\s+[^\s,，.]+)?)/i)
  if (daughterMatch) daughterName = daughterMatch[1].trim()

  // 5. Aadhaar numbers (if mentioned)
  const donorAadhaarMatch = cleanInput.match(/(?:mera aadhar|my aadhar|आधार)\s*(?:no|number)?\s*[:\-]?\s*(\d{12})/i)
  const doneeAadhaarMatch = cleanInput.match(/(?:putri ka aadhar|daughter aadhar|bety ka aadhar)\s*(?:no|number)?\s*[:\-]?\s*(\d{12})/i)

  // 6. Donee (daughter) address if mentioned
  let doneeAddress = '[Full residential address of the Donee to be provided]'
  const doneeAddrMatch = cleanInput.match(/putri ka pata\s+(.+?)(?:$|\.)/i)
  if (doneeAddrMatch) {
    doneeAddress = doneeAddrMatch[1].trim()
  }

  // ── BUILD TEMPLATE ────────────────────────────────────────────────────────
  let content = ''

  if (docTypeIsGift || docType === 'gift_deed') {
    if (isEn) {
      // Pure English only - clean professional format
      content = `GIFT DEED
═══════════════════════════════════════════════════════════════════

This Gift Deed is made and executed on this ${today} between the following parties:

DONOR:
Mr. ${selfName}, S/o Mr. ${fatherName}, resident of ${address}
(Aadhaar No.: ${donorAadhaarMatch ? donorAadhaarMatch[1] : '[_______________]'})

DONEE:
Ms. ${daughterName || '[Daughter Name]'}, resident of ${doneeAddress}
(Aadhaar No.: ${doneeAadhaarMatch ? doneeAadhaarMatch[1] : '[_______________]'})

PROPERTY & INTENT:
The Donor wishes to gift 50% (half) share of his movable and immovable property to his daughter ${daughterName || '[Daughter Name]'}.

WHEREAS:
1. The Donor is the absolute and lawful owner of the said property.
2. The Donor wishes to gift 50% (half) share of the said property to his daughter out of natural love and affection.

NOW THIS DEED WITNESSES:
1. The Donor hereby transfers 50% (half) undivided share of the said property to the Donee voluntarily and without any consideration.
2. The Donee accepts the said gift.
3. The Donor shall have no further right, title, claim or interest in the gifted share.

WITNESSES:
1. _________________________     2. _________________________

Date: ${today}          Place: ____________

     Donor Signature                    Donee Signature
     Mr. ${selfName}                    ${daughterName || '[Name]'}

═══════════════════════════════════════════════════════════════════
Note: This is a draft. Registration at the Sub-Registrar Office and payment of applicable stamp duty is required for legal validity.
`
    } else {
      // Default bilingual (or Hindi+English)
      content = `दान विलेख / GIFT DEED
═══════════════════════════════════════════════════════════════════

यह दान विलेख आज दिनांक ${today} को निम्नलिखित पक्षकारों के बीच निष्पादित किया जाता है:
This Gift Deed is made and executed on this ${today} between the following parties:

${showBoth || isHi ? 'दानकर्ता / DONOR:' : ''}
${showBoth || isEn ? 'DONOR:' : ''} श्री ${selfName}, पुत्र श्री ${fatherName}, निवासी ${address}
(आधार संख्या: [_______________])

${showBoth || isHi ? 'दानग्रहीता / DONEE:' : ''}
${showBoth || isEn ? 'DONEE:' : ''} ${daughterName || 'बेटी / Daughter: [नाम / Name]'}, निवासी ${address}
(आधार संख्या: [_______________])

विषय / SUBJECT / मुद्दा:
${input}

जबकि / WHEREAS:
1. दानकर्ता उपरोक्त सम्पत्ति का पूर्ण और निरपेक्ष स्वामी है।
   The Donor is the absolute owner of the above property.
2. दानकर्ता अपनी पुत्री ${daughterName || '[Daughter Name]'} के प्रति प्रेम एवं स्नेह के कारण यह दान करना चाहता/चाहती है।
   The Donor wishes to gift this property out of natural love and affection for his daughter.

अब इसलिए और इसके कारण यह विलेख यह साक्ष्य देता है कि / NOW THIS DEED WITNESSES:
1. दानकर्ता उपरोक्त सम्पत्ति का आधा हिस्सा दानग्रहीता को बिना किसी प्रतिफल के स्वेच्छा से दान करता/करती है।
2. दानग्रहीता ने उक्त दान स्वीकार किया है।
3. दानकर्ता की जमीन और सम्पत्ति में दान किए गए आधे हिस्से का अब कोई हक, टाइटल या हित नहीं रहेगा।

साक्षी / WITNESSES:
1. _________________________     2. _________________________

दिनांक / Date: ${today}        स्थान / Place: ____________

     दानकर्ता हस्ताक्षर / Donor Signature      दानग्रहीता हस्ताक्षर / Donee Signature
     श्री ${selfName}                      ${daughterName || '[Name]'}
═══════════════════════════════════════════════════════════════════
नोट: यह ड्राफ्ट है — विधिक मान्यता के लिए नज़दीकी सब-रजिस्टrar कार्यालय में पंजीकरण कराएं।
Note: This is a draft — please register at the nearest Sub-Registrar Office for legal validity.
`
    }
  } else {
    // Generic fallback with parsed name
    selfName = fatherName = address = '[तोड़ें / Please fill]'
    const fm2 = input.match(/(पुत्र|पुत्री)\s+श्री\s+(\w[\w\s]+?)(?:का|को|के)/i)
    if (fm2) fatherName = fm2[2].trim()
    const nm2 = input.match(/^([\u0900-\u097F\s]+?)(?:पुत्र|पुत्री|S\/o|का|Harshita)/i)
    if (nm2) selfName = nm2[1].trim()
    const am2 = input.match(/निवासी\s+(.+?)(?:का निवासी|हूँ|मेँ)/i)
    if (am2) address = am2[1].trim()

    content = `${title}
═══════════════════════════════════════════════════════════════════════════════

दिनांक / Date: ${today}    स्थान / Place: ${address}

${selfName}, पुत्र श्री ${fatherName}, निवासी ${address}

नाम / Name: श्री ${selfName}
पिता का नाम / Father's Name: श्री ${fatherName}
पता / Address: ${address}

विषय / SUBJECT:
${input}

(कृपया बाकी सामग्री भरें / Please fill in the remaining details.)

═══════════════════════════════════════════════════════════════════════════════`
  }

  return { title, content }
}

export default function LegalDraft() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [selectedType, setSelectedType] = useState(null)
  const [naturalInput, setNaturalInput] = useState('')
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [editedDraft, setEditedDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState(loadDrafts)
  const [previewDraft, setPreviewDraft] = useState(null)
  const [language, setLanguage] = useState('both') // 'hi', 'en', 'both'
  const [copied, setCopied] = useState(false)

  // Generate draft using AI
  const generateDraft = async () => {
    if (!selectedType || !naturalInput.trim()) {
      alert('Pehle document type chunein aur details likhein!')
      return
    }
    setLoading(true)

    // Respect user's explicit selection. Only auto-suggest if no type is chosen.
    let effectiveDocType = selectedType
    if (!selectedType) {
      const giftPatterns = /पुत्री|बेटी|daughter|हर्षिता|सम्पत्ति.*(आधा|हिस्सा)|gift deed|दान विलेख|patni ke naam|wife ke naam|sampatti.*(beti|putri)|apni.*(beti|putri).*naam/i
      if (giftPatterns.test(naturalInput)) {
        effectiveDocType = 'gift_deed'
      }
    }

    try {
      const docType = documentTypes.find(t => t.id === effectiveDocType) || documentTypes.find(t => t.id === selectedType)
      const cmd = `Legal draft banao - ${docType.name}: ${naturalInput.trim()}. Language: ${language === 'hi' ? 'Hindi only' : language === 'en' ? 'English only' : 'Bilingual Hindi+English'}`

      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await api.post('/command', { cmd, userId: user?.id || 'demo', context: { skill: 'legal_draft', docType: effectiveDocType, language } })

      // Prefer the actual legal draft returned by backend (LegalDraftSkill)
      let aiResponse = res.data?.message || res.data?.data?.message || res.data?.draft || ''

      // Clean common prefixes added by routing layer
      aiResponse = aiResponse.replace(/^\[रूटिंग सफल\]\s*/, '').trim()

      // Always pass the AI response so that if backend successfully drafts the document, we use it
      const fullDraft = generateTemplateDraft(effectiveDocType, naturalInput, aiResponse, language)
      setGeneratedDraft(fullDraft)
      setEditedDraft(fullDraft.content)
    } catch (e) {
      console.error('AI error, using local template fallback:', e)
      const fullDraft = generateTemplateDraft(effectiveDocType, naturalInput, '', language)
      setGeneratedDraft(fullDraft)
      setEditedDraft(fullDraft.content)
    }
    setLoading(false)
  }

  // Save draft
  const saveDraft = () => {
    if (!generatedDraft) return
    const newDraft = {
      id: Date.now(),
      type: selectedType,
      typeName: documentTypes.find(t => t.id === selectedType)?.name,
      title: generatedDraft.title,
      content: editedDraft || generatedDraft.content,
      naturalInput,
      language,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'completed',
    }
    const updated = [newDraft, ...drafts].slice(0, 50)
    setDrafts(updated)
    saveDrafts(updated)
    alert('✅ Draft saved!')
  }

  // Delete draft
  const deleteDraft = (id) => {
    if (!confirm('Delete this draft?')) return
    const updated = drafts.filter(d => d.id !== id)
    setDrafts(updated)
    saveDrafts(updated)
  }

  // Print draft
  const printDraft = () => {
    if (!previewDraft && !generatedDraft) return
    const content = previewDraft?.content || editedDraft || generatedDraft?.content
    const title = previewDraft?.title || generatedDraft?.title || 'Legal Draft'
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto; }
        h1, h2, h3 { text-align: center; }
        pre { white-space: pre-wrap; font-family: inherit; }
        @media print { body { padding: 20px; } }
      </style></head>
      <body><pre>${content}</pre></body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  // Copy to clipboard
  const copyDraft = () => {
    const content = editedDraft || generatedDraft?.content || ''
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as text file
  const downloadDraft = (draft) => {
    const content = draft?.content || editedDraft || generatedDraft?.content
    const title = draft?.title || generatedDraft?.title || 'legal_draft'
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^\w]+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Legal Draft Studio / कानूनी ड्राफ्ट</h1>
          <p className="text-[10px] text-gray-500">AI से professional legal documents banayein</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Templates */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-20">
          <h2 className="text-xs font-bold mb-3 flex items-center gap-2 text-gray-300">
            <FileText size={14}/> Document Type / दस्तावेज़ प्रकार
          </h2>
          <div className="space-y-1.5">
            {documentTypes.map(type => (
              <button key={type.id} onClick={() => {
                  setSelectedType(type.id)
                  setNaturalInput('')
                  setGeneratedDraft(null)
                  setEditedDraft('')
                }}
                className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                  selectedType === type.id
                    ? 'border-amber-500/50 bg-amber-500/10'
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

        {/* CENTER: Input + Generated Draft */}
        <div className="lg:col-span-6 space-y-4">
          {selectedType ? (
            <>
              {/* AI Input Box */}
              <div className="bg-white/5 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src="/harshita ai.png" alt="Harshita AI" className="w-5 h-5 rounded" />
                    <h3 className="text-sm font-bold">AI से draft banayein</h3>
                    <button 
                      onClick={() => { setSelectedType(null); setNaturalInput(''); setGeneratedDraft(null); setEditedDraft(''); }}
                      className="text-[10px] px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-gray-300"
                    >
                      ← Change Type
                    </button>
                  </div>
                  <div className="flex rounded overflow-hidden text-[10px] border border-white/10">
                    {[
                      { v: 'both', l: 'हिंदी + English' },
                      { v: 'hi', l: 'सिर्फ हिंदी' },
                      { v: 'en', l: 'English only' }
                    ].map(item => (
                      <button
                        key={item.v}
                        onClick={() => setLanguage(item.v)}
                        className={`px-2.5 py-0.5 transition-colors ${
                          language === item.v 
                            ? 'bg-amber-500 text-black font-medium' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {item.l}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mb-2">
                  💡 अपनी बात simple Hindi/English mein likhein. AI poora professional draft banayega.
                </p>

                {/* Dynamic Help Text */}
                {documentTypes.find(t => t.id === selectedType)?.helpText && (
                  <p className="text-[11px] text-gray-400 mb-2 whitespace-pre-line">
                    💡 {documentTypes.find(t => t.id === selectedType)?.helpText}
                  </p>
                )}

                {/* Dynamic Guidance Card */}
                {documentTypes.find(t => t.id === selectedType)?.guidance && (
                  <div className="text-[10px] bg-amber-500/10 border border-amber-500/30 rounded p-2.5 mb-3 text-amber-300">
                    <strong>{documentTypes.find(t => t.id === selectedType)?.name} Guidance:</strong>
                    <p className="mt-1">{documentTypes.find(t => t.id === selectedType)?.guidance}</p>
                  </div>
                )}

                <textarea value={naturalInput} onChange={e => setNaturalInput(e.target.value)}
                  rows={4}
                  placeholder={documentTypes.find(t => t.id === selectedType)?.placeholder || 'Apni samasya yahan likhein...'}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />

                <div className="mt-2 text-[10px] text-gray-500 italic">
                  {documentTypes.find(t => t.id === selectedType)?.example}
                </div>

                <button onClick={generateDraft} disabled={loading || !naturalInput.trim()}
                  className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  {loading ? (
                    <><img src="/harshita ai.png" alt="" className="w-4 h-4 rounded animate-pulse" /> Harshita AI generating draft...</>
                  ) : (
                    <><Wand2 size={16}/> Generate {documentTypes.find(t => t.id === selectedType)?.name.split('/')[0].trim() || 'Professional Draft'}</>
                  )}
                </button>
              </div>

              {/* Editor or Rejection UI */}
              {generatedDraft && (generatedDraft.content.startsWith('REJECTED:') || generatedDraft.content.includes('REJECTED:')) ? (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-400 text-lg font-bold">
                    ⚠️
                  </div>
                  <h3 className="text-sm font-bold text-amber-400">Draft Rejected — Action Mismatch</h3>
                  <div className="text-xs text-gray-300 max-w-md mx-auto whitespace-pre-wrap">
                    {generatedDraft.content.replace('REJECTED:', '').trim()}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {(() => {
                      const lower = generatedDraft.content.toLowerCase();
                      const suggestions = [];
                      if (lower.includes('affidavit')) suggestions.push({ id: 'affidavit', name: 'Affidavit' });
                      if (lower.includes('gift deed')) suggestions.push({ id: 'gift_deed', name: 'Gift Deed' });
                      if (lower.includes('partition')) suggestions.push({ id: 'partition_deed', name: 'Partition Deed' });
                      if (lower.includes('rent agreement') || lower.includes('lease')) suggestions.push({ id: 'rent_agreement', name: 'Rent Agreement' });
                      if (lower.includes('noc') || lower.includes('no objection')) suggestions.push({ id: 'noc', name: 'NOC' });
                      if (lower.includes('will') || lower.includes('testament')) suggestions.push({ id: 'will', name: 'Will' });
                      if (lower.includes('power of attorney') || lower.includes('poa')) suggestions.push({ id: 'power_of_attorney', name: 'Power of Attorney' });
                      if (lower.includes('declaration')) suggestions.push({ id: 'declaration', name: 'Declaration' });

                      const isNoticeRecommend = lower.includes('notice') || lower.includes('cheque bounce') || lower.includes('eviction notice') || lower.includes('recovery notice') || lower.includes('defamation');

                      return (
                        <>
                          {suggestions.map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedType(s.id);
                                setGeneratedDraft(null);
                                setEditedDraft('');
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[11px] transition-all"
                            >
                              Switch to {s.name}
                            </button>
                          ))}
                          {isNoticeRecommend && (
                            <button
                              onClick={() => navigate('/legal-notice')}
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-[11px] transition-all"
                            >
                              Go to Legal Notice Studio
                            </button>
                          )}
                          <button
                            onClick={() => setGeneratedDraft(null)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[11px]"
                          >
                            Dismiss
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : generatedDraft ? (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300">
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Edit3 size={16} /> Professional Legal Editor
                    </div>
                    <button 
                      onClick={saveDraft} 
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded flex items-center gap-2"
                    >
                      <Save size={14}/> Save Draft
                    </button>
                  </div>

                  <LegalDocumentEditor 
                    initialContent={editedDraft || generatedDraft.content || ''}
                    documentTitle={generatedDraft.title || 'Legal Draft'}
                    onChange={setEditedDraft}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <FileText size={48} className="mx-auto mb-3 text-gray-600" />
              <h3 className="text-base font-bold mb-1">Select a Template</h3>
              <p className="text-xs text-gray-500">Left side se document type chunein</p>
            </div>
          )}
        </div>

        {/* RIGHT: Recent Drafts */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-20">
            <h2 className="text-xs font-bold mb-3 flex items-center gap-2 text-gray-300">
              <Save size={14}/> Recent Drafts ({drafts.length})
            </h2>
            {drafts.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic">कोई saved draft नहीं</p>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {drafts.map(draft => (
                  <div key={draft.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5 hover:border-amber-500/30">
                    <p className="text-xs font-medium truncate">{draft.title || draft.typeName}</p>
                    <p className="text-[9px] text-gray-500">{draft.createdAt}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <button onClick={() => setPreviewDraft(draft)} title="Preview"
                        className="flex-1 p-1 bg-amber-500/10 hover:bg-amber-500/20 rounded text-[10px] text-amber-400 flex items-center justify-center gap-1">
                        <Eye size={10}/> View
                      </button>
                      <button onClick={() => downloadDraft(draft)} title="Download"
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded">
                        <Download size={10} className="text-gray-400"/>
                      </button>
                      <button onClick={() => deleteDraft(draft.id)} title="Delete"
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded">
                        <Trash2 size={10} className="text-red-400"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewDraft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewDraft(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white text-black rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-gray-800">{previewDraft.title || previewDraft.typeName}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadDraft(previewDraft)} className="p-2 hover:bg-gray-100 rounded">
                    <Download size={16} className="text-gray-600"/>
                  </button>
                  <button onClick={() => { setEditedDraft(previewDraft.content); setGeneratedDraft({content: previewDraft.content, title: previewDraft.title}); setPreviewDraft(null); printDraft() }}
                    className="p-2 hover:bg-gray-100 rounded">
                    <Printer size={16} className="text-gray-600"/>
                  </button>
                  <button onClick={() => setPreviewDraft(null)} className="p-2 hover:bg-gray-100 rounded">
                    <X size={16} className="text-gray-600"/>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">{previewDraft.content}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

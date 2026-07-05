import { useState, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, MapPin, Plus, Trash2, Edit3, Check, X,
  ChevronRight, ChevronLeft, Printer, Eye, ArrowLeft, Search
} from 'lucide-react'
import {
  STATES, UP_DISTRICTS, DESIGNATIONS, PAY_LEVELS,
  YEARS, DUTY_PURPOSES, TRAVEL_MODES, VEHICLE_TYPES,
  UNIT_TYPES, getUnitsForDistrict
} from '../data/upPoliceData'

const STEPS = [
  { id: 'personal', label: 'Personal Info', labelHi: 'व्यक्तिगत विवरण', icon: User },
  { id: 'journeys', label: 'Journeys', labelHi: 'यात्रा विवरण', icon: MapPin },
  { id: 'preview', label: 'Preview', labelHi: 'प्रीव्यू', icon: Eye },
]

function getEmptyJourney() {
  return {
    date: '',
    endDate: '',
    departureTime: '',
    arrivalTime: '',
    from: '',
    to: '',
    purpose: 'ड्यूटी',
    travelMode: 'बस से',
    vehicleType: 'सरकारी',
    distance: '',
    fare: '',
    gdNumber: '',
    daDays: ''   // NEW: Manual DA days override (optional)
  }
}

// Convert YYYY-MM-DD → DD/MM/YYYY for display
function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return ''
  // Handle YYYY-MM-DD (from HTML date input)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
  // Handle DD-MM-YYYY → DD/MM/YYYY
  const dashMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (dashMatch) return `${dashMatch[1]}/${dashMatch[2]}/${dashMatch[3]}`
  return dateStr
}

// Format time → 4-digit military format (800 → 0800, 8 → 0800, 8:30 → 0830)
function formatTimeHHMM(timeStr) {
  if (!timeStr) return ''
  const s = String(timeStr).trim()
  // Already 4-digit format like "0800" or "20:30"
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':')
    return `${h.padStart(2, '0')}${m.padStart(2, '0')}`
  }
  // Pure digits like "800" or "8" or "2030"
  if (/^\d+$/.test(s)) {
    if (s.length <= 2) return s.padStart(2, '0') + '00'
    if (s.length === 3) return '0' + s
    if (s.length === 4) return s
  }
  return s
}

// Calculate fare from distance × mileage rate
function calculateFare(distance, rate) {
  const d = parseFloat(distance) || 0
  const r = parseFloat(rate) || 0
  if (!d || !r) return ''
  const fare = d * r
  // Round to nearest rupee
  return String(Math.round(fare))
}

// Calculate days between two dates (inclusive — start day counts as 1)
// Removed unused calculateDays function

// New: Smart DA Eligible Days calculation (User's confirmed rule)
// - Same day journey → 1 day
// - Multi-day journey → inclusive count (15 to 18 = 4 days)
// Travel days (going + returning) bhi count honge
function calculateDAEligibleDays(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start) || isNaN(end)) return 0

  // Same day duty → 1 din
  if (start.getTime() === end.getTime()) {
    return 1
  }

  // Multi-day duty → inclusive (start se end tak pura count)
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 1
}

// Calculate DA for a journey
// Priority: 
// 1. Manual daDays (user ne khud bhara ho) → Highest priority
// 2. Smart inclusive calculation (default behaviour)
// 3. Old inclusive method (fallback)
function calculateDA(journey, daRate) {
  const rate = parseFloat(daRate) || 0

  // 1. Manual override (sabse upar)
  const manual = parseInt(journey.daDays)
  if (!isNaN(manual) && manual >= 0) {
    return Math.round(manual * rate)
  }

  // 2. Smart calculation (aapke rule ke hisaab se)
  const smartDays = calculateDAEligibleDays(journey.date, journey.endDate)
  return Math.round(smartDays * rate)
}

// English to Hindi translation for common Police/place terms
const HINDI_TRANSLATIONS = {
  // Police units
  'police line': 'पुलिस लाइन', 'policeline': 'पुलिस लाइन',
  'reserve police line': 'रिज़र्व पुलिस लाइन', 'reserve line': 'रिज़र्व पुलिस लाइन',
  'kotwali': 'कोतवाली', 'thana': 'थाना', 'pac': 'PAC',
  'mahila thana': 'महिला थाना', 'women police': 'महिला थाना',
  'police station': 'पुलिस स्टेशन',
  // Common districts/places
  'kannauj': 'कन्नौज', 'kanpur': 'कानपुर', 'lucknow': 'लखनऊ',
  'jhansi': 'झाँसी', 'agra': 'आगरा', 'meerut': 'मेरठ',
  'varanasi': 'वाराणसी', 'gorakhpur': 'गोरखपुर', 'prayagraj': 'प्रयागराज',
  'ayodhya': 'अयोध्या', 'noida': 'नोएडा', 'ghaziabad': 'गाज़ियाबाद',
  'aligarh': 'अलीगढ़', 'mathura': 'मथुरा', 'bareilly': 'बरेली',
  'moradabad': 'मुरादाबाद', 'saharanpur': 'सहारनपुर',
  // Specific places (Kannauj area)
  'saurikh': 'सौरीख', 'sourikh': 'सौरीख', 'saurix': 'सौरीख',
  'chhibramau': 'छिबरामऊ', 'chibramau': 'छिबरामऊ',
  'tirwa': 'तिर्वा', 'gursahaiganj': 'गुरसहायगंज',
  'jalalabad': 'जलालाबाद', 'sakrawa': 'सकरावा', 'indergarh': 'इंदरगढ़',
  'haseran': 'हसेरन', 'hasanganj': 'हसनगंज', 'thathiya': 'ठठिया',
  // Common terms
  'bus stand': 'बस स्टैंड', 'court': 'कोर्ट', 'nyayalaya': 'न्यायालय',
  'collectorate': 'कलेक्ट्रेट', 'office': 'कार्यालय',
  'sp office': 'SP कार्यालय', 'dm office': 'DM कार्यालय',
  'orai': 'उरई', 'farrukhabad': 'फर्रुखाबाद', 'fatehgarh': 'फतेहगढ़',
  'unnao': 'उन्नाव', 'hardoi': 'हरदोई', 'sitapur': 'सीतापुर',
  // Duty types
  'vvip duty': 'VVIP ड्यूटी', 'qrt duty': 'QRT ड्यूटी',
  'command duty': 'कमान ड्यूटी', 'gunner duty': 'गनर ड्यूटी',
  'patrol': 'गश्त', 'training': 'प्रशिक्षण', 'escort': 'एस्कॉर्ट',
  'urja mantri': 'ऊर्जा मंत्री', 'awas suraksha': 'आवास सुरक्षा',
  'cm duty': 'मुख्यमंत्री ड्यूटी', 'mantri ji': 'मंत्री जी',
  'pilot car': 'पाइलट कार', 'reserve duty': 'रिज़र्व ड्यूटी',
  'naka duty': 'नाका ड्यूटी', 'jail duty': 'जेल ड्यूटी',
  'mela duty': 'मेला ड्यूटी', 'election duty': 'चुनाव ड्यूटी',
  'court peshi': 'कोर्ट पेशी', 'bandobast': 'बंदोबस्त',
}

// Auto-transliterate/translate English to Hindi
function autoTranslate(text) {
  if (!text) return text
  let result = text

  // Try whole-string match first (case-insensitive)
  const lower = result.toLowerCase().trim()
  if (HINDI_TRANSLATIONS[lower]) return HINDI_TRANSLATIONS[lower]

  // Replace each known English term with Hindi (longest first to handle multi-word)
  const sortedKeys = Object.keys(HINDI_TRANSLATIONS).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(regex, HINDI_TRANSLATIONS[key])
  }
  return result
}

// Convert number to Hindi words (for amount in words)
function numberToHindiWords(num) {
  num = parseInt(num) || 0
  if (num === 0) return 'शून्य'

  const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ',
    'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पन्द्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस']
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे']

  const twoDigit = (n) => {
    if (n < 20) return ones[n]
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  }

  const threeDigit = (n) => {
    let result = ''
    if (n >= 100) result += ones[Math.floor(n / 100)] + ' सौ '
    const rem = n % 100
    if (rem) result += twoDigit(rem)
    return result.trim()
  }

  let result = ''
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = num % 1000

  if (crore) result += threeDigit(crore) + ' करोड़ '
  if (lakh) result += threeDigit(lakh) + ' लाख '
  if (thousand) result += threeDigit(thousand) + ' हज़ार '
  if (hundred) result += threeDigit(hundred)

  return result.trim()
}

// ===== PROFILE MANAGEMENT (localStorage) =====
const PROFILES_KEY = 'harshita_tada_profiles'
const LAST_PROFILE_KEY = 'harshita_tada_last_profile'
const JOURNEY_HISTORY_KEY = 'harshita_tada_journey_history'

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]') } catch { return [] }
}
function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}
function getLastProfileId() {
  return localStorage.getItem(LAST_PROFILE_KEY) || ''
}
function setLastProfileId(id) {
  localStorage.setItem(LAST_PROFILE_KEY, id)
}

// Journey history — per profile (PNO key)
function loadJourneyHistory(pno) {
  try {
    const all = JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || '{}')
    return all[pno] || []
  } catch { return [] }
}
function saveJourneyToHistory(pno, journey) {
  if (!pno || !journey.from || !journey.to) return
  try {
    const all = JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || '{}')
    const userHistory = all[pno] || []
    // Avoid duplicates: check if same from+to+distance combination exists
    const exists = userHistory.some(j =>
      j.from === journey.from && j.to === journey.to &&
      j.distance === journey.distance && j.fare === journey.fare
    )
    if (!exists) {
      userHistory.unshift({ ...journey, savedAt: Date.now() })
      // Keep last 100 unique journeys
      all[pno] = userHistory.slice(0, 100)
      localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(all))
    }
  } catch (e) { console.error('Save journey history failed:', e) }
}

// Get unique places from history for autocomplete
function getPlacesFromHistory(pno) {
  const history = loadJourneyHistory(pno)
  const places = new Set()
  history.forEach(j => { if (j.from) places.add(j.from); if (j.to) places.add(j.to) })
  return Array.from(places)
}

// Find matching journey in history (for distance/fare auto-suggest)
function findJourneyMatch(pno, from, to) {
  const history = loadJourneyHistory(pno)
  return history.find(j => j.from === from && j.to === to)
}

// Get reverse journey suggestion (B → A from last A → B)
function getReverseSuggestion(pno, lastJourney) {
  if (!lastJourney) return null
  const history = loadJourneyHistory(pno)
  // Find a previous journey going B → A
  const reverse = history.find(j => j.from === lastJourney.to && j.to === lastJourney.from)
  if (reverse) return reverse
  // Or just create a reverse with same distance/fare
  return {
    from: lastJourney.to,
    to: lastJourney.from,
    distance: lastJourney.distance,
    fare: lastJourney.fare,
    purpose: lastJourney.purpose,
    travelMode: lastJourney.travelMode,
    vehicleType: lastJourney.vehicleType,
  }
}

export default function TADANaksha() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [profiles, setProfiles] = useState(loadProfiles)
  const [activeProfileId, setActiveProfileId] = useState(getLastProfileId)
  const [info, setInfo] = useState(() => {
    // Auto-fill from last used profile
    const lastId = getLastProfileId()
    const saved = loadProfiles().find(p => p.id === lastId)
    if (saved) return { ...saved.info }
    return {
      name:'', designation:'', gradePay:'', basicPay:'', payLevel:'',
      pno:'', thana:'', district:'', state:'UP', year: String(new Date().getFullYear()),
      bankName:'', accountNo:'', ifsc:'',
      mileageRate: '0.30', daRate: '',
    }
  })
  const [journeys, setJourneys] = useState([])
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState(getEmptyJourney())
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Save current info as profile
  const saveProfile = () => {
    if (!info.name || !info.pno) return
    const id = info.pno || `profile_${Date.now()}`
    const existing = profiles.findIndex(p => p.id === id)
    const profile = { id, info: { ...info }, savedAt: new Date().toISOString() }
    let updated
    if (existing >= 0) {
      updated = [...profiles]; updated[existing] = profile
    } else {
      updated = [...profiles, profile]
    }
    setProfiles(updated)
    saveProfiles(updated)
    setActiveProfileId(id)
    setLastProfileId(id)
  }

  // Load a profile
  const loadProfile = (id) => {
    const p = profiles.find(x => x.id === id)
    if (p) {
      setInfo({ ...p.info, year: String(new Date().getFullYear()) })
      setActiveProfileId(id)
      setLastProfileId(id)
      setShowProfileMenu(false)
    }
  }

  // Delete a profile
  const deleteProfile = (id) => {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    saveProfiles(updated)
    if (activeProfileId === id) setActiveProfileId('')
  }

  // Start fresh (dusre ka naksha bharna)
  const newBlankProfile = () => {
    setInfo({
      name:'', designation:'', gradePay:'', basicPay:'', payLevel:'',
      pno:'', thana:'', district:'', state:'UP', year: String(new Date().getFullYear()),
      bankName:'', accountNo:'', ifsc:'',
      mileageRate: '0.30', daRate: '',
    })
    setJourneys([])
    setActiveProfileId('')
    setShowProfileMenu(false)
  }

  const addOrUpdate = () => {
    if (!form.date || !form.from || !form.to) return
    // Normalize: format time + auto-translate places
    const normalized = {
      ...form,
      departureTime: formatTimeHHMM(form.departureTime),
      arrivalTime: formatTimeHHMM(form.arrivalTime),
      from: autoTranslate(form.from),
      to: autoTranslate(form.to),
      // Auto-calculate fare from mileage rate if not manually set
      fare: form.fare || calculateFare(form.distance, info.mileageRate),
    }
    if (editIdx !== null) {
      const u = [...journeys]; u[editIdx] = normalized; setJourneys(u); setEditIdx(null)
    } else {
      setJourneys([...journeys, normalized])
    }
    if (info.pno) saveJourneyToHistory(info.pno, normalized)
    setForm(getEmptyJourney())
  }

  // Add return journey (reverse of last entry, user fills time later)
  const addReturnJourney = () => {
    const last = journeys[journeys.length - 1]
    if (!last) return

    // Calculate return date based on DA days or endDate
    let returnDateStr = last.endDate || last.date;
    const manualDays = parseInt(last.daDays);
    
    if (!isNaN(manualDays) && manualDays > 0 && last.date) {
      const d = new Date(last.date);
      if (!isNaN(d.getTime())) {
        // e.g. 3rd + 5 days = 3,4,5,6,7 (Return on 7th, so + 4)
        d.setDate(d.getDate() + manualDays - 1);
        
        // Handle timezone offset to ensure correct YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        returnDateStr = `${year}-${month}-${day}`;
      }
    }

    const returnJourney = {
      date: returnDateStr,
      departureTime: '', // user will fill
      arrivalTime: '',
      from: last.to,
      to: last.from,
      purpose: last.purpose,
      travelMode: last.travelMode,
      vehicleType: last.vehicleType,
      distance: last.distance,
      fare: last.fare,
      gdNumber: '', // different GD for return
      daDays: '0',  // return journey should not double count DA
      isReturn: true, // flag to disable input
    }
    // Set form to allow user to fill time, instead of adding immediately
    setForm(returnJourney)
  }
  const edit = (i) => { setForm({ ...journeys[i] }); setEditIdx(i); setStep(1) }
  const del = (i) => { setJourneys(journeys.filter((_,idx)=>idx!==i)); if(editIdx===i){setEditIdx(null);setForm(getEmptyJourney())} }
  const totalDist = journeys.reduce((s,j)=>s+(parseInt(j.distance)||0),0)
  const totalFare = journeys.reduce((s,j)=>s+(parseInt(j.fare)||0),0)
  const getEffectiveDays = (j) => {
    const manual = parseInt(j.daDays)
    if (!isNaN(manual) && manual >= 0) return manual
    return calculateDAEligibleDays(j.date, j.endDate)
  }
  const totalDays = journeys.reduce((s,j)=>s+getEffectiveDays(j),0)
  const totalDA = journeys.reduce((s,j)=>s+calculateDA(j, info.daRate),0)
  const grandTotal = totalFare + totalDA

  // Check if user has used manual DA days in any journey
  const hasManualDA = journeys.some(j => {
    const m = parseInt(j.daDays)
    return !isNaN(m) && m >= 0
  })

  const handleDesignationChange = (val) => {
    const d = DESIGNATIONS.find(x => x.value === val)
    if (d) {
      setInfo({ ...info, designation: d.value, payLevel: d.payLevel, gradePay: d.gradePay, basicPay: d.basicPay })
    } else {
      setInfo({ ...info, designation: val })
    }
  }

  const thanaOptions = useMemo(() => {
    const units = getUnitsForDistrict(info.district)
    return units.map(u => ({ value: u.name, label: `${u.name}`, type: u.type }))
  }, [info.district])

  // Auto-save draft when upgrade is approaching (triggered by UpgradeNotification)
  useEffect(() => {
    const handleAutoSave = () => {
      try {
        const draft = {
          info, journeys, form, step, editIdx,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem('harshita_tada_draft', JSON.stringify(draft))
        console.log('💾 TA-DA naksha draft auto-saved before upgrade')
      } catch (e) { console.error('Auto-save failed:', e) }
    }
    window.addEventListener('harshita-auto-save', handleAutoSave)
    return () => window.removeEventListener('harshita-auto-save', handleAutoSave)
  }, [info, journeys, form, step, editIdx])

  // Resume draft on mount (if previously saved before upgrade)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('harshita_tada_draft')
      if (saved) {
        const draft = JSON.parse(saved)
        const ageMin = (Date.now() - new Date(draft.savedAt).getTime()) / 60000
        // Only restore if draft is fresh (< 2 hours old)
        if (ageMin < 120 && draft.journeys?.length > 0) {
          if (confirm(`पिछला draft मिला (${draft.journeys.length} entries, ${Math.round(ageMin)} min पहले). Resume करें?`)) {
            setTimeout(() => {
              setInfo(draft.info || info)
              setJourneys(draft.journeys || [])
              setForm(draft.form || getEmptyJourney())
              setStep(draft.step || 0)
              setEditIdx(draft.editIdx ?? null)
            }, 0)
          }
          localStorage.removeItem('harshita_tada_draft')
        }
      }
    } catch (e) {
      console.error('Failed to load draft', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">TA-DA नक्शा {info.name ? `— ${info.name}` : ''}</h1>
          <p className="text-[10px] text-gray-500">Step {step+1}/3: {STEPS[step].labelHi}</p>
        </div>

        {/* Profile buttons */}
        <div className="flex items-center gap-2">
          {/* Save profile */}
          <button onClick={saveProfile} disabled={!info.name}
            title="Save profile for auto-fill next time"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-medium hover:bg-emerald-500/30 disabled:opacity-30">
            <Check size={11}/> Save
          </button>

          {/* Switch profile / New */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:text-white hover:border-amber-500/30">
              <User size={11}/> <span className="hidden sm:inline">Profiles</span>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-[#1a1b26] border border-white/20 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Saved Profiles / सेव्ड प्रोफाइल</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {profiles.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-500 italic text-center">Koi profile save nahi hai</p>
                    ) : profiles.map((p) => (
                      <div key={p.id} className={`flex items-center gap-2 px-3 py-2 hover:bg-white/5 ${activeProfileId === p.id ? 'bg-amber-500/10' : ''}`}>
                        <button onClick={() => loadProfile(p.id)} className="flex-1 text-left">
                          <p className="text-xs text-white font-medium">{p.info.name}</p>
                          <p className="text-[9px] text-gray-500">{p.info.designation} | PNO: {p.info.pno}</p>
                        </button>
                        <button onClick={() => deleteProfile(p.id)} className="p-1 hover:bg-red-500/20 rounded">
                          <Trash2 size={10} className="text-red-400"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-2">
                    <button onClick={newBlankProfile}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-medium hover:bg-amber-500/30">
                      <Plus size={11}/> Dusre ka naksha bharein (New)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="hidden md:flex items-center gap-1">
          {STEPS.map((s,i) => (
            <button key={s.id} onClick={() => setStep(i)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                step===i ? 'bg-amber-500 text-black' : i<step ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
              }`}>
              <s.icon size={11}/> {s.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main: Top-Bottom Layout — Input Upar, Preview Neeche */}
      <div className="flex-1 overflow-y-auto">
        {/* TOP: Input Section */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          {step === 0 && <PersonalStep info={info} setInfo={setInfo} onDesignationChange={handleDesignationChange} thanaOptions={thanaOptions} profiles={profiles} onLoadProfile={loadProfile} />}
          {step === 1 && (
            <JourneyStep form={form} setForm={setForm} editIdx={editIdx}
              onAdd={addOrUpdate} onCancel={() => { setEditIdx(null); setForm(getEmptyJourney()) }}
              pno={info.pno} journeys={journeys} mileageRate={info.mileageRate}
              onAddReturn={addReturnJourney} />
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2"><Printer size={18} className="text-amber-400"/> Print / प्रिंट</h2>
              <p className="text-sm text-gray-400">Neeche preview check karein, phir Print button dabayein.</p>
              <button onClick={() => window.print()} className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                <Printer size={18}/> Print Naksha (Legal Landscape)
              </button>
            </div>
          )}
          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setStep(Math.max(0, step-1))} disabled={step===0}
              className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronLeft size={14}/> Back
            </button>
            <span className="text-[10px] text-gray-600">{journeys.length} entries</span>
            <button onClick={() => { setStep(Math.min(2, step+1)); if(step===0 && info.name) saveProfile() }} disabled={step===2}
              className="flex items-center gap-1 px-4 py-2 bg-amber-500 rounded-lg text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-30">
              Next <ChevronRight size={14}/>
            </button>
          </div>
        </div>

        {/* BOTTOM: Live Preview (always visible) */}
        <div className="bg-[#0a0b10] border-t border-white/10">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live Preview — Legal Landscape (356 × 216 mm)</span>
            <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold hover:bg-amber-500/30">
              <Printer size={11}/> Print
            </button>
          </div>
          {/* Scrollable preview container with gray background to show page edges */}
          <div className="bg-gray-900 p-6 overflow-x-auto">
            <NakshaPreview info={info} journeys={journeys} onEdit={edit} onDelete={del}
              totalDist={totalDist} totalFare={totalFare}
              totalDays={totalDays} totalDA={totalDA} grandTotal={grandTotal}
              hasManualDA={hasManualDA} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== STEP 1: Personal Details with Dropdowns =====
function PersonalStep({ info, setInfo, onDesignationChange, thanaOptions, profiles, onLoadProfile }) {
  const f = (key) => (e) => setInfo({ ...info, [key]: e.target.value })

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold flex items-center gap-2"><User size={18} className="text-amber-400"/> Personal Details / व्यक्तिगत विवरण</h2>

      {/* Quick load from saved profiles */}
      {profiles && profiles.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-[10px] text-amber-400 font-medium mb-2">⚡ Quick Fill — Saved profile se bharein:</p>
          <div className="flex flex-wrap gap-2">
            {profiles.map(p => (
              <button key={p.id} onClick={() => onLoadProfile(p.id)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-300 hover:border-amber-500/30 hover:text-white">
                {p.info.name} ({p.info.pno})
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">Dropdown se select karein — details auto-save hongi!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="नाम / Name *" value={info.name} onChange={f('name')} placeholder="Rohit Kumar" />

        <SearchSelect label="पदनाम / Designation *" value={info.designation}
          onChange={(v) => onDesignationChange(v)}
          options={DESIGNATIONS.map(d => ({ value: d.value, label: d.label }))}
          placeholder="Select designation..." />

        <Input label="PNO नंबर *" value={info.pno} onChange={f('pno')} placeholder="12345" />

        <SearchSelect label="Pay Level / वेतन स्तर" value={info.payLevel}
          onChange={(v) => {
            const pl = PAY_LEVELS.find(p => p.value === v)
            setInfo({ ...info, payLevel: v, gradePay: pl?.gradePay || info.gradePay })
          }}
          options={PAY_LEVELS.map(p => ({ value: p.value, label: p.label }))}
          placeholder="Select pay level..." />

        <Input label="Basic Pay / मूल वेतन (₹)" value={info.basicPay} onChange={f('basicPay')} placeholder="25500" />
        <Input label="Grade Pay / ग्रेड पे (₹)" value={info.gradePay} onChange={f('gradePay')} placeholder="2400" />

        <SearchSelect label="राज्य / State" value={info.state}
          onChange={(v) => setInfo({ ...info, state: v, district: '', thana: '' })}
          options={STATES.map(s => ({ value: s.value, label: s.label }))}
          placeholder="Select state..." />

        <SearchSelect label="जिला / District *" value={info.district}
          onChange={(v) => setInfo({ ...info, district: v, thana: '' })}
          options={UP_DISTRICTS.map(d => ({ value: d, label: d }))}
          placeholder="Search district..." />

        <SearchSelect label="थाना/कोतवाली/पुलिस लाइन *" value={info.thana}
          onChange={(v) => setInfo({ ...info, thana: v })}
          options={thanaOptions}
          placeholder={info.district ? "Search unit..." : "Pehle district chunein"} />

        <SearchSelect label="वर्ष / Year" value={info.year}
          onChange={(v) => setInfo({ ...info, year: v })}
          options={YEARS}
          placeholder="Select year..." />
      </div>

      <h3 className="text-sm font-bold mt-4 pt-4 border-t border-white/10">🏦 Bank Details / बैंक विवरण</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Bank Name" value={info.bankName} onChange={f('bankName')} placeholder="SBI / PNB" />
        <Input label="Account No." value={info.accountNo} onChange={f('accountNo')} placeholder="1234567890" />
        <Input label="IFSC Code" value={info.ifsc} onChange={f('ifsc')} placeholder="SBIN0001234" />
      </div>

      {/* Mileage / DA Rate */}
      <h3 className="text-sm font-bold mt-4 pt-4 border-t border-white/10">💰 Mileage & DA Rate / दर सूची</h3>
      <p className="text-[10px] text-gray-500">Apni rank ke हिसाब से per km mileage rate aur DA rate bharein. Yeh rate fare auto-calculate karne mein use hogi.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Mileage Rate (₹/km) — माइलेज दर" value={info.mileageRate} onChange={f('mileageRate')} placeholder="0.30" type="number" />
        <Input label="DA Rate (₹/day) — दैनिक भत्ता दर" value={info.daRate} onChange={f('daRate')} placeholder="500" type="number" />
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[10px] text-blue-300">
        ℹ️ <b>Common rates (UP Police):</b> Constable/HC: ₹0.30-0.50/km | SI/Inspector: ₹0.50-1.00/km | DA: ₹150-500/day
      </div>
    </div>
  )
}

// ===== STEP 2: Journey Entry with Dropdowns =====
function JourneyStep({ form, setForm, editIdx, onAdd, onCancel, pno, journeys, mileageRate, onAddReturn }) {
  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // Memory: places used in past + current naksha
  const placeOptions = useMemo(() => {
    const fromHistory = pno ? getPlacesFromHistory(pno) : []
    const fromCurrent = journeys.flatMap(j => [j.from, j.to]).filter(Boolean)
    const all = new Set([...fromHistory, ...fromCurrent])
    return Array.from(all).map(p => ({ value: p, label: p }))
  }, [pno, journeys])

  // Last journey from current naksha (for reverse suggestion)
  const lastJourney = journeys.length > 0 ? journeys[journeys.length - 1] : null

  // Auto-fill distance/fare when from+to match a previous journey
  const handleFromTo = (key) => (val) => {
    const updated = { ...form, [key]: val }
    if (updated.from && updated.to && pno) {
      const match = findJourneyMatch(pno, updated.from, updated.to)
      if (match && (!form.distance || !form.fare)) {
        if (!updated.distance) updated.distance = String(match.distance || '')
        if (!updated.fare) updated.fare = String(match.fare || '')
        if (!updated.purpose || updated.purpose === 'ड्यूटी') updated.purpose = match.purpose || updated.purpose
        if (!updated.travelMode || updated.travelMode === 'बस से') updated.travelMode = match.travelMode || updated.travelMode
        if (!updated.vehicleType || updated.vehicleType === 'सरकारी') updated.vehicleType = match.vehicleType || updated.vehicleType
      }
    }
    setForm(updated)
  }

  // Quick reverse suggestion
  const useReverseRoute = () => {
    if (!lastJourney) return
    const reverse = getReverseSuggestion(pno, lastJourney)
    if (reverse) {
      setForm({
        ...form,
        from: reverse.from,
        to: reverse.to,
        distance: String(reverse.distance || ''),
        fare: String(reverse.fare || ''),
        purpose: reverse.purpose || form.purpose,
        travelMode: reverse.travelMode || form.travelMode,
        vehicleType: reverse.vehicleType || form.vehicleType,
      })
    }
  }

  // Repeat last journey (just change date)
  const repeatLastJourney = () => {
    if (!lastJourney) return
    setForm({
      ...form,
      from: lastJourney.from,
      to: lastJourney.to,
      distance: String(lastJourney.distance || ''),
      fare: String(lastJourney.fare || ''),
      purpose: lastJourney.purpose,
      travelMode: lastJourney.travelMode,
      vehicleType: lastJourney.vehicleType,
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold flex items-center gap-2">
        <MapPin size={18} className="text-amber-400"/>
        {editIdx !== null ? `Edit Entry #${editIdx+1}` : 'Add Journey / यात्रा जोड़ें'}
      </h2>

      {/* Smart Suggestions Bar */}
      {lastJourney && editIdx === null && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-[10px] text-amber-400 font-medium mb-2">⚡ Smart Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={useReverseRoute}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-300 hover:border-amber-500/30 hover:text-white">
              🔄 Reverse: {lastJourney.to} → {lastJourney.from}
            </button>
            <button onClick={repeatLastJourney}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-300 hover:border-amber-500/30 hover:text-white">
              🔁 Repeat: {lastJourney.from} → {lastJourney.to}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">Ek-ek journey add karein — dropdown se fast select. Past journeys auto-suggest hongi.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input label="दिनांक / Date * (DD/MM/YYYY)" value={form.date} onChange={f('date')} placeholder="DD/MM/YYYY" type="date" />
        <Input label="प्रस्थान समय (Hrs)" value={form.departureTime}
          onChange={f('departureTime')}
          onBlur={(e) => setForm({ ...form, departureTime: formatTimeHHMM(e.target.value) })}
          placeholder="0800 या 800" />
        <Input label="आगमन समय (Hrs)" value={form.arrivalTime}
          onChange={f('arrivalTime')}
          onBlur={(e) => setForm({ ...form, arrivalTime: formatTimeHHMM(e.target.value) })}
          placeholder="2030 या 8:30" />
      </div>

      {/* NEW: Manual DA Days override — as per user requirement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            label="DA Days (DA कितने दिनों का) — Optional"
            value={form.daDays}
            onChange={f('daDays')}
            placeholder="e.g. 4"
            type="number"
            disabled={form.isReturn}
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Sirf stay days ka DA chahiye to yahan number likho. <br />
            Khali chhodo → dates se auto calculate hoga.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <SearchSelectCreatable label="कहाँ से / From *" value={form.from}
            onChange={handleFromTo('from')}
            onBlur={() => setForm(prev => ({ ...prev, from: autoTranslate(prev.from) }))}
            options={placeOptions}
            placeholder="थाना सौरीख / Police line (auto convert)" />
          {form.from && autoTranslate(form.from) !== form.from && (
            <button type="button"
              onClick={() => setForm(prev => ({ ...prev, from: autoTranslate(prev.from) }))}
              className="mt-1 w-full text-left px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 hover:bg-amber-500/20 flex items-center justify-between">
              <span>हिंदी में: <b>{autoTranslate(form.from)}</b></span>
              <span className="text-amber-400">क्लिक करें ↻</span>
            </button>
          )}
        </div>
        <div>
          <SearchSelectCreatable label="कहाँ तक / To *" value={form.to}
            onChange={handleFromTo('to')}
            onBlur={() => setForm(prev => ({ ...prev, to: autoTranslate(prev.to) }))}
            options={placeOptions}
            placeholder="छिबरामऊ / Chhibramau (auto convert)" />
          {form.to && autoTranslate(form.to) !== form.to && (
            <button type="button"
              onClick={() => setForm(prev => ({ ...prev, to: autoTranslate(prev.to) }))}
              className="mt-1 w-full text-left px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 hover:bg-amber-500/20 flex items-center justify-between">
              <span>हिंदी में: <b>{autoTranslate(form.to)}</b></span>
              <span className="text-amber-400">क्लिक करें ↻</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <SearchSelect label="कारण / Purpose" value={DUTY_PURPOSES.includes(form.purpose) ? form.purpose : (form.purpose ? 'अन्य (Other - खुद लिखें)' : '')}
            onChange={(v) => setForm({ ...form, purpose: v === 'अन्य (Other - खुद लिखें)' ? '' : v })}
            options={DUTY_PURPOSES.map(p => ({ value: p, label: p }))}
            placeholder="Duty type select karein..." />
          {/* Custom purpose box if "Other" selected or value is custom */}
          {(form.purpose === '' || (!DUTY_PURPOSES.includes(form.purpose) && form.purpose)) && (
            <input type="text" value={form.purpose} onChange={f('purpose')}
              placeholder="अपनी ड्यूटी का प्रकार लिखें..."
              className="mt-1 w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-500" />
          )}
        </div>
        <SearchSelect label="साधन / Mode" value={form.travelMode}
          onChange={(v) => setForm({ ...form, travelMode: v })}
          options={TRAVEL_MODES.map(m => ({ value: m, label: m }))}
          placeholder="Select..." />
        <SearchSelect label="किस्म / Type" value={form.vehicleType}
          onChange={(v) => setForm({ ...form, vehicleType: v })}
          options={VEHICLE_TYPES.map(t => ({ value: t, label: t }))}
          placeholder="Select..." />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label="दूरी (km)" value={form.distance} onChange={f('distance')} placeholder="15" type="number" />
        <div>
          <Input label={`किराया (₹) ${mileageRate ? `@ ₹${mileageRate}/km` : ''}`} value={form.fare} onChange={f('fare')}
            placeholder={form.distance && mileageRate ? `Auto: ${calculateFare(form.distance, mileageRate)}` : '20'} type="number" />
          {form.distance && mileageRate && !form.fare && (
            <button type="button"
              onClick={() => setForm(prev => ({ ...prev, fare: calculateFare(prev.distance, mileageRate) }))}
              className="mt-1 w-full text-left px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-300 hover:bg-emerald-500/20">
              ✨ Auto: ₹{calculateFare(form.distance, mileageRate)} (= {form.distance} × ₹{mileageRate})
            </button>
          )}
        </div>
        <Input label="GD नंबर" value={form.gdNumber} onChange={f('gdNumber')} placeholder="45" />
      </div>

      {/* Auto-suggest hint */}
      {form.from && form.to && pno && findJourneyMatch(pno, form.from, form.to) && (
        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          ✨ Past entry mili — distance/fare auto-fill kar diya
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={onAdd}
          className="flex-1 py-2.5 bg-amber-500 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-amber-400">
          {editIdx !== null ? <><Check size={14}/> Update</> : <><Plus size={14}/> Add Entry</>}
        </button>
        {editIdx !== null && (
          <button onClick={onCancel} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white">
            <X size={14}/>
          </button>
        )}
      </div>

      {/* Add Return Journey Button — only when there's a previous entry */}
      {journeys.length > 0 && editIdx === null && (
        <button onClick={onAddReturn}
          className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/30">
          🔄 वापसी यात्रा जोड़ें (Add Return Journey)
          <span className="text-[10px] font-normal opacity-70">
            — {journeys[journeys.length - 1].to} → {journeys[journeys.length - 1].from}
          </span>
        </button>
      )}
    </div>
  )
}

// ===== NAKSHA PREVIEW (Landscape) =====
function NakshaPreview({ info, journeys, onEdit, onDelete, totalDist, totalFare, totalDays, totalDA, grandTotal, hasManualDA: _hasManualDA }) {
  return (
    <div className="naksha-print-wrapper flex justify-center">
      {/* Page wrapper — Legal landscape size with visible margins */}
      <div className="naksha-page bg-white text-black shadow-2xl"
        style={{
          width: '356mm',
          minHeight: '216mm',
          padding: '8mm',
          boxSizing: 'border-box',
        }}>
        {/* Inner content with border */}
        <div className="naksha-preview border-2 border-black p-3 font-mono text-[12px] h-full">
          <div className="flex gap-2 h-full">
            {/* LEFT: Naksha Table (75%) */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="text-center border-b-2 border-black pb-1 mb-1">
                <p className="text-[18px] font-bold">नक्शा डी०ए०/टी०ए०</p>
                <p className="text-[12px]">थाना/यूनिट: <b>{info.thana || '___________'}</b> | जिला: <b>{info.district || '___________'}</b> | वर्ष: <b>{info.year || '____'}</b></p>
              </div>

              {/* Employee info bar */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 border-b-2 border-black pb-1 mb-1 text-[12px]">
                <div><b>नाम:</b> {info.name || '___'}</div>
                <div><b>पदनाम:</b> {info.designation || '___'}</div>
                <div><b>PNO:</b> {info.pno || '___'}</div>
                <div><b>वेतन स्तर:</b> {info.payLevel || '___'}</div>
                <div><b>मूल वेतन:</b> ₹{info.basicPay || '___'}</div>
                <div><b>ग्रेड पे:</b> ₹{info.gradePay || '___'}</div>
                <div><b>बैंक:</b> {info.bankName || '___'}</div>
                <div><b>A/C:</b> {info.accountNo || '___'}</div>
              </div>

              {/* Main journey table */}
              <table className="w-full border-collapse border-2 border-black text-[11px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black px-1 py-1" rowSpan={2} style={{width: '4%'}}>क्र.</th>
                    <th className="border border-black px-1 py-0.5" colSpan={2}>प्रस्थान</th>
                    <th className="border border-black px-1 py-0.5" colSpan={2}>आगमन</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>कहाँ से</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>कहाँ तक</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>यात्रा का<br/>कारण</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>साधन</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>किस्म</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>दूरी<br/>(कि.मी.)</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>किराया<br/>(₹)</th>
                    <th className="border border-black px-1 py-1" rowSpan={2}>जी.डी.<br/>न०</th>
                    <th className="border border-black px-1 py-1 no-print" rowSpan={2}>✏️</th>
                  </tr>
                  <tr className="bg-gray-200">
                    <th className="border border-black px-1 py-0.5">दिनांक</th>
                    <th className="border border-black px-1 py-0.5">समय (Hrs)</th>
                    <th className="border border-black px-1 py-0.5">दिनांक</th>
                    <th className="border border-black px-1 py-0.5">समय (Hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((j, i) => (
                    <tr key={i} className="hover:bg-yellow-50 group">
                      <td className="border border-black px-1 py-0.5 text-center">{i+1}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{formatDateDDMMYYYY(j.date)}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{j.departureTime || '—'}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{formatDateDDMMYYYY(j.date)}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{j.arrivalTime || '—'}</td>
                      <td className="border border-black px-1 py-0.5">{j.from}</td>
                      <td className="border border-black px-1 py-0.5">{j.to}</td>
                      <td className="border border-black px-1 py-0.5">{j.purpose}</td>
                      <td className="border border-black px-1 py-0.5">{j.travelMode}</td>
                      <td className="border border-black px-1 py-0.5">{j.vehicleType}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{j.distance}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{j.fare}</td>
                      <td className="border border-black px-1 py-0.5 text-center">{j.gdNumber}</td>
                      <td className="border border-black px-1 py-0.5 text-center no-print">
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                          <button onClick={() => onEdit(i)} className="p-0.5 bg-blue-100 rounded"><Edit3 size={10} className="text-blue-600"/></button>
                          <button onClick={() => onDelete(i)} className="p-0.5 bg-red-100 rounded"><Trash2 size={10} className="text-red-600"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows to fill the page (like real naksha form) */}
                  {Array.from({ length: Math.max(0, 18 - journeys.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-6">
                      <td className="border border-black px-1 py-0.5 text-center text-gray-300">{journeys.length + i + 1}</td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5"></td>
                      <td className="border border-black px-1 py-0.5 no-print"></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={10} className="border border-black px-1 py-0.5 text-right">कुल योग / Total:</td>
                    <td className="border border-black px-1 py-0.5 text-center">{totalDist}</td>
                    <td className="border border-black px-1 py-0.5 text-center">₹{totalFare}</td>
                    <td className="border border-black px-1 py-0.5"></td>
                    <td className="border border-black px-1 py-0.5 no-print"></td>
                  </tr>
                </tfoot>
              </table>

              {/* Amount in words + Declaration */}
              <div className="mt-2 border-2 border-black p-2 text-[11px]">
                <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-black">
                  <div><b>माइलेज दर:</b> ₹{info.mileageRate || '___'} प्रति किलोमीटर</div>
                  <div><b>दैनिक भत्ता दर (DA):</b> ₹{info.daRate || '___'} प्रति दिन</div>
                  <div><b>कुल दूरी:</b> {totalDist} किलोमीटर</div>
                  <div><b>कुल यात्राएं:</b> {journeys.length} ({totalDays} दिन)</div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-black">
                  <div><b>यात्रा भत्ता (TA):</b> ₹{totalFare}</div>
                   <div>
                     <b>दैनिक भत्ता (DA):</b> ₹{totalDA} ({totalDays} दिन × ₹{info.daRate || 0})
                   </div>
                  <div className="text-right"><b>कुल योग:</b> <span className="text-[13px]">₹{grandTotal}</span></div>
                </div>
                <p className="mb-1"><b>राशि शब्दों में:</b> ₹{grandTotal} ({numberToHindiWords(grandTotal)} रुपये मात्र)</p>
                <p className="text-justify mt-2 text-[10.5px]">
                  <b>प्रमाणित किया जाता है</b> कि उपरोक्त यात्रा वास्तव में सरकारी कार्य के लिए की गई है।
                  यह यात्रा भत्ता/दैनिक भत्ता का दावा नियमानुसार है तथा मेरे द्वारा पूर्व में
                  इस यात्रा का कोई भत्ता नहीं लिया गया है। उपरोक्त विवरण सत्य एवं सही है।
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="border-t-2 border-black pt-1 text-center">
                  <p className="text-[10px]">हस्ताक्षर कर्मचारी</p>
                  <p className="text-[9px] mt-1">{info.name || '____________'}</p>
                  <p className="text-[9px]">PNO: {info.pno || '_____'}</p>
                </div>
                <div className="border-t-2 border-black pt-1 text-center">
                  <p className="text-[10px]">हस्ताक्षर थानाध्यक्ष/SHO</p>
                  <p className="text-[9px] mt-1">मुहर सहित</p>
                </div>
                <div className="border-t-2 border-black pt-1 text-center">
                  <p className="text-[10px]">हस्ताक्षर DDO/आहरण-वितरण अधिकारी</p>
                  <p className="text-[9px] mt-1">स्वीकृति सहित</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Prarthna Patra (with vertical separator) */}
            <div className="prarthna-section w-[260px] shrink-0 border-l-2 border-black pl-3 text-[12px] leading-relaxed">
              <p className="text-center font-bold text-[14px] mb-2 underline">प्रार्थना पत्र</p>
              <p className="mb-1">सेवा में,</p>
              <p className="font-bold mb-1">श्रीमान {info.district ? `पुलिस अधीक्षक, ${info.district}` : 'पुलिस अधीक्षक ___'}</p>
              <p className="mb-2">महोदय,</p>
              <p className="mb-2 text-justify">
                सविनय निवेदन है कि मैं <b>{info.name || '___'}</b>, {info.designation || '___'},
                PNO {info.pno || '___'}, {info.thana || '___'}, जनपद {info.district || '___'} में
                तैनात हूँ। मुझे विभिन्न ड्यूटी पर भेजा गया जिसका विवरण संलग्न नक्शे में अंकित है।
              </p>
              <p className="mb-2 text-justify">
                अतः श्रीमान से प्रार्थना है कि मेरा यात्रा भत्ता/दैनिक भत्ता कुल
                <b> ₹{grandTotal || '___'}</b> (TA: ₹{totalFare}, DA: ₹{totalDA} | {totalDist || '___'} किमी, {totalDays} दिन) स्वीकृत कर मेरे
                बैंक खाता <b>{info.accountNo || '___'}</b> ({info.bankName || '___'}, IFSC: {info.ifsc || '___'})
                में भुगतान की कृपा करें।
              </p>
              <p className="mb-4">आपका आज्ञाकारी,</p>
              <div className="mt-6 border-t border-black pt-1">
                <p className="font-bold">{info.name || '___'}</p>
                <p>{info.designation || '___'}</p>
                <p>PNO: {info.pno || '___'}</p>
                <p>{info.thana || '___'}</p>
                <p className="mt-2">दिनांक: ____/____/______</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== SEARCHABLE DROPDOWN =====
function SearchSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const filtered = useMemo(() => {
    if (!search) return options
    const s = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s))
  }, [options, search])

  const selectedLabel = options.find(o => o.value === value)?.label || value || ''

  return (
    <div className="relative" ref={ref}>
      <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-left flex items-center justify-between hover:border-amber-500/30 focus:border-amber-500/50 focus:outline-none">
        <span className={selectedLabel ? 'text-white' : 'text-gray-600'}>{selectedLabel || placeholder}</span>
        <Search size={12} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1b26] border border-white/20 rounded-lg shadow-xl max-h-48 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/10">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search / खोजें..."
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="overflow-y-auto max-h-36">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500 italic">No results</p>
            ) : filtered.map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-500/10 transition-colors ${
                  opt.value === value ? 'bg-amber-500/20 text-amber-300' : 'text-gray-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Close on outside click */}
      {open && <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />}
    </div>
  )
}

// ===== SEARCHABLE DROPDOWN WITH FREE TEXT INPUT (for places) =====
function SearchSelectCreatable({ label, value, onChange, onBlur, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value || '')

  // Sync search when external value changes (e.g., from auto-translate or reverse button)
  useEffect(() => {
    setTimeout(() => setSearch(value || ''), 0)
  }, [value])

  const filtered = useMemo(() => {
    if (!search) return options.slice(0, 20)
    const s = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s)).slice(0, 20)
  }, [options, search])

  const handleInputChange = (e) => {
    const val = e.target.value
    setSearch(val)
    onChange(val) // Free typing also updates the value
    setOpen(true)
  }

  const selectOption = (val) => {
    onChange(val)
    setSearch(val)
    setOpen(false)
  }

  const handleBlur = (e) => {
    // Delay so click on dropdown can register first
    setTimeout(() => {
      setOpen(false)
      if (onBlur) onBlur(e)
    }, 200)
  }

  return (
    <div className="relative">
      <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
      <div className="relative">
        <input type="text" value={search}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
        <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {open && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-[#1a1b26] border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            <div className="px-2 py-1 text-[9px] text-gray-500 border-b border-white/10 sticky top-0 bg-[#1a1b26]">
              💡 Past entries — select karein ya naya likhein
            </div>
            {filtered.map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => selectOption(opt.value)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-500/10 transition-colors ${
                  opt.value === value ? 'bg-amber-500/20 text-amber-300' : 'text-gray-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ===== SIMPLE INPUT =====
function Input({ label, value, onChange, onBlur, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
    </div>
  )
}

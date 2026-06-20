// frontend/src/pages/ToolLanding.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle2, PlayCircle, HelpCircle, 
  ChevronDown, ChevronUp, Bot, FileText, ArrowRight, ShieldCheck
} from 'lucide-react'
import { useStore } from '../store'
import TOOLS_METADATA from '../data/toolsMetadata'

export default function ToolLanding() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useStore()
  
  const [tool, setTool] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  // Map route aliases if the user lands on an explicit SEO path
  useEffect(() => {
    let currentSlug = slug
    if (!currentSlug) {
      const path = location.pathname.replace('/', '')
      if (TOOLS_METADATA[path]) {
        currentSlug = path
      } else if (path === 'affidavit-generator' || path === 'tools/affidavit') {
        currentSlug = 'affidavit-generator'
      } else if (path === 'legal-notice-generator' || path === 'tools/legal-notice') {
        currentSlug = 'legal-notice-generator'
      } else if (path === 'prarthna-patra-writer' || path === 'tools/prarthna-patra') {
        currentSlug = 'prarthna-patra-writer'
      } else if (path === 'rent-agreement-generator' || path === 'tools/rent-agreement') {
        currentSlug = 'rent-agreement-generator'
      } else if (path === 'gift-deed-generator' || path === 'tools/gift-deed') {
        currentSlug = 'gift-deed-generator'
      } else if (path === 'partition-deed-generator' || path === 'tools/partition-deed') {
        currentSlug = 'partition-deed-generator'
      } else if (path === 'power-of-attorney-generator' || path === 'tools/poa') {
        currentSlug = 'power-of-attorney-generator'
      } else if (path === 'will-generator' || path === 'tools/will') {
        currentSlug = 'will-generator'
      } else if (path === 'noc-generator' || path === 'tools/noc') {
        currentSlug = 'noc-generator'
      } else if (path === 'resume-builder' || path === 'tools/resume-builder') {
        currentSlug = 'resume-builder'
      } else if (path === 'pdf-tools' || path === 'tools/pdf-tools') {
        currentSlug = 'pdf-tools'
      } else if (path === 'image-tools' || path === 'tools/image-tools') {
        currentSlug = 'image-tools'
      }
    }
    
    const data = TOOLS_METADATA[currentSlug] || TOOLS_METADATA['affidavit-generator']
    setTool(data)
  }, [slug, location.pathname])

  if (!tool) return null

  const handleLaunch = () => {
    if (isAuthenticated) {
      navigate(tool.serviceRoute, { state: { presetType: tool.targetType } })
    } else {
      navigate('/login', { state: { redirect: location.pathname } })
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-sm font-bold tracking-wider uppercase text-amber-500 flex items-center gap-1.5">
          <Bot size={16}/> N-Dizi AI Tools
        </span>
        <button onClick={handleLaunch} className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg text-xs font-bold text-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
          <PlayCircle size={14}/> Launch tool
        </button>
      </header>

      {/* Hero card */}
      <section className="relative max-w-5xl mx-auto p-4 pt-10">
        <div className="bg-gradient-to-br from-[#0f111a] via-[#161a29] to-[#0c0d15] border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner">
              {tool.icon}
            </div>
            
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-amber-400 bg-clip-text text-transparent">
                {tool.title}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {tool.desc}
              </p>
              
              <div className="pt-4 flex flex-wrap gap-3">
                <button onClick={handleLaunch} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/25">
                  Start Generation Now <ArrowRight size={16}/>
                </button>
                <a href="#how-it-works" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold rounded-xl text-sm transition-all flex items-center justify-center">
                  Learn How It Works
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Info Grid */}
      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        {/* Left 2 Columns */}
        <div className="md:col-span-2 space-y-12">
          {/* Benefits */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck className="text-amber-500" size={20}/> Benefits & Capabilities
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {tool.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={16}/>
                  <span className="text-xs text-gray-300 leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Steps */}
          <div id="how-it-works" className="space-y-4 pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
              ⚙️ Step-by-Step Generation Flow
            </h2>
            <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-6">
              {tool.steps.map((s, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#020617] border-2 border-amber-500 flex items-center justify-center text-xs font-bold text-amber-500">
                    {i + 1}
                  </span>
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-300 leading-relaxed">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Previews */}
          {tool.examples && tool.examples.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2">
                📄 Sample Draft Previews
              </h2>
              <div className="space-y-4">
                {tool.examples.map((ex, i) => (
                  <div key={i} className="bg-[#0b0c13] border border-white/5 rounded-xl p-5 space-y-2">
                    <span className="text-xs font-bold text-amber-500">{ex.label} Preview:</span>
                    <p className="text-[11px] font-mono text-gray-500 italic bg-[#020617] p-3.5 rounded border border-white/5 leading-relaxed">
                      "{ex.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar FAQs */}
        <div className="space-y-6">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-5 space-y-4 h-fit">
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/15 pb-2 text-amber-500">
              <HelpCircle size={16}/> Tool Specific FAQ
            </h3>
            
            <div className="space-y-3">
              {tool.faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-2 text-left text-xs font-bold text-gray-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={14} className="text-amber-500" /> : <ChevronDown size={14} />}
                  </button>
                  {openFaq === idx && (
                    <p className="mt-2 text-[10px] text-gray-400 leading-relaxed bg-[#020617] p-2.5 rounded border border-white/5">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick CTA Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4">
            <h4 className="text-xs font-bold text-amber-400">Ready to Draft?</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Launch our secure, validation-ready drafting compiler. Zero placeholders, 100% correct court-ready formats.
            </p>
            <button onClick={handleLaunch} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all">
              Launch Draft Compiler
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c13] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} N-Dizi AI / Harshita AI. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/privacy-policy.html" className="hover:text-white">Privacy Policy</a>
          <a href="/terms.html" className="hover:text-white">Terms</a>
          <a href="/disclaimer.html" className="hover:text-white">Disclaimer</a>
        </div>
      </footer>
    </div>
  )
}

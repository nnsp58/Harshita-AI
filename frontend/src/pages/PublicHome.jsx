import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bot, Zap, MessageSquare, ArrowRight, ShieldCheck, 
  HelpCircle, Search, Mail, FileText, CheckCircle, 
  ChevronRight, Sparkles, Scale, Cpu, Globe, Lock
} from 'lucide-react'

// Tool list data for SEO crawlability and direct links
const TOOLS_LIST = [
  { icon: '🎵', name: 'Audio Converter', desc: 'Convert audio files to MP3, WAV, OGG formats in seconds.', href: '/audio-converter.html' },
  { icon: '📄', name: 'Document Converter', desc: 'Convert between PDF, DOCX, TXT, HTML, and JSON structures.', href: '/document-format-converter.html' },
  { icon: '🗜️', name: 'File Compressor', desc: 'Compress PDF files to optimize loading speeds and storage.', href: '/file-compressor.html' },
  { icon: '🖼️', name: 'Group Photo Maker', desc: 'Create beautiful grids, collages, and customizable layouts.', href: '/group-photo-maker.html' },
  { icon: '📉', name: 'Image Compressor', desc: 'Compress PNG, JPG, and WebP images without losing visual quality.', href: '/image-compress.html' },
  { icon: '🔄', name: 'Image Format Converter', desc: 'Convert image files to PNG, JPEG, and WebP formats.', href: '/image-format-converter.html' },
  { icon: '📑', name: 'Image to PDF', desc: 'Merge multiple image files into a single, high-quality PDF.', href: '/image-to-pdf.html' },
  { icon: '🧮', name: 'Multifunction Calculator', desc: 'Perform basic math, financial, currency, and unit conversions.', href: '/multifunction-calculator.html' },
  { icon: '📷', name: 'Passport Photo Maker', desc: 'Generate standard passport size photos with smart background removal.', href: '/passport-size-photo-maker.html' },
  { icon: '📝', name: 'PDF to Word', desc: 'Convert read-only PDF files to fully editable Word documents.', href: '/pdf-to-word.html' },
  { icon: '🔳', name: 'QR Code Generator', desc: 'Generate unique QR codes for websites, texts, and contact details.', href: '/qr-generator.html' },
  { icon: '🔊', name: 'Speech Synthesis & Recognition', desc: 'Convert text to natural speech voice and transcribe audio files.', href: '/text-to-speech.html' },
  { icon: '🗣️', name: 'Universal Translator', desc: 'Translate text sentences across more than 50 global languages.', href: '/universal-translator.html' },
  { icon: '🎬', name: 'Video Converter', desc: 'Convert video clips to MP4, AVI, MKV, and MOV formats.', href: '/video-converter.html' },
  { icon: '🎙️', name: 'Voice Translator', desc: 'Translate spoken phrases and voice logs in real-time.', href: '/voice-translator.html' },
  { icon: '🔑', name: 'Password Generator', desc: 'Create secure, highly randomized passwords instantly.', href: '/password-generator.html' }
]

const FAQS = [
  { q: "What is N-Dizi AI?", a: "N-Dizi AI is an all-in-one AI enterprise command center and free online tools suite. We offer automated AI drafts, document parsing, conversion services, and smart calculators directly in your web browser." },
  { q: "Are the conversion tools free to use?", a: "Yes! All 16+ converters and utilities listed on our public portal are 100% free with no registration, no email submissions, and no limits." },
  { q: "How does the AI Command Center work?", a: "Registered VLEs and CSC operators can log in using their credentials to access our premium legal drafting engines, ITR filings, smart Naksha tools, and conversational assistants." },
  { q: "Are my files and data secure?", a: "Security is our top priority. All tools execute locally in your browser when possible, and uploaded files are purged immediately from our secure production environments after conversion." }
]

export default function PublicHome() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = TOOLS_LIST.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                N-Dizi AI
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#draft-tools" className="hover:text-indigo-400 transition-colors">Premium Tools</a>
            <a href="#tools" className="hover:text-indigo-400 transition-colors">Converters</a>
            <Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQs</Link>
            <Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]">
              <Lock size={14} />
              Operator Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* Ambient Gradient Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider"
          >
            <Sparkles size={12} />
            Version 6.0 Enterprise Launch
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            One Platform.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Unlimited AI Services.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Access automated legal drafts, smart calculators, sitemaps, and 16+ offline-first converters. Built for VLE networks and enterprise automation.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a href="#tools" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#020617] font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5">
              Explore Tools <ArrowRight size={16} />
            </a>
            <Link to="/contact" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-gray-300 transition-all flex items-center justify-center gap-2">
              Contact Support
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Premium AI Drafting Tools Directory */}
      <section id="draft-tools" className="py-20 px-4 sm:px-8 border-t border-white/5 bg-[#0b0d19]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Premium Legal & Business Solutions</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Drafting Assistants</h2>
            <p className="text-sm text-gray-400">Generate court-ready agreements, legal notices, and certificates in minutes with our zero-placeholder quality gates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚖️', name: 'Affidavit Generator', desc: 'Create legally valid name change, lost marksheet, and address affidavits.', slug: 'affidavit-generator' },
              { icon: '✉️', name: 'Legal Notice Generator', desc: 'Draft professional demand letters for cheque bounce, recovery, and disputes.', slug: 'legal-notice-generator' },
              { icon: '📝', name: 'Prarthna Patra Writer', desc: 'Hindi applications for block tehsils, police complaints, and SDM offices.', slug: 'prarthna-patra-writer' },
              { icon: '🏠', name: 'Rent Agreement Builder', desc: 'Construct customized tenant-landlord agreements with state stamp rules.', slug: 'rent-agreement-generator' },
              { icon: '🎁', name: 'Gift Deed Generator', desc: 'Voluntary property gift deeds for blood relatives with tax exemptions.', slug: 'gift-deed-generator' },
              { icon: '🗺️', name: 'Partition Deed Builder', desc: 'Draft agreements to divide joint family property among co-owners.', slug: 'partition-deed-generator' },
              { icon: '🤝', name: 'Power of Attorney GPA/SPA', desc: 'Authorize representation rights for property, RTO, or legal matters.', slug: 'power-of-attorney-generator' },
              { icon: '📜', name: 'Will (Wasiyat) Builder', desc: 'Ensure asset succession with secure executor and witness covenants.', slug: 'will-generator' }
            ].map((tool, idx) => (
              <Link 
                key={idx} 
                to={`/tools/${tool.slug}`}
                className="group p-6 rounded-2xl bg-[#0f111a] border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-amber-500/5"
              >
                <div className="space-y-4">
                  <span className="text-3xl block group-hover:scale-110 transition-transform origin-left">{tool.icon}</span>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">{tool.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{tool.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-6 pt-4 border-t border-white/[0.02]">
                  Explore Details <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">Why Choose N-Dizi AI?</h2>
            <p className="text-sm text-gray-400">High-performance AI command center coupled with privacy-first conversion capabilities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-bold">Smart Client Execution</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Files are processed directly in your web browser. Your confidential documentation never logs into third-party databases.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Scale size={24} />
              </div>
              <h3 className="text-lg font-bold">Legal Drafting</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Access clean templates and automated scripts for legal notices, affidavits, rents, and ITR declarations instantly.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe size={24} />
              </div>
              <h3 className="text-lg font-bold">Sitemap & Index Readiness</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Fully search-engine optimized metadata, canonical linkages, and plain-text configuration records configured for fast discovery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programmatic Tools Directory */}
      <section id="tools" className="py-20 px-4 sm:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Free Conversion Suite</h2>
              <p className="text-sm text-gray-400 max-w-xl">Double-click or open any tool below to perform offline document, image, and voice conversion.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 16+ tools..."
                className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 text-white placeholder-gray-500 transition-colors"
              />
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTools.map((tool, idx) => (
                <a 
                  key={idx} 
                  href={tool.href} 
                  className="group p-6 rounded-2xl bg-[#0f111a] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-indigo-500/5"
                >
                  <div className="space-y-4">
                    <span className="text-3xl block group-hover:scale-110 transition-transform origin-left">{tool.icon}</span>
                    <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{tool.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold mt-6 pt-4 border-t border-white/[0.02]">
                    Launch Tool <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <HelpCircle size={40} className="mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-400">No tools found matching your query</h3>
              <button onClick={() => setSearchQuery('')} className="mt-3 text-indigo-400 text-sm font-semibold hover:underline">Reset Search Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-8 border-t border-white/5 bg-white/[0.005]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-400">Answers to common inquiries about our services and security guidelines.</p>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 space-y-2.5">
                <h3 className="font-bold text-base text-indigo-300 flex items-center gap-2">
                  <CheckCircle size={16} className="text-indigo-500 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#08090f] py-12 px-4 sm:px-8 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">N-Dizi AI</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              One Platform. Unlimited AI Services. Built securely for operators, administrators, and VLE networks.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Drafting Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/tools/affidavit-generator" className="hover:text-white transition-colors">Affidavit Generator</Link></li>
              <li><Link to="/tools/legal-notice-generator" className="hover:text-white transition-colors">Legal Notice Agent</Link></li>
              <li><Link to="/tools/prarthna-patra-writer" className="hover:text-white transition-colors">Prarthna Patra Writer</Link></li>
              <li><Link to="/tools/rent-agreement-generator" className="hover:text-white transition-colors">Rent Agreement Builder</Link></li>
              <li><Link to="/tools/will-generator" className="hover:text-white transition-colors">Will (Wasiyat) Builder</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Knowledge Base</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked FAQs</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Official Blog Posts</Link></li>
              <li><Link to="/seo/how-to-write-affidavit" className="hover:text-white transition-colors">How to Write Affidavit</Link></li>
              <li><Link to="/seo/how-to-write-legal-notice" className="hover:text-white transition-colors">How to Write Legal Notice</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support Form</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/about.html" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/privacy-policy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms.html" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/disclaimer.html" className="hover:text-white transition-colors">Disclaimer Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 Harshita AI by n-dizi.in. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="/robots.txt" className="hover:text-white transition-colors">robots.txt</a>
            <a href="/sitemap.xml" className="hover:text-white transition-colors">sitemap.xml</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

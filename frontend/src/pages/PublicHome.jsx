import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bot, Zap, MessageSquare, ArrowRight, ShieldCheck, 
  HelpCircle, Search, Mail, FileText, CheckCircle, 
  ChevronRight, Sparkles, Scale, Cpu, Globe, Lock, Code, Video, Image, Briefcase, Users
} from 'lucide-react'
import SEO from '../components/SEO'
import Footer from '../components/Footer'

// Tool list data for SEO crawlability and direct links
const TOOLS_LIST = [
  { icon: '📷', name: 'Passport Photo Maker', desc: 'Generate standard passport size photos with smart background removal.', href: '/passport-size-photo-maker.html' },
  { icon: '🖼️', name: 'Passport Size Maker', desc: 'Quickly resize any portrait image to official passport size specifications.', href: '/passport-size-photo-maker.html' },
  { icon: '🎵', name: 'Audio Converter', desc: 'Convert audio files to MP3, WAV, OGG formats in seconds.', href: '/audio-converter.html' },
  { icon: '📄', name: 'Document Converter', desc: 'Convert between PDF, DOCX, TXT, HTML, and JSON structures.', href: '/document-format-converter.html' },
  { icon: '🗜️', name: 'File Compressor', desc: 'Compress PDF files to optimize loading speeds and storage.', href: '/file-compressor.html' },
  { icon: '🖼️', name: 'Group Photo Maker', desc: 'Create beautiful grids, collages, and customizable layouts.', href: '/group-photo-maker.html' },
  { icon: '📉', name: 'Image Compressor', desc: 'Compress PNG, JPG, and WebP images without losing visual quality.', href: '/image-compress.html' },
  { icon: '🔄', name: 'Image Format Converter', desc: 'Convert image files to PNG, JPEG, and WebP formats.', href: '/image-format-converter.html' },
  { icon: '📑', name: 'Image to PDF', desc: 'Merge multiple image files into a single, high-quality PDF.', href: '/image-to-pdf.html' },
  { icon: '🧮', name: 'Multifunction Calculator', desc: 'Perform basic math, financial, currency, and unit conversions.', href: '/multifunction-calculator.html' },
  { icon: '📝', name: 'PDF to Word', desc: 'Convert read-only PDF files to fully editable Word documents.', href: '/pdf-to-word.html' },
  { icon: '🔳', name: 'QR Code Generator', desc: 'Generate unique QR codes for websites, texts, and contact details.', href: '/qr-generator.html' },
  { icon: '🔊', name: 'Speech Synthesis & Recognition', desc: 'Convert text to natural speech voice and transcribe audio files.', href: '/text-to-speech.html' },
  { icon: '🗣️', name: 'Universal Translator', desc: 'Translate text sentences across more than 50 global languages.', href: '/universal-translator.html' },
  { icon: '🎬', name: 'Video Converter', desc: 'Convert video clips to MP4, AVI, MKV, and MOV formats.', href: '/video-converter.html' },
  { icon: '🎙️', name: 'Voice Translator', desc: 'Translate spoken phrases and voice logs in real-time.', href: '/voice-translator.html' },
  { icon: '🔑', name: 'Password Generator', desc: 'Create secure, highly randomized passwords instantly.', href: '/password-generator.html' }
]

const DRAFTING_TOOLS = [
  { icon: '⚖️', name: 'Passport Affidavit', desc: 'Create legally valid passport affidavits and address confirmations.', slug: 'passport-affidavit', href: '/login?prompt=Passport+Affidavit+banao' },
  { icon: '📝', name: 'Passport Application', desc: 'Apply for fresh or renewal passports online via Passport Seva portal guidelines.', slug: 'passport-application', href: '/login?prompt=Passport+application' },
  { icon: '⚖️', name: 'Affidavit Generator', desc: 'Create legally valid name change, lost marksheet, and address affidavits.', slug: 'affidavit-generator', href: '/login?prompt=Affidavit+banao' },
  { icon: '✉️', name: 'Legal Notice Generator', desc: 'Draft professional demand letters for cheque bounce, recovery, and disputes.', slug: 'legal-notice-generator', href: '/login?prompt=Legal+Notice+bhejo' },
  { icon: '📝', name: 'Prarthna Patra Writer', desc: 'Hindi applications for block tehsils, police complaints, and SDM offices.', slug: 'prarthna-patra-writer', href: '/login?prompt=Principal+ko+leave+application' },
  { icon: '🏠', name: 'Rent Agreement Builder', desc: 'Construct customized tenant-landlord agreements with state stamp rules.', slug: 'rent-agreement-generator', href: '/login?prompt=Rent+agreement+banao' },
  { icon: '🎁', name: 'Gift Deed Generator', desc: 'Voluntary property gift deeds for blood relatives with tax exemptions.', slug: 'gift-deed-generator', href: '/login?prompt=Gift+deed+banao' },
  { icon: '🗺️', name: 'Partition Deed Builder', desc: 'Draft agreements to divide joint family property among co-owners.', slug: 'partition-deed-generator', href: '/login?prompt=Partition+deed+banao' },
  { icon: '🤝', name: 'Power of Attorney GPA/SPA', desc: 'Authorize representation rights for property, RTO, or legal matters.', slug: 'power-of-attorney-generator', href: '/login?prompt=Power+of+attorney+banao' },
  { icon: '📜', name: 'Will (Wasiyat) Builder', desc: 'Ensure asset succession with secure executor and witness covenants.', slug: 'will-generator', href: '/login?prompt=Wasiyatnama+banao' }
]

const ALL_SERVICES = [
  ...DRAFTING_TOOLS,
  ...TOOLS_LIST.map(t => ({ ...t, slug: t.href.replace('/', '').replace('.html', ''), category: 'Converters' }))
]

const FAQS = [
  { q: "What is Harshita AI?", a: "Harshita AI is India's most powerful AI platform. It serves as an all-in-one enterprise command center for coding, legal documents, education, website building, image/video generation, and rural help." },
  { q: "Are the conversion tools free to use?", a: "Yes! All 16+ converters and utilities listed on our public portal are 100% free with no registration, no email submissions, and no limits." },
  { q: "How does the AI Command Center work?", a: "Registered VLEs and CSC operators can log in using their credentials to access our premium legal drafting engines, ITR filings, smart Naksha tools, and conversational assistants." },
  { q: "Are my files and data secure?", a: "Security is our top priority. All tools execute locally in your browser when possible, and uploaded files are purged immediately from our secure production environments after conversion." },
  { q: "Can I use Harshita AI for legal documents?", a: "Absolutely. Harshita AI specializes in Indian legal drafting, including affidavits, rent agreements, legal notices, and Prarthna Patras (applications)." }
]

const TESTIMONIALS = [
  { name: "Rahul S.", role: "CSC VLE Operator", text: "Harshita AI changed how I run my center. I can now draft rent agreements and affidavits in seconds instead of hours!" },
  { name: "Sneha P.", role: "Software Developer", text: "The Coding Agent is incredible. It analyzed my repository and found a subtle memory leak I had been missing for days." },
  { name: "Amit K.", role: "Small Business Owner", text: "From GST billing to generating marketing videos, Harshita AI is like having a team of 10 people working for me." }
]

export default function PublicHome() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllDrafting, setShowAllDrafting] = useState(false)
  const [showAllTools, setShowAllTools] = useState(false)

  // Universal Search Filter over ALL services
  const searchResults = searchQuery.trim() 
    ? ALL_SERVICES.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      window.location.href = `/login?prompt=${encodeURIComponent(searchQuery)}`;
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans">
      <SEO 
        title="Harshita AI - India's Most Powerful AI Platform" 
        description="Harshita AI is an all-in-one AI platform for legal documents, coding, automation, video generation, website building, and business management."
        keywords="Harshita AI, artificial intelligence, legal drafting, coding agent, AI video generator, CSC tools"
      />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Harshita AI
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#draft-tools" className="hover:text-indigo-400 transition-colors">Legal AI</a>
            <a href="#tools" className="hover:text-indigo-400 transition-colors">Converters</a>
            <Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]">
              <Lock size={14} />
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative pt-32 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider"
          >
            <Sparkles size={12} />
            Version 2.0 Universal Skill Engine Active
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            India's Most Powerful<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI Operating System.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Code software, draft legal documents, write government applications, generate videos, build websites, and automate your entire business—all in one place.
          </motion.p>

          {/* Top Sticky Search Bar / AI Prompt Box */}
          <motion.form 
            onSubmit={handlePromptSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-2xl mx-auto mt-8 relative"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex items-center bg-[#0a0b10] rounded-2xl border border-white/10 p-2">
                <Search size={20} className="text-indigo-400 ml-4 mr-2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates & tools (e.g. Passport, Rent Agreement, Resume)..." 
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 py-3 px-2 text-sm sm:text-base"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0">
                  Generate <ArrowRight size={14} />
                </button>
              </div>
            </div>
            
            {/* Real-time Universal Search Results */}
            {searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-3 bg-[#0a0b10]/95 border border-white/15 rounded-2xl p-4 shadow-2xl z-50 text-left backdrop-blur-xl max-h-[350px] overflow-y-auto">
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-3">Search Results ({searchResults.length})</p>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map((tool, idx) => (
                      <Link 
                        key={idx} 
                        to={tool.href || `/tools/${tool.slug}`}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{tool.name}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{tool.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500">No matching services found.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px] text-gray-400">
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setSearchQuery('Passport')}>Passport Services</span>
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setSearchQuery('Rent Agreement')}>Rent Agreement</span>
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setSearchQuery('Resume')}>Resume Builder</span>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Grid Features - Core Capabilities */}
      <section id="features" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">Comprehensive AI Capabilities</h2>
            <p className="text-sm text-gray-400">Harshita AI acts as your personal team of experts across multiple domains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Code size={24} />
              </div>
              <h3 className="text-lg font-bold">Coding Agent</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Full repository analysis, bug fixing, automated PR generation, and code deployment.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4 hover:border-violet-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Scale size={24} />
              </div>
              <h3 className="text-lg font-bold">Legal AI</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Court-ready legal notices, affidavits, agreements, and government applications in Hindi & English.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4 hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Video size={24} />
              </div>
              <h3 className="text-lg font-bold">Video & Image AI</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Generate short-form educational videos, AI avatars, logos, and process documents via OCR.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl space-y-4 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-bold">Business & Rural Help</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Manage GST billing, inventory, and help rural citizens access government schemes effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium AI Drafting Tools Directory */}
      <section id="draft-tools" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-[#0b0d19]/30">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Legal Engine</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Drafting Assistants</h2>
            <p className="text-sm text-gray-400">Generate court-ready agreements, legal notices, and certificates in minutes with our zero-placeholder quality gates.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
            {DRAFTING_TOOLS.slice(0, showAllDrafting ? DRAFTING_TOOLS.length : 6).map((tool, idx) => (
              <Link 
                key={idx} 
                to={tool.href || `/tools/${tool.slug}`}
                className="group h-[140px] p-3.5 rounded-xl bg-[#0f111a] border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-1">
                  <span className="text-2xl block group-hover:scale-110 transition-transform origin-left">{tool.icon}</span>
                  <h3 className="font-bold text-white text-xs leading-tight group-hover:text-amber-400 transition-colors truncate">{tool.name}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{tool.desc}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold border-t border-white/[0.02] pt-2">
                  <span>Launch</span>
                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {!showAllDrafting && DRAFTING_TOOLS.length > 6 && (
            <div className="text-center pt-4">
              <button 
                onClick={() => setShowAllDrafting(true)}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                View All ({DRAFTING_TOOLS.length}) →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Programmatic Tools Directory */}
      <section id="tools" className="py-16 px-4 sm:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Free Conversion Suite</h2>
              <p className="text-sm text-gray-400 max-w-xl">Double-click or open any tool below to perform offline document, image, and voice conversion.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TOOLS_LIST.slice(0, showAllTools ? TOOLS_LIST.length : 6).map((tool, idx) => (
              <a 
                key={idx} 
                href={tool.href} 
                className="group h-[140px] p-3.5 rounded-xl bg-[#0f111a] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-1">
                  <span className="text-2xl block group-hover:scale-110 transition-transform origin-left">{tool.icon}</span>
                  <h3 className="font-bold text-white text-xs leading-tight group-hover:text-indigo-400 transition-colors truncate">{tool.name}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{tool.desc}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold border-t border-white/[0.02] pt-2">
                  <span>Launch</span>
                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>

          {!showAllTools && TOOLS_LIST.length > 6 && (
            <div className="text-center pt-4">
              <button 
                onClick={() => setShowAllTools(true)}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                View All ({TOOLS_LIST.length}) →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-8 border-t border-white/5 bg-[#0b0d19]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Trusted by Thousands in India</h2>
            <p className="text-sm text-gray-400">See what our users say about Harshita AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
               <div key={idx} className="p-6 rounded-2xl bg-[#0f111a] border border-white/5 shadow-xl relative">
                  <div className="absolute top-4 right-4 text-4xl text-white/5 font-serif">"</div>
                  <p className="text-sm text-gray-300 italic mb-6 relative z-10 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {t.name[0]}
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-white">{t.name}</h4>
                        <span className="text-xs text-gray-500">{t.role}</span>
                     </div>
                  </div>
               </div>
            ))}
          </div>
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
          <div className="text-center mt-8">
            <Link to="/faq" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors inline-flex items-center gap-1">
               View All 100+ FAQs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-8 border-t border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-indigo-900/20 pointer-events-none"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Ready to transform your work?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Join the future of Indian automation with Harshita AI. From coding and websites to court-ready legal drafts.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <Link to="/login" className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20">
                  Get Started for Free
               </Link>
               <Link to="/contact" className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all">
                  Contact Sales
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}

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
  const [aiPrompt, setAiPrompt] = useState('')

  const filteredTools = TOOLS_LIST.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if(aiPrompt.trim()) {
      window.location.href = `/login?prompt=${encodeURIComponent(aiPrompt)}`;
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden">
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
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Code software, draft legal documents, write government applications, generate videos, build websites, and automate your entire business—all in one place.
          </motion.p>

          {/* AI Prompt Box */}
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
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask Harshita AI to draft a document, write code, or create a video..." 
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 py-3 px-2 text-sm sm:text-base"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex items-center gap-2">
                  Generate <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-gray-400">
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setAiPrompt('Draft a Rent Agreement for 11 months')}>Rent Agreement</span>
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setAiPrompt('Write a React component for a dashboard')}>Code Dashboard</span>
              <span className="cursor-pointer hover:text-indigo-400 px-3 py-1 rounded-full bg-white/5 border border-white/10" onClick={() => setAiPrompt('Generate a marketing video for my shop')}>Create Video</span>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Grid Features - Core Capabilities */}
      <section id="features" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
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
      <section id="draft-tools" className="py-20 px-4 sm:px-8 border-t border-white/5 bg-[#0b0d19]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Legal Engine</span>
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

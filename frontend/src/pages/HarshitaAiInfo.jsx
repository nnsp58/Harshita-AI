import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bot, Shield, Cpu, Video, Scale, HelpCircle, 
  ArrowLeft, CheckCircle2, Star, Zap, Terminal, Globe, 
  Layers, Settings, Sparkles, BookOpen, AlertTriangle
} from 'lucide-react'

export default function HarshitaAiInfo() {
  const navigate = useNavigate()

  React.useEffect(() => {
    document.title = "Harshita AI - The Ultimate AI Agent & Automation Platform | N-Dizi"
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <span className="text-sm font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
            <Bot size={16}/> Harshita AI Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold transition-all">
            Operator Login
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 relative py-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300"
          >
            <Sparkles size={12} className="text-indigo-400 animate-spin" />
            Empowering Digital Evolution
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Harshita AI: The Ultimate <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Agent & Automation Platform
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Explore Harshita AI, a self-evolving AI assistant, learning platform, and automation ecosystem built specifically for CSC operators, VLE networks, and modern developers.
          </p>
        </section>

        {/* Introduction Section */}
        <section className="bg-[#0f111a] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="text-indigo-400" size={24} />
            What is Harshita AI?
          </h2>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>
              Harshita AI is a state-of-the-art AI agent and automation ecosystem designed by <strong>N-Dizi</strong> to bridge the gap between complex artificial intelligence capabilities and day-to-day digital service operations. At its core, the platform acts as an intelligent operating layer that automates complex workloads including legally-compliant drafting, multi-format media generation, learning systems, and system state monitors.
            </p>
            <p>
              Unlike traditional single-purpose chat systems, Harshita AI operates as a <strong>multitasking autonomous agent network</strong>. It features dynamic user goals alignment (customizing layouts dynamically for business owners, legal users, students, or content creators), a comprehensive 50+ smart skills registry, automated video production systems, and an advanced self-healing technical supervisor that continually diagnoses and repairs platform metrics.
            </p>
            <p>
              By hosting Harshita AI directly inside the e-governance and service network portal, CSC (Common Service Center) operators and VLE (Village Level Entrepreneurs) can seamlessly serve millions of customers with high-quality legal drafts, automated photo processing, resume generation, and academic modules. The system lowers the entry barrier for technical tasks, transforming any local digital center into an AI-powered hub.
            </p>
          </div>
        </section>

        {/* 50+ Skills Center */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Cpu className="text-indigo-400" size={24} />
              50+ Autonomous AI Skills
            </h2>
            <p className="text-gray-400 text-sm max-w-3xl">
              Harshita AI operates using a structured modular skill framework. The assistant automatically matches the user's incoming prompts or administrative requests to the most appropriate skill handler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Scale size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Legal & Compliance Drafting</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Automates drafting of notarized affidavits, rent covenants, gift deeds, eviction notices, and summary suit claims with legal precision and state-specific compliance configurations.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Video size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Multimodal Media Production</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Empowers content creators with storyboard-to-video compilation, automatic voiceovers (TTS), background music pairing, AI image generations, and subtitle synchronizations.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Self-Healing Diagnostics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                A system health HUD that tracks frontend UX exceptions, API responsiveness, database schemas, and SEO indexes, applying automated repairs to keep the platform online.
              </p>
            </div>
          </div>

          {/* Table of Major Skill Categories */}
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white">Functional Mapping of Harshita AI Skills</h3>
            </div>
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Skill Category</th>
                    <th className="p-4">Included Skills</th>
                    <th className="p-4">Primary Target Users</th>
                    <th className="p-4">Automated Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 text-xs">
                  <tr>
                    <td className="p-4 font-bold text-white">Legal Suite</td>
                    <td className="p-4">Affidavits, Wills, Power of Attorney, Eviction Notices, Deeds</td>
                    <td className="p-4">CSC Operators, Citizens, Legal Practitioners</td>
                    <td className="p-4">Prompt: "Rent agreement draft..."</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Content Hub</td>
                    <td className="p-4">Voiceovers, Storyboard Builder, Image Prompter, Subtitles generator</td>
                    <td className="p-4">Creators, Marketers, Students</td>
                    <td className="p-4">Prompt: "Make a story video about..."</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Business Tools</td>
                    <td className="p-4">ITR Filing Helper, Naksha Mapper, Resume Maker, Bulk Importers</td>
                    <td className="p-4">VLE Networks, Job Seekers, Land Surveyors</td>
                    <td className="p-4">Prompt: "Prepare resume for..."</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">AI Assistant Core</td>
                    <td className="p-4">OCR Document Extractor, Language Translator, Speech-to-Text</td>
                    <td className="p-4">General Users, Students, Operators</td>
                    <td className="p-4">Voice Command or PDF Upload</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">System Monitor</td>
                    <td className="p-4">Self-Healing Audits, SEO Optimizer, API Health score gauges</td>
                    <td className="p-4">Developers, Server Administrators</td>
                    <td className="p-4">Cron (Every 24 Hours) & Bootup</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Legal Drafting Engine */}
        <section className="bg-[#0f111a] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="text-indigo-400" size={24} />
            Automated Legal Drafting Engine
          </h2>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>
              One of the most powerful and highly-utilized modules within Harshita AI is the **Legal & Covenant Drafting Engine**. In Indian administrative and civil procedures, documents like non-judicial affidavits, partition deeds, gift deeds, eviction notices, and rent covenants require strict structure, specific act references, and accurate stamp paper configurations. 
            </p>
            <p>
              Harshita AI automates this process through custom structured models that contain deep knowledge of Indian statutory frameworks, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-gray-400">
              <li><strong>The Registration Act, 1908 & The Indian Stamp Act, 1899:</strong> Ensures documents are mapped to the correct state-wise stamp paper values.</li>
              <li><strong>Section 138 of the Negotiable Instruments (NI) Act, 1881:</strong> Forms legally-binding Cheque Bounce notices with strict timelines.</li>
              <li><strong>Section 80 of the Civil Procedure Code (CPC), 1908:</strong> Formulates pre-suit notice representations to government bodies.</li>
              <li><strong>Indian Succession Act, 1925 (Section 63):</strong> Guides the clear drafting of Wills with witness alignment rules.</li>
            </ul>
            <p>
              By leveraging this engine, VLEs can type plain conversational text (e.g., <em>"Uttar Pradesh ka flat rent agreement draft karo 11 month ka, landlord ka naam Ramesh aur tenant ka Suresh"</em>) and obtain a formatted, professionally aligned legal draft. The agent validates input parameters, formats placeholders, and packages the content into a print-ready layout, saving hours of manual formatting.
            </p>
          </div>
        </section>

        {/* AI Video Agent */}
        <section className="bg-[#0f111a] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Video className="text-indigo-400" size={24} />
            Story Video Agent & Pipeline
          </h2>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>
              For content creators, educators, and social media professionals, Harshita AI includes an autonomous **Story Video Generator**. Creating engaging short-form video stories usually requires multiple disjointed steps: scriptwriting, voiceover recording, image generating, subtitles timing, video clip compiling, and music mixing.
            </p>
            <p>
              Harshita AI condenses this entire workflow into a single command pipeline:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center pt-2">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs font-bold text-indigo-400 block mb-1">1. Scripting</span>
                <span className="text-[10px] text-gray-500">Generates scene script & prompts</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs font-bold text-indigo-400 block mb-1">2. Voiceover</span>
                <span className="text-[10px] text-gray-500">Converts script text to natural speech</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs font-bold text-indigo-400 block mb-1">3. Art Creation</span>
                <span className="text-[10px] text-gray-500">Generates matching high-quality images</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs font-bold text-indigo-400 block mb-1">4. Compilation</span>
                <span className="text-[10px] text-gray-500">Binds audio, image, music & subtitles</span>
              </div>
            </div>
            <p>
              The compilation engine utilizes server-side utilities (like FFmpeg) to sync voice overs with matching visuals, superimpose synchronized SRT subtitles, mix ambient soundtrack layers, and stitch individual scenes into a final downloadable `.mp4` video. This allows creators to go from a simple text prompt to a finished video story in minutes.
            </p>
          </div>
        </section>

        {/* Self-Healing Agent */}
        <section className="bg-[#0f111a] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-2xl rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="text-indigo-400" size={24} />
            Self-Healing Agent: System HUD
          </h2>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>
              Maintaining application health and minimizing downtime is vital for any enterprise system. Harshita AI implements a **Self-Healing Agent System**, transforming traditional application logs into an active, self-correcting maintenance supervisor.
            </p>
            <p>
              The Self-Healing module performs automated system audits on application startup, after deployments, and every 24 hours. The module monitors six critical pillars:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-gray-400">
              <li><strong>Technical Monitor:</strong> Validates database connection pools, local file storage configurations, and core server configurations.</li>
              <li><strong>Feature Monitor:</strong> Audits critical service flows (e.g. OCR parser, PDF compiler, Gemini API).</li>
              <li><strong>UX Monitor:</strong> Scans logs for frontend rendering failures or broken page routes.</li>
              <li><strong>SEO Monitor:</strong> Checks the health of sitemap structures, robots.txt, and meta tags.</li>
              <li><strong>Deployment Monitor:</strong> Verifies server package integrity, node processes, and build assets.</li>
              <li><strong>Skills Monitor:</strong> Conducts diagnostics checks on all custom skill handlers in the registry.</li>
            </ul>
            <p>
              Each run produces a comprehensive health report and computes an overall **Health Score (0-100)**. When a failure is detected, the agent logs the root cause, assigns a severity tier, and checks if an automated fix is available. If an automated repair is possible (like rebuilding database index files, regenerating local configurations, or clearing corrupted caches), the system applies it immediately and logs the correction in the permanent Improvement Registry.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
              <HelpCircle className="text-indigo-400" size={24} />
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Got questions about Harshita AI? Here are detailed explanations about the platform's usage, security, and setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                How do I log in to Harshita AI?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Harshita AI Phase 1 utilizes Google Sign-In as the sole authentication mechanism. Users do not need to register with traditional email/password credentials; instead, click the "Sign in with Google" button for instant, secure access.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                Who is the developer of Harshita AI?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Harshita AI is an advanced AI Agent Platform developed by **N-Dizi**, designed to support local digital operators, content creators, and administrative networks.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                Are my drafted legal documents legally valid?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Yes, documents generated by the Legal Drafting Engine use standard professional formatting and incorporate appropriate statutory references under Indian laws. However, it is always recommended to verify the content and print on correct value non-judicial stamp papers before final execution.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                How does the Self-Healing system resolve errors?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                The Self-Healing system actively audits database schemas, system files, and external APIs. When it detects standard issues like minor file inconsistencies or missing database indices, it runs custom correction scripts dynamically in the background.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                Can I request custom features or courses?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Absolutely! Through the Settings dashboard, users can toggle goal preferences (like business owner, content creator, or student). The welcome dashboard adjusts its recommended tools and tutorials to align with your chosen preference.
              </p>
            </div>

            <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                Are file uploads secure during media conversion?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Yes. The platform follows modern security protocols. Files processed by local scripts are handled in-browser, while files uploaded to our servers are cleared automatically after processing is complete.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c13] py-8 text-center text-xs text-gray-500">
        <p>&copy; 2026 Harshita AI by n-dizi.in. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/privacy-policy.html" className="hover:text-white">Privacy Policy</a>
          <a href="/terms.html" className="hover:text-white">Terms</a>
          <a href="/disclaimer.html" className="hover:text-white">Disclaimer</a>
        </div>
      </footer>
    </div>
  )
}

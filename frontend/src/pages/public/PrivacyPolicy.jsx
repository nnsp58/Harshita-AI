import React from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/SEO'
import Footer from '../../components/Footer'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
      <SEO 
        title="Privacy Policy" 
        description="Read how Harshita AI protects your personal information, handles your data, and respects your privacy."
      />
      
      <header className="bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">Harshita AI</Link>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-8 py-16">
        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">Last Updated: July 1, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
          <h2>1. Introduction</h2>
          <p>Welcome to Harshita AI. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our AI services, web application, and related tools (collectively, the "Services").</p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
             <li><strong>Account Information:</strong> Name, email address, phone number, and CSC/VLE credentials.</li>
             <li><strong>Usage Data:</strong> Pages visited, tools used, and interaction patterns.</li>
             <li><strong>User Content:</strong> Text inputs, prompts, uploaded files, and generated outputs. <em>Note: Uploaded files are processed strictly for the requested output and are automatically purged from our servers within 24 hours.</em></li>
          </ul>

          <h2>3. AI Processing & Third-Party Services</h2>
          <p>Harshita AI utilizes proprietary local AI models as well as third-party AI APIs (e.g., Google Gemini, Groq, OpenAI). When using cloud-based AI tools, your prompts may be sent securely to these third-party providers. We do not use your private data to train public AI models.</p>

          <h2>4. Cookies & Analytics</h2>
          <p>We use essential cookies to manage sessions and analytics cookies (such as Google Analytics) to understand usage patterns. You can view our detailed <Link to="/cookie-policy">Cookie Policy here</Link>.</p>

          <h2>5. Data Retention & Security</h2>
          <p>We implement industry-standard encryption (SSL/TLS) for data in transit. Your generated legal drafts and documents are accessible only to you. You may delete your account and associated data at any time via your Account Settings.</p>

          <h2>6. User Rights</h2>
          <p>Depending on your jurisdiction, you have the right to access, correct, or delete your personal data. Contact us at <code>privacy@harshita-ai.in</code> to exercise these rights.</p>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: <a href="mailto:support@harshita-ai.in">support@harshita-ai.in</a><br />
             Address: New Delhi, India
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

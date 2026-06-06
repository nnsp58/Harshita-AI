import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, User, Phone, Mail, FileText, Bot } from 'lucide-react'

export default function ContactUs() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to send message')
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Contact n-dizi Team</h1>
              <p className="text-sm text-gray-400 mt-1">Harshita AI Support & Inquiries</p>
            </div>
          </div>

          {status === 'success' ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-400 mb-6">Thank you for reaching out. Our team will contact you shortly.</p>
              <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                Return to Dashboard
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-amber-500/50" placeholder="Rahul Kumar" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone / Mobile *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-amber-500/50" placeholder="9876543210" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-amber-500/50" placeholder="rahul@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Subject / Purpose *</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-amber-500/50" placeholder="Requirement for CSC Center" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Message *</label>
                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500/50 resize-none" placeholder="Write your message here..."></textarea>
              </div>

              {status === 'error' && <p className="text-red-400 text-xs">Failed to send message. Please try again.</p>}

              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-bold text-black flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20">
                {status === 'loading' ? 'Sending...' : <><Send size={18} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

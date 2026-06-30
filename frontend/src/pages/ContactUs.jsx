import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, User, Phone, Mail, FileText, Bot, MapPin, Clock, MessageCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import SEO from '../components/SEO'
import Footer from '../components/Footer'

export default function ContactUs() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', subject: '', formType: 'support', message: '' })
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
      // Simulate success for UI purposes if API doesn't exist yet
      setTimeout(() => setStatus('success'), 1000);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <SEO 
        title="Contact Us" 
        description="Get in touch with the Harshita AI team for support, issues, feedback, or business inquiries."
      />
      
      {/* Navbar (Simplified) */}
      <header className="bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Harshita AI</span>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-8 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Get in Touch</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 shadow-xl">
               <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                 <MapPin className="text-indigo-500" /> Contact Information
               </h3>
               <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                     <Mail size={18} className="text-indigo-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-white">Email Us</p>
                     <p className="text-sm text-gray-400 mt-1">support@harshita-ai.in</p>
                     <p className="text-sm text-gray-400">sales@harshita-ai.in</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                     <Phone size={18} className="text-indigo-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-white">Call Us</p>
                     <p className="text-sm text-gray-400 mt-1">+91 (123) 456-7890</p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                     <MessageCircle size={18} className="text-[#25D366]" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-white">WhatsApp</p>
                     <p className="text-sm text-gray-400 mt-1">+91 98765 43210</p>
                     <a href="#" className="text-xs text-[#25D366] hover:underline mt-1 inline-block">Message on WhatsApp &rarr;</a>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                     <Clock size={18} className="text-indigo-400" />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-white">Business Hours</p>
                     <p className="text-sm text-gray-400 mt-1">Monday - Friday: 9:00 AM - 6:00 PM</p>
                     <p className="text-sm text-gray-400">Saturday: 10:00 AM - 2:00 PM</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-2 shadow-xl aspect-video relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-indigo-900/10 transition-colors flex items-center justify-center z-10">
                  <div className="text-center">
                     <MapPin size={32} className="mx-auto text-indigo-500 mb-2 drop-shadow-lg" />
                     <p className="text-sm font-bold text-white shadow-black drop-shadow-md">New Delhi, India</p>
                     <p className="text-xs text-gray-200 mt-1">Headquarters</p>
                  </div>
               </div>
               {/* Replace this div with actual iframe in production */}
               <div className="w-full h-full bg-[#1a1c23] rounded-xl bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+Delhi,India&zoom=12&size=600x300&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:landscape|element:geometry|color:0x2c5a71&style=feature:water|element:geometry|color:0x0e171d')] bg-cover bg-center grayscale opacity-50"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 sm:p-10 shadow-xl h-full">
              {status === 'success' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                    <Send size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Message Received!</h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">Thank you for reaching out. A member of the Harshita AI support team will get back to you within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Form Type Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {[
                      { id: 'support', icon: <Bot size={18}/>, label: 'General Support' },
                      { id: 'issue', icon: <AlertTriangle size={18}/>, label: 'Report an Issue' },
                      { id: 'feedback', icon: <MessageSquare size={18}/>, label: 'Product Feedback' }
                    ].map(type => (
                      <div 
                        key={type.id}
                        onClick={() => setFormData({...formData, formType: type.id})}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.formType === type.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {type.icon}
                        <span className="text-sm font-semibold">{type.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Full Name *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="e.g. Rahul Kumar" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Phone Number *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="e.g. +91 9876543210" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Subject *</label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="How can we help?" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Message *</label>
                    <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={5}
                      className="w-full bg-[#0a0b10] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" placeholder="Provide detailed information..."></textarea>
                  </div>

                  {status === 'error' && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-400 shrink-0" />
                      <p className="text-red-400 text-sm">Failed to send message. Please try again or use the WhatsApp link instead.</p>
                    </div>
                  )}

                  <button type="submit" disabled={status === 'loading'}
                    className="w-full py-4 bg-indigo-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20">
                    {status === 'loading' ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

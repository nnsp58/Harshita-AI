// frontend/src/pages/FaqList.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { ALL_FAQS } from '../data/faqContent'

export default function FaqList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  const categories = ['All', 'Legal Draft FAQ', 'Affidavit FAQ', 'Notice FAQ', 'Government Application FAQ', 'Resume FAQ']

  // Filter FAQs
  const filteredFaqs = ALL_FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setOpenFaqIdx(null)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setOpenFaqIdx(null)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Home
        </button>
        <span className="text-sm font-bold tracking-wider uppercase text-amber-500">
          ❓ Frequently Asked Questions (FAQ)
        </span>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Banner */}
      <section className="relative py-14 px-4 text-center overflow-hidden border-b border-white/5 bg-white/[0.005]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            N-Dizi Help & Support FAQ
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Search our comprehensive directory of 200+ detailed responses regarding legal notices, affidavits, government applications, and resume layouts.
          </p>
        </div>
      </section>

      {/* Main Filter & Accordion Grid */}
      <main className="max-w-5xl mx-auto p-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-start w-full md:w-auto">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {cat.replace(' FAQ', '')}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search 200+ FAQs..."
              className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500/50 text-white placeholder-gray-500 transition-colors"
            />
          </div>
        </div>

        {/* Total results count */}
        <div className="text-xs text-gray-500 border-b border-white/5 pb-2">
          Showing {filteredFaqs.length} of {ALL_FAQS.length} FAQ entries
        </div>

        {/* FAQs list */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-[#0f111a] border border-white/5 rounded-2xl overflow-hidden shadow-md transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-gray-200 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-indigo-500 flex-shrink-0" />
                    {faq.q}
                  </span>
                  {openFaqIdx === idx ? <ChevronUp size={18} className="text-amber-500" /> : <ChevronDown size={18} />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaqIdx === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-[#07080d]"
                    >
                      <p className="p-5 text-xs text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <HelpCircle size={40} className="mx-auto text-gray-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-400">No FAQ answers match your query</h3>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-3 text-amber-500 text-sm font-semibold hover:underline">Reset All Filters</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c13] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} N-Dizi AI. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/privacy-policy.html" className="hover:text-white">Privacy Policy</a>
          <a href="/terms.html" className="hover:text-white">Terms</a>
          <a href="/disclaimer.html" className="hover:text-white">Disclaimer</a>
        </div>
      </footer>
    </div>
  )
}

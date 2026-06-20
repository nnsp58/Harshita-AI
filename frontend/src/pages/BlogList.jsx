// frontend/src/pages/BlogList.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Search, ArrowRight, Clock, Calendar, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ALL_BLOG_POSTS } from '../data/blogContent'

const ITEMS_PER_PAGE = 12

export default function BlogList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  const categories = ['All', 'Legal Advice', 'CSC Utilities', 'Government Schemes', 'Career & Job Guide', 'Business Analytics']

  // Filter posts
  const filteredPosts = ALL_BLOG_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Paginate posts
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <BookOpen size={16} /> Home
        </button>
        <span className="text-sm font-bold tracking-wider uppercase text-amber-500">
          📰 N-Dizi Official Blog
        </span>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 px-4 text-center overflow-hidden border-b border-white/5 bg-white/[0.005]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            N-Dizi Resources & Insights
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Stay updated with standard legal regulations, state stamp duty thresholds, CSC utility guides, and professional drafting benchmarks.
          </p>
        </div>
      </section>

      {/* Directory Filter Bar */}
      <section className="max-w-7xl mx-auto p-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-start w-full md:w-auto">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search 100+ articles..."
              className="w-full bg-[#0a0b10] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500/50 text-white placeholder-gray-500 transition-colors"
            />
          </div>
        </div>

        {/* Post Grid */}
        {paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {paginatedPosts.map((post, idx) => (
              <Link 
                key={idx} 
                to={`/blog/${post.slug}`}
                className="group bg-[#0f111a] border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/[0.02] transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    <span>{post.category}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                    {post.summary || post.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.02] flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar size={12}/> {post.date}</span>
                  <span className="font-bold text-amber-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Article <ArrowRight size={12}/>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <HelpCircle size={40} className="mx-auto text-gray-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-400">No blog posts match your criteria</h3>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-3 text-amber-500 text-sm font-semibold hover:underline">Reset All Filters</button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-10">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

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

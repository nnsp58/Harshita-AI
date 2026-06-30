import React from 'react'
import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#08090f] py-12 px-4 sm:px-8 text-sm text-gray-400 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Harshita AI</span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs">
            India's most powerful AI platform for coding, legal documents, automation, education, and business management.
          </p>
          <div className="flex gap-4 pt-2">
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
             <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Core Products</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/ai-skills" className="hover:text-white transition-colors">AI Skills</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Professional Services</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/tools/affidavit-generator" className="hover:text-white transition-colors">Legal Drafting</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/release-notes" className="hover:text-white transition-colors">Release Notes</Link></li>
            <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/copyright" className="hover:text-white transition-colors">Copyright Policy</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Community Guidelines</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span>&copy; {new Date().getFullYear()} Harshita AI. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="/robots.txt" className="hover:text-white transition-colors">robots.txt</a>
          <a href="/sitemap.xml" className="hover:text-white transition-colors">sitemap.xml</a>
          <a href="/ads.txt" className="hover:text-white transition-colors">ads.txt</a>
        </div>
      </div>
    </footer>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'

const checklistItems = [
  'Upload Documents',
  'Add Candidates',
  'Create First Job',
  'Connect WhatsApp',
]

const faqItems = [
  {
    question: 'How do I add candidates?',
    answer: 'Go to Candidates page or use Bulk Import with an Excel file.',
  },
  {
    question: 'How does the automation work?',
    answer: "Select a candidate, choose a service, and Rawan's agents will fill forms automatically.",
  },
  {
    question: 'What documents do I need?',
    answer: 'Aadhaar, marksheets, photos, and signatures are commonly required.',
  },
  {
    question: 'How do I check job status?',
    answer: 'Visit the Job Queue page to see all running and completed jobs.',
  },
]

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-maroon-600 hover:bg-maroon-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Open help panel"
      >
        <HelpCircle size={24} />
      </button>

      {/* Panel + Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 max-w-full z-50 bg-white dark:bg-navy-900 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
                <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                  Help & Getting Started
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                  aria-label="Close help panel"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Getting Started Checklist */}
              <div className="p-4 border-b border-gray-200 dark:border-navy-700">
                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Getting Started
                </h3>
                <ul className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-gray-300 dark:text-navy-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Tips / FAQ */}
              <div className="p-4 border-b border-gray-200 dark:border-navy-700">
                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">
                  Quick Tips
                </h3>
                <div className="space-y-2">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="rounded-lg border border-gray-100 dark:border-navy-700 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {faq.question}
                        </span>
                        {expandedFaq === index ? (
                          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-3 pb-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="p-4">
                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Need help? Email{' '}
                  <a
                    href="mailto:support@rawan.ai"
                    className="text-maroon-600 dark:text-maroon-400 font-medium hover:underline"
                  >
                    support@rawan.ai
                  </a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

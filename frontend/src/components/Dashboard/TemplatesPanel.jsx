import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Scale, Briefcase, X, ChevronRight } from 'lucide-react';

// Rule 7: Editable Templates for all major document types
const TEMPLATES = [
  {
    category: 'Applications',
    icon: FileText,
    color: 'from-blue-600 to-indigo-600',
    items: [
      {
        id: 'leave_application',
        title: 'Leave Application',
        titleHi: 'छुट्टी की एप्लीकेशन',
        prompt: 'प्रधानाचार्य को 2 दिन की बीमारी की छुट्टी की एप्लीकेशन लिखो'
      },
      {
        id: 'principal_application',
        title: 'Principal Application',
        titleHi: 'प्रधानाचार्य को प्रार्थना पत्र',
        prompt: 'विद्यालय प्रधानाचार्य को TC के लिए प्रार्थना पत्र लिखो'
      },
      {
        id: 'electricity_complaint',
        title: 'Electricity Complaint',
        titleHi: 'बिजली शिकायत पत्र',
        prompt: 'अधिशासी अभियंता को बिजली कटौती की शिकायत पत्र लिखो'
      },
      {
        id: 'police_complaint',
        title: 'Police Complaint',
        titleHi: 'पुलिस शिकायत पत्र',
        prompt: 'थानाध्यक्ष को चोरी की FIR के लिए शिकायत पत्र लिखो'
      },
      {
        id: 'consumer_complaint',
        title: 'Consumer Complaint',
        titleHi: 'उपभोक्ता शिकायत',
        prompt: 'उपभोक्ता फोरम में खराब सामान की शिकायत का प्रार्थना पत्र लिखो'
      },
      {
        id: 'rti',
        title: 'RTI Application',
        titleHi: 'सूचना का अधिकार',
        prompt: 'सार्वजनिक सूचना अधिकारी को RTI आवेदन पत्र लिखो'
      },
    ]
  },
  {
    category: 'Legal Documents',
    icon: Scale,
    color: 'from-rose-600 to-red-700',
    items: [
      {
        id: 'legal_notice',
        title: 'Legal Notice',
        titleHi: 'वकील नोटिस',
        prompt: 'बकाया भुगतान के लिए कानूनी नोटिस लिखो'
      },
      {
        id: 'affidavit',
        title: 'Affidavit',
        titleHi: 'शपथपत्र',
        prompt: 'आय के संबंध में शपथ पत्र तैयार करो'
      },
      {
        id: 'agreement',
        title: 'Rent Agreement',
        titleHi: 'किराया अनुबंध',
        prompt: 'मकान किराया अनुबंध पत्र बनाओ 11 महीने के लिए'
      },
    ]
  },
  {
    category: 'Career',
    icon: Briefcase,
    color: 'from-emerald-600 to-teal-600',
    items: [
      {
        id: 'resume',
        title: 'Resume',
        titleHi: 'रिज्यूमे',
        prompt: 'एक professional resume बनाओ'
      },
    ]
  }
];

/**
 * TemplatesPanel — Rule 7: Provides editable templates for all major document types
 * Props:
 *   onSelect(prompt) — called when user selects a template, passes the AI prompt
 *   onClose() — close the panel
 */
export default function TemplatesPanel({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="h-full flex flex-col bg-[#050714] border-r border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">📋 Templates</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Quick start any document</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Template Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {TEMPLATES.map((cat) => {
          const Icon = cat.icon;
          const isOpen = activeCategory === cat.category;
          return (
            <div key={cat.category} className="rounded-lg border border-white/5 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setActiveCategory(isOpen ? null : cat.category)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Icon size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-200">{cat.category}</span>
                  <span className="text-[9px] text-gray-500 bg-white/5 rounded px-1.5 py-0.5">{cat.items.length}</span>
                </div>
                <ChevronRight
                  size={12}
                  className={`text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Template Items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-white/5">
                      {cat.items.map((item) => (
                        <button
                          key={item.id}
                          id={`template-${item.id}`}
                          onClick={() => {
                            onSelect && onSelect(item.prompt);
                            onClose && onClose();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-500/10 transition-colors group text-left"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-200 group-hover:text-indigo-300 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-gray-500">{item.titleHi}</p>
                          </div>
                          <ChevronRight size={10} className="text-gray-600 group-hover:text-indigo-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-[9px] text-gray-600 text-center">
          💡 Template se shuru karein, phir customize karein
        </p>
      </div>
    </div>
  );
}

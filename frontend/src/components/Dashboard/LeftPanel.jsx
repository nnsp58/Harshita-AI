import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, Clock, ChevronDown, ChevronRight, FileText, 
  Landmark, Scale, Briefcase, Bot, Image as ImageIcon, 
  TrendingUp, Settings, Wrench, Sparkles, AlertCircle, Video, Music, LayoutTemplate
} from 'lucide-react';
import { useStore } from '../../store';
import TemplatesPanel from './TemplatesPanel';

// Master Data: Categories, Services, and Templates
// Each item explicitly defines its target Workspace and bound Agent
const NAVIGATION_DATA = [
  {
    id: 'cat-documents',
    name: 'Documents',
    icon: FileText,
    items: [
      { id: 'resume_builder', title: 'Resume Builder', type: 'service', workspace: 'Document', agent: 'ResumeAgent', status: 'Ready' },
      { id: 'doc_ocr', title: 'Document Scanner', type: 'service', workspace: 'Image', agent: 'VisionAgent', status: 'Premium' },
    ],
    templates: [
      { id: 'leave_app', title: 'Leave Application', type: 'template', workspace: 'Document', agent: 'ApplicationAgent' },
      { id: 'principal_app', title: 'Principal Application', type: 'template', workspace: 'Document', agent: 'ApplicationAgent' },
      { id: 'complaint_ltr', title: 'Complaint Letter', type: 'template', workspace: 'Document', agent: 'ApplicationAgent' },
      { id: 'rent_agreement', title: 'Rent Agreement', type: 'template', workspace: 'Document', agent: 'LegalAgent' },
    ]
  },
  {
    id: 'cat-gov',
    name: 'Government Services',
    icon: Landmark,
    items: [
      { id: 'ration_card', title: 'Ration Card Form', type: 'service', workspace: 'Document', agent: 'FormAgent', status: 'Ready' },
      { id: 'pension', title: 'Pension Check', type: 'service', workspace: 'Document', agent: 'GovAgent', status: 'Beta' },
    ],
    templates: [
      { id: 'electricity', title: 'Electricity Complaint', type: 'template', workspace: 'Document', agent: 'ApplicationAgent' },
      { id: 'water', title: 'Water Complaint', type: 'template', workspace: 'Document', agent: 'ApplicationAgent' },
    ]
  },
  {
    id: 'cat-legal',
    name: 'Legal',
    icon: Scale,
    items: [
      { id: 'legal_draft', title: 'Legal Drafting', type: 'service', workspace: 'Document', agent: 'LegalAgent', status: 'Ready' },
      { id: 'affidavit', title: 'Affidavit Maker', type: 'service', workspace: 'Document', agent: 'LegalAgent', status: 'Premium' },
    ],
    templates: [
      { id: 'legal_notice', title: 'Legal Notice', type: 'template', workspace: 'Document', agent: 'LegalAgent' },
      { id: 'reply_notice', title: 'Reply Notice', type: 'template', workspace: 'Document', agent: 'LegalAgent' },
      { id: 'consumer_complaint', title: 'Consumer Complaint', type: 'template', workspace: 'Document', agent: 'LegalAgent' },
    ]
  },
  {
    id: 'cat-jobs',
    name: 'Jobs & Career',
    icon: Briefcase,
    items: [
      { id: 'job_search', title: 'Find Jobs', type: 'service', workspace: 'Website', agent: 'JobAgent', status: 'Ready' },
      { id: 'interview_prep', title: 'Mock Interview', type: 'service', workspace: 'Chat', agent: 'InterviewAgent', status: 'Beta' },
    ]
  },
  {
    id: 'cat-ai',
    name: 'AI Tools',
    icon: Bot,
    items: [
      { id: 'prompt_writer', title: 'Prompt Writer', type: 'service', workspace: 'Document', agent: 'PromptAgent', status: 'Ready' },
      { id: 'translation', title: 'Smart Translation', type: 'service', workspace: 'Document', agent: 'TranslationAgent', status: 'Ready' },
    ]
  },
  {
    id: 'cat-media',
    name: 'Media Studio',
    icon: ImageIcon,
    items: [
      { id: 'image_gen', title: 'Image Generation', type: 'service', workspace: 'Image', agent: 'VisionAgent', status: 'Premium' },
      { id: 'video_gen', title: 'Video Generator', type: 'service', workspace: 'Video', agent: 'MediaAgent', status: 'Loading' },
    ],
    templates: [
      { id: 'poster', title: 'Poster', type: 'template', workspace: 'Canvas', agent: 'MediaAgent' },
      { id: 'thumbnail', title: 'Thumbnail', type: 'template', workspace: 'Canvas', agent: 'MediaAgent' },
      { id: 'product_ad', title: 'Product Ad', type: 'template', workspace: 'Canvas', agent: 'MediaAgent' },
    ]
  },
  {
    id: 'cat-business',
    name: 'Business',
    icon: TrendingUp,
    items: [
      { id: 'itr_filing', title: 'ITR Filing', type: 'service', workspace: 'Spreadsheet', agent: 'FinanceAgent', status: 'Ready' },
      { id: 'invoice_gen', title: 'Invoice Generator', type: 'service', workspace: 'Spreadsheet', agent: 'FinanceAgent', status: 'Ready' },
    ]
  },
  {
    id: 'cat-utilities',
    name: 'Utilities',
    icon: Wrench,
    items: [
      { id: 'tada', title: 'TA-DA Calculator', type: 'service', workspace: 'Calculator', agent: 'MathAgent', status: 'Ready' },
      { id: 'whatsapp_sender', title: 'WhatsApp Blast', type: 'service', workspace: 'Document', agent: 'CommunicationAgent', status: 'Offline' },
    ]
  }
];

// Badge component for AI Indicators
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const colors = {
    Ready: 'bg-emerald-500/20 text-emerald-400',
    Premium: 'bg-amber-500/20 text-amber-400',
    Beta: 'bg-indigo-500/20 text-indigo-400',
    Loading: 'bg-blue-500/20 text-blue-400 animate-pulse',
    Offline: 'bg-red-500/20 text-red-400'
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

export default function LeftPanel({ onNavigate, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['cat-documents', 'cat-legal']);
  const [favorites, setFavorites] = useState(['resume_builder', 'legal_draft']); // Mocked state from local storage

  // Mocking "Continue Working" and "Recent" for v1.0 Launch
  const activeSessions = [
    { id: 'sess-1', title: 'Resume', time: 'Yesterday', progress: 80, workspace: 'Document', agent: 'ResumeAgent' },
    { id: 'sess-2', title: 'Application', time: 'Today', progress: 40, workspace: 'Document', agent: 'ApplicationAgent' },
  ];

  const [showTemplates, setShowTemplates] = useState(false);

  const toggleCategory = (id) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleItemClick = (item) => {
    // 7. Analytics Logging (Mock)
    console.log(`[Analytics] Tracked: Opened ${item.workspace} Workspace via Agent ${item.agent}`);
    
    // Route through Master AI Router via onNavigate prop
    onNavigate({
      intent: 'LAUNCH_SERVICE',
      service: item.id,
      agent: item.agent,
      workspace: item.workspace,
      title: item.title
    });
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Filter based on global search
  const filteredData = useMemo(() => {
    if (!searchQuery) return NAVIGATION_DATA;
    const lowerQ = searchQuery.toLowerCase();
    
    return NAVIGATION_DATA.map(cat => {
      const fItems = cat.items.filter(i => i.title.toLowerCase().includes(lowerQ));
      const fTemplates = (cat.templates || []).filter(t => t.title.toLowerCase().includes(lowerQ));
      return { ...cat, items: fItems, templates: fTemplates };
    }).filter(cat => cat.items.length > 0 || cat.templates.length > 0);
  }, [searchQuery]);

  // Aggregate favorites
  const favoriteItems = useMemo(() => {
    const allItems = NAVIGATION_DATA.flatMap(c => [...c.items, ...(c.templates || [])]);
    return allItems.filter(item => favorites.includes(item.id));
  }, [favorites]);

  return (
    <div className="h-full flex flex-col bg-[#050714] border-r border-white/5 overflow-hidden">
      
      {/* 1. Global Search Box + Templates Toggle */}
      <div className="p-4 border-b border-white/5">
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="AI Search (e.g. Leave application likhni hai)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                console.log(`[Analytics] Tracked: Natural Language Search -> ${searchQuery}`);
                // Route as a direct AI command for Universal Search (Rule 1)
                onNavigate({ intent: 'NATURAL_LANGUAGE_SEARCH', query: searchQuery, title: searchQuery });
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500"
            tabIndex={0}
          />
        </div>
        <button
          id="templates-toggle-btn"
          onClick={() => setShowTemplates(v => !v)}
          className={`w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
            showTemplates ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
          }`}
        >
          <LayoutTemplate size={11} />
          {showTemplates ? 'Hide Templates' : '📋 Quick Templates'}
        </button>
      </div>

      {/* Rule 7: Templates Overlay */}
      {showTemplates && (
        <TemplatesPanel
          onSelect={(prompt) => onNavigate({ intent: 'TEMPLATE', title: prompt, workspace: 'Document' })}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* 4. Continue Working (Smart Suggestions) */}
        {!searchQuery && activeSessions.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-1">
              <Clock size={12} /> Continue Working
            </h3>
            <div className="space-y-2">
              {activeSessions.map(session => (
                <div 
                  key={session.id} 
                  tabIndex={0}
                  onClick={() => handleItemClick(session)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(session) }}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 focus:bg-indigo-500/20 focus:outline-none focus:ring-1 focus:ring-indigo-400 border border-indigo-500/20 p-2.5 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-indigo-300">{session.title}</span>
                    <span className="text-[9px] text-gray-500">{session.time}</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-1.5">
                    <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${session.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                    <span>{session.progress}% Completed</span>
                    <span>{session.workspace}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Favorites (Pinned) */}
        {!searchQuery && favoriteItems.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-1">
              <Star size={12} className="text-amber-400" /> Favorites
            </h3>
            <div className="space-y-1">
              {favoriteItems.map(item => (
                <div 
                  key={item.id} 
                  tabIndex={0}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(item) }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:outline-none cursor-pointer group transition-colors"
                >
                  <span className="text-xs text-gray-300 group-hover:text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    {item.title}
                  </span>
                  <button onClick={(e) => toggleFavorite(e, item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-amber-400">
                    <Star size={12} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Categories & Templates */}
        <div className="p-2">
          {filteredData.map(category => {
            const Icon = category.icon;
            const isExpanded = expandedCategories.includes(category.id) || searchQuery;
            const totalTools = category.items.length + (category.templates?.length || 0);

            return (
              <div key={category.id} className="mb-1">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') toggleCategory(category.id) }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:outline-none transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium text-gray-200">{category.name}</span>
                    <span className="text-[10px] text-gray-500">({totalTools})</span>
                  </div>
                  {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6 pr-2 py-1 space-y-1"
                    >
                      {category.items.map(item => (
                        <div 
                          key={item.id} 
                          tabIndex={0}
                          onClick={() => handleItemClick(item)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(item) }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 focus:bg-white/10 focus:outline-none cursor-pointer group transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{item.title}</span>
                            <span className="text-[9px] text-gray-500">{item.workspace}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.status} />
                            <button onClick={(e) => toggleFavorite(e, item.id)} className="text-gray-600 hover:text-amber-400">
                              <Star size={12} fill={favorites.includes(item.id) ? "currentColor" : "none"} className={favorites.includes(item.id) ? "text-amber-400" : ""} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Templates Sub-section */}
                      {category.templates && category.templates.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-[10px] text-gray-500 font-bold mb-1 pl-2">Templates</p>
                          {category.templates.map(template => (
                            <div 
                              key={template.id} 
                              tabIndex={0}
                              onClick={() => handleItemClick(template)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleItemClick(template) }}
                              className="flex items-center p-1.5 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:outline-none cursor-pointer group transition-colors pl-2"
                            >
                              <FileText size={10} className="text-gray-500 mr-2" />
                              <span className="text-xs text-gray-400 group-hover:text-indigo-300 transition-colors">{template.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
      </div>
      
      {/* Bottom Settings Link */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors">
          <Settings size={14} /> Settings & Preferences
        </button>
      </div>

    </div>
  );
}

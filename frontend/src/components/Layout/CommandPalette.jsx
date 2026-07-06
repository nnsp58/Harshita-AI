import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Folder, Bot, FileText, FileType, Clock, Star, CornerDownLeft, Sparkles } from 'lucide-react';
import Fuse from 'fuse.js';
import { TOOLS_METADATA } from '../../data/toolsMetadata';
import { AGENTS } from '../../data/agents';
import { TOOLS_LIST } from '../../data/converters';

const CORE_ACTIONS = [
  { id: 'dashboard', title: 'Go to Dashboard', route: '/dashboard', type: 'Workspace', keywords: ['home', 'main'] },
  { id: 'ai', title: 'Open AI Assistant', route: '/service/ai-assistant', type: 'Workspace', keywords: ['chat', 'bot', 'help'] },
  { id: 'legal', title: 'Create Legal Draft', route: '/legal-draft', type: 'Workspace', keywords: ['law', 'affidavit'] },
  { id: 'legal-notice', title: 'Draft Legal Notice', route: '/legal-notice', type: 'Workspace', keywords: ['lawyer', 'notice', 'cheque bounce', 'recovery', 'consumer'] },
  { id: 'itr', title: 'ITR Filing (Income Tax)', route: '/itr-filing', type: 'Workspace', keywords: ['income tax', 'return', 'tax', 'itr', 'आईटीआर'] },
  { id: 'resume', title: 'Build Resume', route: '/resume-builder', type: 'Workspace', keywords: ['cv', 'job', 'bio'] },
  { id: 'tada', title: 'TA/DA Naksha Generator', route: '/tada', type: 'Workspace', keywords: ['tada', 'naksha', 'bill'] },
  { id: 'video', title: 'Story Video Creator', route: '/story-video', type: 'Workspace', keywords: ['video', 'story', 'reel', 'youtube'] },
  { id: 'academy', title: 'AI Academy (Courses)', route: '/academy', type: 'Workspace', keywords: ['learn', 'course', 'study'] },
  { id: 'admin', title: 'Admin Control Panel', route: '/admin', type: 'Workspace', keywords: ['settings', 'config', 'control'] },
  { id: 'settings', title: 'Settings', route: '/settings', type: 'Workspace', keywords: ['preferences', 'account'] },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  
  const inputRef = useRef(null);
  const resultListRef = useRef(null);
  const navigate = useNavigate();

  // Load recents on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('command_palette_recent');
      if (stored) setRecentItems(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build unified index
  const unifiedIndex = useMemo(() => {
    const index = [...CORE_ACTIONS];

    AGENTS.forEach(agent => {
      index.push({
        id: `agent-${agent.id}`,
        title: agent.name,
        desc: agent.description,
        type: 'Agent',
        route: `/service/${agent.id}`,
        keywords: [agent.nameHi, agent.category]
      });
    });

    Object.values(TOOLS_METADATA).forEach(tool => {
      index.push({
        id: `template-${tool.slug}`,
        title: tool.name || tool.title,
        desc: tool.desc,
        type: 'Template',
        route: tool.serviceRoute || `/service/${tool.slug}`,
        keywords: []
      });
    });

    TOOLS_LIST.forEach(tool => {
      index.push({
        id: `tool-${tool.name}`,
        title: tool.name,
        desc: tool.desc,
        type: 'Service',
        route: tool.href.replace('.html', ''),
        keywords: tool.keywords || []
      });
    });

    return index;
  }, []);

  // Configure Fuse for fuzzy search
  const fuse = useMemo(() => new Fuse(unifiedIndex, {
    keys: ['title', 'desc', 'keywords', 'type'],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  }), [unifiedIndex]);

  // Get search results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Return recent items if query is empty
      if (recentItems.length > 0) {
        return recentItems.map(recent => {
          const found = unifiedIndex.find(item => item.id === recent.id);
          return found ? { ...found, isRecent: true } : null;
        }).filter(Boolean);
      }
      return unifiedIndex.slice(0, 8); // Default suggestions
    }
    return fuse.search(query).map(r => r.item).slice(0, 15);
  }, [query, fuse, unifiedIndex, recentItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      const maxIndex = results.length + (query.trim().length > 0 ? 1 : 0) - 1; // +1 for "Ask AI" button

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        
        if (selectedIndex < results.length) {
          executeAction(results[selectedIndex]);
        } else if (query.trim().length > 0) {
          // The "Ask AI" fallback is selected
          executeAiFallback();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query]);

  // Scroll active item into view
  useEffect(() => {
    if (resultListRef.current) {
      const activeEl = resultListRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Execute action and save to recent
  const executeAction = (item) => {
    // Save to recents
    const newRecents = [{ id: item.id, timestamp: Date.now() }, ...recentItems.filter(r => r.id !== item.id)].slice(0, 5);
    setRecentItems(newRecents);
    localStorage.setItem('command_palette_recent', JSON.stringify(newRecents));

    navigate(item.route);
    setIsOpen(false);
  };

  const executeAiFallback = () => {
    navigate('/service/ai-assistant', { state: { initialPrompt: query } });
    setIsOpen(false);
  };

  const getTypeIcon = (type, isRecent) => {
    if (isRecent) return <Clock size={16} className="text-slate-400" />;
    switch(type) {
      case 'Workspace': return <Folder size={16} className="text-blue-400" />;
      case 'Agent': return <Bot size={16} className="text-purple-400" />;
      case 'Template': return <FileText size={16} className="text-emerald-400" />;
      case 'Service': return <FileType size={16} className="text-amber-400" />;
      default: return <Command size={16} className="text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[20vh]">
      <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 animate-fade-in mx-4 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-4 border-b border-slate-800 bg-slate-900/50">
          <Search className="text-indigo-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none text-lg"
            placeholder="Search services, agents, templates or type a prompt..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono ml-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-sans">esc</kbd>
          </div>
        </div>

        {/* Results List */}
        <div ref={resultListRef} className="overflow-y-auto py-2 scrollbar-hide flex-1">
          {results.length > 0 && (
            <ul className="px-2 space-y-1">
              {results.map((item, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <li key={`${item.id}-${idx}`}>
                    <button
                      data-active={isActive}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm transition-all text-left group ${
                        isActive 
                          ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-500/50' 
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                      onClick={() => executeAction(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="mr-4 flex-shrink-0 p-1.5 rounded-md bg-slate-800/50 group-hover:bg-slate-800">
                        {getTypeIcon(item.type, item.isRecent)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{item.title}</span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 py-0.5 bg-slate-800 rounded-full ml-2 flex-shrink-0">
                            {item.isRecent ? 'Recent' : item.type}
                          </span>
                        </div>
                        {item.desc && (
                          <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft size={14} className="ml-3 text-indigo-400 flex-shrink-0 opacity-70" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* AI Fallback */}
          {query.trim().length > 0 && (
            <div className="px-2 pb-2 mt-1">
              {results.length > 0 && (
                <div className="px-4 py-2 mt-2 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <div className="h-px bg-slate-800 flex-1 mr-3"></div>
                  Or let AI handle it
                  <div className="h-px bg-slate-800 flex-1 ml-3"></div>
                </div>
              )}
              <button
                data-active={selectedIndex === results.length}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm transition-all text-left border ${
                  selectedIndex === results.length
                    ? 'bg-indigo-500/20 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'text-indigo-300 bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10'
                }`}
                onClick={executeAiFallback}
                onMouseEnter={() => setSelectedIndex(results.length)}
              >
                <div className={`mr-4 flex-shrink-0 p-1.5 rounded-md ${selectedIndex === results.length ? 'bg-indigo-500/30' : 'bg-indigo-500/10'}`}>
                  <Sparkles size={16} className="text-indigo-400" />
                </div>
                <span className="font-medium">Ask Harshita AI to "{query}"</span>
                {selectedIndex === results.length && (
                  <CornerDownLeft size={14} className="ml-auto text-indigo-400 opacity-70" />
                )}
              </button>
            </div>
          )}

          {results.length === 0 && query.trim().length === 0 && (
            <div className="px-4 py-12 flex flex-col items-center justify-center text-slate-500">
              <Search size={32} className="opacity-20 mb-3" />
              <p className="text-sm">Type a command or service name...</p>
              <div className="flex gap-2 mt-4 text-xs opacity-60">
                <span className="px-2 py-1 bg-slate-800 rounded">itr</span>
                <span className="px-2 py-1 bg-slate-800 rounded">leave application</span>
                <span className="px-2 py-1 bg-slate-800 rounded">pdf</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Navigation Hints */}
        <div className="px-4 py-3 border-t border-slate-800 bg-[#020617] flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm">↑</kbd>
              <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] shadow-sm">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-indigo-400 font-bold">Harshita AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

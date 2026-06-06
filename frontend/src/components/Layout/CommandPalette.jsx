import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X } from 'lucide-react';

const ACTIONS = [
  { id: 'dashboard', name: 'Go to Dashboard', route: '/dashboard' },
  { id: 'ai', name: 'Open AI Assistant', route: '/service/ai-assistant' },
  { id: 'legal', name: 'Create Legal Draft', route: '/legal-draft' },
  { id: 'resume', name: 'Build Resume', route: '/resume-builder' },
  { id: 'settings', name: 'Settings', route: '/settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredActions = ACTIONS.filter(action =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[20vh]">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 animate-fade-in mx-4">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none sm:text-sm"
            placeholder="Search commands or type a prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-sans">esc</kbd>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto py-2 scrollbar-hide">
          {filteredActions.length > 0 ? (
            <ul className="px-2 space-y-1">
              {filteredActions.map((action) => (
                <li key={action.id}>
                  <button
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors text-left"
                    onClick={() => {
                      navigate(action.route);
                      setIsOpen(false);
                    }}
                  >
                    <Command className="mr-3 opacity-50" size={16} />
                    {action.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results found for "{query}"
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Search or jump to...</span>
          <span className="flex gap-2">
            <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">↑</kbd><kbd className="bg-slate-800 px-1 rounded">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded">↵</kbd> to select</span>
          </span>
        </div>
      </div>
    </div>
  );
}

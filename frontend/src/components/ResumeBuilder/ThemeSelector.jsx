import React from 'react';
import { THEMES } from '../../lib/types';
import { Check } from 'lucide-react';

export function ThemeSelector({ onSelect, selectedThemeId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme)}
          className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
            selectedThemeId === theme.id
              ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-500/5 ring-4 ring-gold-500/10 scale-[1.02]'
              : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <span className="font-bold text-navy-950 dark:text-white">{theme.name}</span>
            {selectedThemeId === theme.id && (
              <div className="p-1 bg-gold-500 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mb-3">
            <div 
              className="w-6 h-6 rounded-full border border-white/20" 
              style={{ backgroundColor: theme.primaryColor }} 
            />
            <div 
              className="w-6 h-6 rounded-full border border-white/20" 
              style={{ backgroundColor: theme.accentColor }} 
            />
          </div>
          
          <p className="text-[10px] text-gray-500 dark:text-gray-400 text-left leading-relaxed">
            {theme.description}
          </p>

          <div className="mt-4 w-full flex gap-1 h-1.5 opacity-30">
            <div className="flex-1 bg-gray-400 rounded-full" />
            <div className="flex-[2] bg-gray-400 rounded-full" />
            <div className="flex-1 bg-gray-400 rounded-full" />
          </div>
        </button>
      ))}
    </div>
  );
}

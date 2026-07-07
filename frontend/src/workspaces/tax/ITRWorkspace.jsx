import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Share2, Clock, Undo } from 'lucide-react';

const ITRWorkspace = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Mock Autosave
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            ITR Workspace
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 mr-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Auto-saved just now'}
          </span>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <span className="text-4xl">🛠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-200">Tool Under Construction</h2>
          <p className="text-slate-400">
            This workspace is dedicated to <strong>ITRWorkspace</strong> logic. It has its own state, history, and export functions.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200/80 text-sm">
            Status: Coming Soon (Phase 2 Roadmap)
          </div>
        </div>
      </main>
    </div>
  );
};

export default ITRWorkspace;

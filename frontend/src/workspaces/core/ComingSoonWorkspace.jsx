import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Rocket, MessageSquare } from 'lucide-react';

const ComingSoonWorkspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toolName = new URLSearchParams(location.search).get('tool') || 'Requested Feature';

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="flex items-center p-4 bg-slate-900 border-b border-slate-800">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-4">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h1 className="text-lg font-medium text-slate-300">Workspace Status</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
            <Rocket className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {toolName} Workspace
          </h2>
          
          <p className="text-slate-400 text-sm leading-relaxed">
            This workspace is currently under active development by our engineers. We are building isolated state management and autosave capabilities for this feature.
          </p>

          <button onClick={() => alert('We will notify you!')} className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> Notify Me When Ready
          </button>
        </div>
      </main>
    </div>
  );
};

export default ComingSoonWorkspace;

const fs = require('fs');
const path = require('path');

const workspacesDir = path.join(__dirname, 'frontend', 'src', 'workspaces');

const departments = {
    legal: ['GiftDeedWorkspace', 'NoticeWorkspace', 'AffidavitWorkspace'],
    tax: ['ITRWorkspace', 'GSTWorkspace', 'RefundWorkspace'],
    media: ['VideoWorkspace', 'ImageWorkspace', 'PosterWorkspace'],
    converter: ['PDFWorkspace', 'AudioWorkspace', 'QRWorkspace', 'PassportWorkspace', 'DocumentWorkspace', 'PasswordWorkspace', 'VoiceWorkspace', 'ImageFormatWorkspace'],
    business: ['CalculatorWorkspace'],
    core: ['NotFoundWorkspace', 'ComingSoonWorkspace']
};

// Ensure directories exist
Object.keys(departments).forEach(dep => {
    const depPath = path.join(workspacesDir, dep);
    if (!fs.existsSync(depPath)) {
        fs.mkdirSync(depPath, { recursive: true });
    }
});

// Generate component scaffold
Object.entries(departments).forEach(([dep, tools]) => {
    tools.forEach(tool => {
        const filePath = path.join(workspacesDir, dep, `${tool}.jsx`);
        
        let content = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Share2, Clock, Undo } from 'lucide-react';

const ${tool} = () => {
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
            ${tool.replace('Workspace', ' Workspace')}
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
            This workspace is dedicated to <strong>${tool}</strong> logic. It has its own state, history, and export functions.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200/80 text-sm">
            Status: Coming Soon (Phase 2 Roadmap)
          </div>
        </div>
      </main>
    </div>
  );
};

export default ${tool};
`;

        if (tool === 'NotFoundWorkspace') {
            content = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundWorkspace = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="text-[150px] font-bold text-slate-800 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Workspace Not Found
          </div>
        </div>
        
        <p className="text-slate-400">
          The tool or workspace you are looking for does not exist, has been moved, or is currently offline.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" /> Launchpad
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundWorkspace;
`;
        }

        if (tool === 'ComingSoonWorkspace') {
            content = `import React from 'react';
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
`;
        }

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content);
            console.log(`Created ${filePath}`);
        }
    });
});

import React from 'react';
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

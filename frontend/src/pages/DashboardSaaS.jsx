import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ModernSidebar from '../components/Layout/ModernSidebar';
import CommandPalette from '../components/Layout/CommandPalette';
import AIAssistantWidget from '../components/Dashboard/AIAssistantWidget';
import { 
  Bot, Briefcase, FileText, Upload, Settings, 
  Search, Users, Activity, TrendingUp, Bell 
} from 'lucide-react';

export default function DashboardSaaS() {
  const navigate = useNavigate();
  const { user, stats, initialize } = useStore();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize().finally(() => setIsLoading(false));
  }, [initialize]);

  const quickActions = [
    { id: 'legal', title: 'Create Affidavit', icon: FileText, color: 'from-blue-500 to-indigo-500', route: '/legal-draft' },
    { id: 'resume', title: 'Resume Builder', icon: Briefcase, color: 'from-purple-500 to-pink-500', route: '/resume-builder' },
    { id: 'job', title: 'Find Jobs', icon: Search, color: 'from-emerald-400 to-teal-500', route: '/jobs' },
    { id: 'upload', title: 'Upload Documents', icon: Upload, color: 'from-orange-400 to-red-500', route: '/documents' },
    { id: 'chat', title: 'AI Chat', icon: Bot, color: 'from-indigo-500 to-violet-500', route: '/service/ai-assistant' },
  ];

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
          <Icon className="text-indigo-400 group-hover:text-indigo-300" size={24} />
        </div>
        {trend && (
          <span className="text-emerald-400 text-sm font-medium flex items-center">
            <TrendingUp size={16} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-800 rounded animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold text-white">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
      <CommandPalette />
      
      <ModernSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="flex-none h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 py-1.5 px-3 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors"
                 onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
              <Search size={14} />
              <span>Search command...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-slate-700 text-xs text-slate-300 font-sans">Ctrl K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-400 capitalize">{user?.role || 'Guest'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 border border-slate-800 p-8 sm:p-10">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  What would you like to do today?
                </h1>
                <p className="text-slate-400 text-lg mb-8 max-w-2xl">
                  Welcome to N-Dizi AI. Access your premium tools and universal AI assistant all in one place.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button 
                        key={action.id}
                        onClick={() => navigate(action.route)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                      >
                        <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-300 text-center">{action.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Statistics */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="mr-2 text-indigo-400" size={20} />
                Platform Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Candidates" value={stats?.totalCandidates || '2,543'} icon={Users} trend="+12%" />
                <StatCard title="AI Requests" value={stats?.totalJobs || '15,201'} icon={Bot} trend="+24%" />
                <StatCard title="Documents Processed" value={stats?.totalDocuments || '4,892'} icon={FileText} trend="+8%" />
                <StatCard title="Success Rate" value="99.8%" icon={TrendingUp} trend="+0.2%" />
              </div>
            </section>
            
            {/* Widget Area for additional content */}
            <div className="h-32"></div>
            
          </div>
        </div>

        {/* Universal AI Assistant Widget (Floating) */}
        <AIAssistantWidget />
        
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bot, Briefcase, FileText, MoreHorizontal, Bell, RefreshCw, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import ModernSidebar from '../Layout/ModernSidebar';
import AIAssistantWidget from '../Dashboard/AIAssistantWidget';

const TAB_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, route: '/mobile' },
  { id: 'services', label: 'Services', icon: Bot, route: '/dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, route: '/jobs' },
  { id: 'docs', label: 'Docs', icon: FileText, route: '/documents' },
  { id: 'more', label: 'More', icon: MoreHorizontal, route: '/settings' },
];

const QUICK_ACTIONS = [
  { id: 'legal', title: 'Affidavit', icon: '⚖️', route: '/workspace/legal/affidavit', color: 'bg-blue-500' },
  { id: 'notice', title: 'Notice', icon: '📄', route: '/workspace/legal/notice', color: 'bg-purple-500' },
  { id: 'itr', title: 'ITR', icon: '📊', route: '/workspace/tax/itr', color: 'bg-emerald-500' },
  { id: 'gst', title: 'GST', icon: '🧮', route: '/workspace/tax/gst', color: 'bg-orange-500' },
  { id: 'refund', title: 'Refund', icon: '💰', route: '/workspace/tax/refund', color: 'bg-cyan-500' },
  { id: 'resume', title: 'Resume', icon: '📝', route: '/resume-builder', color: 'bg-amber-500' },
];

const AGENT_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-violet-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-pink-500 to-fuchsia-500',
  'from-indigo-500 to-blue-500',
  'from-teal-500 to-emerald-500',
];

function MobileBottomNav({ activeTab, onTabChange, onNavigate, currentPath }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800">
      <div className="flex items-center justify-around py-1.5 px-2">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.route || (item.id === 'home' && (currentPath === '/mobile' || currentPath === '/'));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function MobileDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, stats, initialize, agents, fetchAgents } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    let timer;
    setIsLoading(true);
    initialize()
      .then(() => {
        timer = setTimeout(() => {
          const state = useStore.getState();
          if (!state.agents || state.agents.length === 0) {
            setLoadError(true);
          }
        }, 5000);
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => clearTimeout(timer);
  }, [initialize]);

  const handleRetry = async () => {
    setLoadError(false);
    setIsRefreshing(true);
    try {
      await fetchAgents();
    } catch (e) {
      setLoadError(true);
    }
    setIsRefreshing(false);
  };

  const handleNavigate = (route) => {
    setShowMobileMenu(false);
    navigate(route);
  };

  const activeAgents = agents.filter(a => a.status === 'running' || a.status === 'busy').length;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24">
      <ModernSidebar
        isCollapsed={false}
        toggleSidebar={() => {}}
        isMobileOpen={showMobileMenu}
        setMobileOpen={setShowMobileMenu}
      />

      <header className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Harshita AI</h1>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Mobile Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
            <div
              onClick={() => handleNavigate('/settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 border border-slate-800 p-5">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-1">
              Hello, {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {activeAgents > 0 ? `${activeAgents} agents active` : 'All systems ready'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Agents</p>
                <p className="text-xl font-bold text-white">{agents.length || 0}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Requests</p>
                <p className="text-xl font-bold text-white">{stats?.totalJobs || 0}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleNavigate(action.route)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 active:scale-95 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${action.color} shadow-lg`}>
                  <span className="text-lg">{action.icon}</span>
                </div>
                <span className="text-xs font-medium text-slate-300 text-center leading-tight">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="text-indigo-400" size={16} />
              AI Agents
            </h3>
            <button
              onClick={handleRetry}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 bg-white/5 border border-white/10 rounded-lg active:bg-white/10 transition-colors"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? '...' : 'Refresh'}
            </button>
          </div>

          {agents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {agents.slice(0, 10).map((agent, idx) => {
                const isActive = agent.status === 'running' || agent.status === 'busy';
                const gradient = AGENT_GRADIENTS[idx % AGENT_GRADIENTS.length];
                return (
                  <button
                    key={agent.id || agent.name}
                    onClick={() => handleNavigate(agent.route || '/service/ai-assistant')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'from-slate-800/60 to-slate-900/40 border-slate-600/50'
                        : 'from-slate-800/50 to-slate-900/30 border-slate-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                      isActive
                        ? `bg-gradient-to-br ${gradient} shadow-lg`
                        : 'bg-slate-800 border border-slate-600 text-gray-500'
                    }`}>
                      <Bot size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <p className="text-xs font-medium text-slate-300 text-center leading-tight line-clamp-2">
                      {agent.displayName || agent.name}
                    </p>
                    <span className={`mt-2 w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400' : 'bg-slate-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          ) : loadError ? (
            <div className="text-center py-12 bg-red-950/20 rounded-xl border border-red-900/30">
              <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
              <p className="text-sm text-red-200 font-medium">Service temporarily unavailable.</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors mt-4"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Retry
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <RefreshCw className="mx-auto text-gray-600 mb-3 animate-spin" size={32} />
              <p className="text-sm text-gray-400">Loading all applications...</p>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <RefreshCw className="text-emerald-400" size={16} />
            Platform Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Documents</p>
              <p className="text-2xl font-bold text-white">{stats?.totalDocuments || 0}</p>
              <p className="text-emerald-400 text-xs font-medium mt-1">+8% this week</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats?.successRate ? `${stats.successRate}%` : '—'}</p>
              <p className="text-emerald-400 text-xs font-medium mt-1">+0.2%</p>
            </div>
          </div>
        </section>
      </main>

      <AIAssistantWidget />

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigate={handleNavigate}
        currentPath={location.pathname}
      />
    </div>
  );
}

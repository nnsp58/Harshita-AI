import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ModernSidebar from '../components/Layout/ModernSidebar';
import CommandPalette from '../components/Layout/CommandPalette';
import AIAssistantWidget from '../components/Dashboard/AIAssistantWidget';
import {
  Bot, Briefcase, FileText, Upload, Settings,
  Search, Users, Activity, TrendingUp, Bell,
  SearchX, RefreshCw
} from 'lucide-react';

const AGENT_ICONS = {
  job_search: Search,
  resume_builder: Briefcase,
  legal_draft: (props) => <span {...props}>⚖️</span>,
  document_ocr: FileText,
  form_fill: (props) => <span {...props}>📝</span>,
  ration_card: (props) => <span {...props}>🪪</span>,
  land_record: (props) => <span {...props}>🏗️</span>,
  eligibility: (props) => <span {...props}>✅</span>,
  ticket_booking: (props) => <span {...props}>🎫</span>,
  bulk_import: Upload,
  file_processor: (props) => <span {...props}>⚙️</span>,
  validator: (props) => <span {...props}>✔️</span>,
  security: (props) => <span {...props}>🔒</span>,
  network_monitor: (props) => <span {...props}>🌐</span>,
  web_learning: (props) => <span {...props}>📚</span>,
  ui_builder: (props) => <span {...props}>🎨</span>,
  notepad: (props) => <span {...props}>📒</span>,
  result_generator: (props) => <span {...props}>📊</span>,
  project_report: (props) => <span {...props}>📈</span>,
  whatsapp: (props) => <span {...props}>💬</span>,
  voice_agent: (props) => <span {...props}>🎙️</span>,
  general_chat: Bot
};

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
  'from-green-500 to-lime-500',
  'from-red-500 to-rose-500',
  'from-sky-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-fuchsia-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-lime-500 to-green-500',
  'from-blue-600 to-indigo-500',
  'from-green-600 to-emerald-500',
  'from-purple-600 to-purple-400',
  'from-amber-600 to-orange-400',
  'from-emerald-600 to-cyan-500',
];

const statusColors = {
  running: 'bg-emerald-500',
  busy: 'bg-amber-500 animate-pulse',
  idle: 'bg-gray-500',
};

const statusBgColors = {
  running: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  busy: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
  idle: 'from-slate-500/10 to-slate-400/5 border-slate-500/30',
};

export default function DashboardSaaS() {
  const navigate = useNavigate();
  const { user, stats, initialize, agents, fetchAgents } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    initialize().finally(() => setIsLoading(false));
  }, [initialize]);

  const handleRefreshAgents = async () => {
    setIsRefreshing(true);
    try {
      await fetchAgents();
    } catch (e) {
      // silent
    }
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const quickActions = [
    { id: 'legal', title: 'Create Affidavit', icon: FileText, color: 'from-blue-500 to-indigo-500', route: '/legal-draft' },
    { id: 'resume', title: 'Resume Builder', icon: Briefcase, color: 'from-purple-500 to-pink-500', route: '/resume-builder' },
    { id: 'job', title: 'Find Jobs', icon: Search, color: 'from-emerald-400 to-teal-500', route: '/jobs' },
    { id: 'upload', title: 'Upload Documents', icon: Upload, color: 'from-orange-400 to-red-500', route: '/documents' },
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

  const activeAgents = agents.filter(a => a.status === 'running' || a.status === 'busy').length;

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
      <CommandPalette />

      <ModernSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 border border-slate-800 p-8 sm:p-10">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  What would you like to do today?
                </h1>
                <p className="text-slate-400 text-lg mb-8 max-w-2xl">
                  Welcome to N-Dizi AI. Access your premium tools and {activeAgents > 0 ? `${activeAgents} active AI agents` : 'all 22 AI agents'} — all in one place.
                </p>

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

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Activity className="mr-2 text-indigo-400" size={20} />
                  Platform Overview
                </h2>
                <button
                  onClick={handleRefreshAgents}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Agents" value={agents.length || 0} icon={Bot} trend={`${activeAgents} active`} />
                <StatCard title="AI Requests" value={stats?.totalJobs || 0} icon={Search} trend={stats?.totalJobs ? '+24%' : '—'} />
                <StatCard title="Documents Processed" value={stats?.totalDocuments || 0} icon={FileText} trend={stats?.totalDocuments ? '+8%' : '—'} />
                <StatCard title="Success Rate" value={stats?.successRate ? `${stats.successRate}%` : '—'} icon={TrendingUp} trend={stats?.successRate ? '+0.2%' : '—'} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Bot className="mr-2 text-amber-400" size={20} />
                  AI Agents ({agents.length || 0})
                </h2>
                {agents.length === 0 && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <SearchX size={12} />
                    Loading agents...
                  </span>
                )}
              </div>

              {agents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {agents.map((agent, idx) => {
                    const gradient = AGENT_GRADIENTS[idx % AGENT_GRADIENTS.length];
                    const isActive = agent.status === 'running' || agent.status === 'busy';
                    const IconComponent = AGENT_ICONS[agent.name] || Bot;
                    return (
                      <button
                        key={agent.id || agent.name}
                        onClick={() => navigate('/service/ai-assistant')}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group ${
                          isActive
                            ? statusBgColors[agent.status] || statusBgColors.running
                            : 'from-slate-800/50 to-slate-900/30 border-slate-700/50'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                          isActive
                            ? `bg-gradient-to-br ${gradient} shadow-lg`
                            : 'bg-slate-800 border border-slate-600 text-gray-500'
                        }`}>
                          {typeof IconComponent === 'string' ? (
                            <span className="text-lg">{IconComponent}</span>
                          ) : (
                            <IconComponent
                              size={20}
                              className={isActive ? 'text-white' : 'text-gray-500'}
                            />
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-300 text-center leading-tight line-clamp-2">
                          {agent.displayName || agent.name}
                        </p>
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                          isActive
                            ? statusColors[agent.status] || statusColors.running
                            : 'bg-slate-600'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <RefreshCw className="mx-auto text-gray-600 mb-3 animate-spin" size={32} />
                  <p className="text-sm text-gray-400">Loading all 22 AI agents...</p>
                  <p className="text-xs text-gray-600 mt-1">If this takes too long, check if the server is running.</p>
                </div>
              )}
            </section>

            <div className="h-32"></div>

          </div>
        </div>

        <AIAssistantWidget />
      </main>
    </div>
  );
}

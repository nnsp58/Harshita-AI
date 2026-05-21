import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, DollarSign, Bot, UploadCloud, FileCheck, ShieldCheck, ChevronRight, Zap, Target, Star, Clock, Archive, UserCheck, BarChart3, MessageSquare, FileText } from 'lucide-react';
import { useStore } from '../store';

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div whileHover={{ y: -5 }} className="card p-6 relative overflow-hidden" >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16 bg-${color}-500`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-heading font-black mt-2">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950 text-${color}-600`}>        <Icon size={28} />
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const { stats, agents, jobs, candidates, operators, user, initialize } = useStore();
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'operators', label: 'Operators', icon: Users },
    { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'logs', label: 'Logs', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-maroon-900/50 rounded-2xl border border-maroon-500/20">
            <img src="/harshita ai.png" alt="Harshita AI" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-white">Welcome back, {user?.name || 'VLE'}</h1>
            <p className="text-gray-400">Harshita AI Command Center is active and monitoring all agents.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 text-xs py-2">
            <Archive size={14} />
            Export Data
          </button>
          <button className="btn-primary flex items-center gap-2 text-xs py-2 shadow-gold-500/20 shadow-lg">
            <Zap size={14} />
            Quick Action
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <section className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="System Revenue" value={`₹${stats.revenue || 0}`} icon={DollarSign} color="gold" subtitle="Earnings via automation" />
        <StatsCard title="Success Rate" value={`${stats.successRate || 92}%`} icon={Activity} color="emerald" subtitle="Automation accuracy" />
        <StatsCard title="Active Agents" value={agents.filter(a => a.status === 'active').length} icon={Bot} color="blue" subtitle="Current operational agents" />
        <StatsCard title="Total Tasks" value={jobs.length} icon={Target} color="purple" subtitle="All-time processed" />
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-gold-500" />
              Live Operations
            </h2>
            <button className="text-xs text-gold-500 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gold-500/10 text-gold-500'}`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{job.type || 'Automation Task'}</p>
                      <p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                      job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold-500/20 text-gold-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500 italic">No active tasks found in the queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="card p-6">
          <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            Core Status
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Database Engine</span>
                <span className="text-emerald-500 font-bold">OPTIMAL</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">AI Routing Hub</span>
                <span className="text-blue-500 font-bold">STANDBY</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[78%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Network Latency</span>
                <span className="text-gold-500 font-bold">14ms</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold-500 w-[15%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-maroon-900/20 rounded-xl border border-maroon-500/10">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">V6 Enterprise Security</p>
            <p className="text-xs text-white leading-relaxed">
              System is running on encrypted channel <span className="text-gold-500">AES-256</span> with biometric gateway active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-900/30 rounded-2xl border border-blue-500/20">
          <BarChart3 size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-black text-white">Analytics Hub</h1>
          <p className="text-gray-400">Comprehensive performance metrics and trend analysis.</p>
        </div>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Tasks" value={jobs.length} icon={Target} color="blue" subtitle="All-time volume" />
        <StatsCard title="Success Rate" value={`${stats.successRate || 92}%`} icon={Activity} color="emerald" subtitle="Completion accuracy" />
        <StatsCard title="Active Agents" value={agents.length} icon={Bot} color="purple" subtitle="Operational count" />
        <StatsCard title="Revenue" value={`₹${stats.revenue || 0}`} icon={DollarSign} color="gold" subtitle="SaaS profitability" />
      </section>
      
      <div className="card p-12 text-center bg-white/5 border-dashed border-2 border-white/10">
         <div className="flex justify-center mb-4">
            <Activity size={48} className="text-gray-600 animate-pulse" />
         </div>
         <h3 className="text-xl font-bold text-gray-300">Detailed Analytics Engine</h3>
         <p className="text-gray-500 max-w-md mx-auto mt-2">Charts and graphs are being initialized from the historical data warehouse. Live telemetry is active.</p>
      </div>
    </div>
  );

  const renderOperators = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-900/30 rounded-2xl border border-amber-500/20">
            <Users size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-white">Staff Management</h1>
            <p className="text-gray-400">Monitor and manage your CSC operators.</p>
          </div>
        </div>
        <button className="btn-primary text-xs py-2 px-4">+ Add Operator</button>
      </div>
      
      {operators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators.map((op) => (
            <div key={op.id} className="card p-6 group hover:border-gold-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-gold-500">
                  {op.name?.[0] || 'O'}
                </div>
                <div>
                  <h3 className="font-bold text-white">{op.name}</h3>
                  <p className="text-xs text-gray-500">{op.role || 'Operator'}</p>
                </div>
                <div className="ml-auto">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                 <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Tasks</p>
                    <p className="text-lg font-bold text-white">{op.jobs || 0}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Efficiency</p>
                    <p className="text-lg font-bold text-emerald-500">98%</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center bg-white/5 border-dashed border-2 border-white/10">
          <Users size={40} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No Operators Registered</h3>
          <p className="text-gray-500 mt-2">You haven't added any staff members to your command center yet.</p>
          <button className="mt-6 text-gold-500 text-sm font-bold hover:underline">Register your first operator →</button>
        </div>
      )}
    </div>
  );

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: 'Admin',
      avatar: 'A',
      message: 'System upgrade scheduled for 2 AM tonight. Minimal downtime expected.',
      time: '10:15 AM',
      color: 'bg-blue-600'
    },
    {
       id: 2,
       user: 'Harshita AI',
       avatar: 'H',
       message: 'Agent optimization protocol completed. Efficiency improved by 14%.',
       time: '11:30 AM',
       color: 'bg-gold-600'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: user?.name || 'You',
        avatar: (user?.name || 'Y')[0],
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: 'bg-maroon-600'
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const renderTeamChat = () => (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-900/30 rounded-2xl border border-purple-500/20">
            <MessageSquare size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-white">Team Communication</h1>
            <p className="text-gray-400">Secure internal messaging for your CSC operations.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">3 Operators Online</span>
        </div>
      </div>
      <div className="card flex-1 min-h-[500px] flex flex-col overflow-hidden bg-[#0a0b10] border-white/5">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.user === (user?.name || 'You') ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${msg.color}`}>
                {msg.avatar}
              </div>
              <div className={`max-w-[70%] ${msg.user === (user?.name || 'You') ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className="flex items-center gap-2 px-1">
                   <span className="text-xs font-bold text-gray-400">{msg.user}</span>
                   <span className="text-[9px] text-gray-600">{msg.time}</span>
                </div>
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.user === (user?.name || 'You') 
                    ? 'bg-maroon-600 text-white rounded-tr-none shadow-lg shadow-maroon-900/20' 
                    : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white/5 border-t border-white/5">
          <div className="flex gap-3 bg-[#05060a] p-2 rounded-xl border border-white/10 focus-within:border-gold-500/50 transition-colors">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message to the team..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2"
            />
            <button
              onClick={sendMessage}
              className="bg-gold-500 text-black font-bold px-6 py-2 rounded-lg text-xs hover:bg-gold-400 transition-colors"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const [logFilter, setLogFilter] = useState('all');
  const systemLogs = [
    {
      id: 1,
      type: 'success',
      title: 'Task Completed',
      message: 'Document processing completed for client VLE-9021',
      timestamp: '2024-01-10 14:30:15',
      icon: '✅'
    },
    {
      id: 2,
      type: 'info',
      title: 'Agent Started',
      message: 'ITR-Filing Agent v2.4 initialized on core 4',
      timestamp: '2024-01-10 14:35:22',
      icon: 'ℹ️'
    },
    {
       id: 3,
       type: 'warning',
       title: 'High Latency',
       message: 'Aadhaar API response delayed by 4500ms',
       timestamp: '2024-01-10 14:40:01',
       icon: '⚠️'
    }
  ];

  const filteredLogs = logFilter === 'all' ? systemLogs : systemLogs.filter(log => log.type === logFilter);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400';
      case 'info': return 'border-blue-500/50 bg-blue-500/5 text-blue-400';
      case 'warning': return 'border-gold-500/50 bg-gold-500/5 text-gold-400';
      case 'error': return 'border-red-500/50 bg-red-500/5 text-red-400';
      default: return 'border-gray-500/50 bg-gray-500/5 text-gray-400';
    }
  };

  const renderLogs = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-900/30 rounded-2xl border border-gray-500/20">
            <FileText size={24} className="text-gray-400" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-white">System Logs</h1>
            <p className="text-gray-400">Live telemetry and event history.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="bg-[#0f111a] border border-white/10 text-xs text-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gold-500/50"
          >
            <option value="all">All Activities</option>
            <option value="success">Success Only</option>
            <option value="info">System Info</option>
            <option value="warning">Warnings</option>
            <option value="error">Critical Errors</option>
          </select>
          <button className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/10">
             <Clock size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="card p-0 overflow-hidden bg-[#0a0b10] border-white/5">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Details</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {filteredLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-bold text-xs text-white flex items-center gap-2">
                         <span className="text-lg">{log.icon}</span>
                         {log.title}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded border ${getLogColor(log.type)}`}>
                            {log.type}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                         {log.timestamp}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 italic">
                         {log.message}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return renderOverview();
      case 'analytics': return renderAnalytics();
      case 'operators': return renderOperators();
      case 'team-chat': return renderTeamChat();
      case 'logs': return renderLogs();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#0f111a]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-fit">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === item.id 
                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { 
  Users, Flame, Database, AlertTriangle, Play, CheckCircle, 
  XCircle, Clock, FileText, Download, TrendingUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AnalyticsDashboard() {
  const { token } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/analytics`, { headers });
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-maroon-500/20 border-t-maroon-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading Harshita AI metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8 flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-gray-300 mb-4">{error || 'Something went wrong.'}</p>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="px-4 py-2 bg-maroon-600 hover:bg-maroon-500 rounded text-xs transition-colors"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { userMetrics, skillMetrics, agentMetrics, documentMetrics, liveActivity, dailyUsage } = data;

  // Compute overall health alerts
  const alerts = [];
  const highFailureAgents = agentMetrics.filter(a => a.successRate < 90);
  highFailureAgents.forEach(agent => {
    alerts.push({
      id: agent.name,
      type: 'warning',
      message: `${agent.name} success rate is below 90% (${agent.successRate}%)`
    });
  });

  const totalRuns = skillMetrics.reduce((sum, s) => sum + s.runs, 0);
  const totalFailures = skillMetrics.reduce((sum, s) => sum + s.failed, 0);
  const failurePercentage = totalRuns > 0 ? (totalFailures / totalRuns) * 100 : 0;
  
  if (failurePercentage > 10) {
    alerts.push({
      id: 'general_failure',
      type: 'danger',
      message: `Global skill failure rate is critically high: ${failurePercentage.toFixed(1)}%`
    });
  }

  // Pre-configured colors for chart cells
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28'];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 space-y-6 scrollbar-thin">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-maroon-400 to-gold-400 bg-clip-text text-transparent">
            Harshita AI Real-time Analytics
          </h1>
          <p className="text-xs text-gray-500">Live operational & business metrics studio</p>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-colors"
        >
          <RefreshCw size={13} className="animate-spin-slow" /> Refresh Data
        </button>
      </div>

      {/* Health Alerts Panel */}
      {alerts.length > 0 && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertTriangle size={16} /> Operational Warnings
          </div>
          <div className="space-y-1.5">
            {alerts.map((alert, i) => (
              <p key={i} className="text-xs text-red-200">
                • {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* User metrics card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Total / Registered Users</p>
            <h2 className="text-xl font-bold">{userMetrics.totalUsers} <span className="text-xs text-gray-400 font-normal">/ {userMetrics.registeredUsers} VLEs</span></h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span>Google: {userMetrics.googleLoginUsers}</span>
              <span>•</span>
              <span>Admins: {userMetrics.superAdmins}</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Users size={20} />
          </div>
        </div>

        {/* DAU/WAU/MAU Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Active Users (DAU / WAU)</p>
            <h2 className="text-xl font-bold">{userMetrics.dau} <span className="text-xs text-gray-400 font-normal">/ {userMetrics.wau}</span></h2>
            <div className="text-[10px] text-gray-400">Monthly Active (MAU): {userMetrics.mau}</div>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
            <Flame size={20} />
          </div>
        </div>

        {/* Skill Runs Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Total Executed Runs</p>
            <h2 className="text-xl font-bold">{totalRuns}</h2>
            <div className="text-[10px] text-gray-400">Global Success Rate: {totalRuns > 0 ? ((1 - (totalFailures / totalRuns)) * 100).toFixed(1) : 100}%</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Documents Generated Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Docs / PDFs Generated</p>
            <h2 className="text-xl font-bold">{documentMetrics.affidavits + documentMetrics.notices + documentMetrics.agreements}</h2>
            <div className="flex gap-2 text-[10px] text-gray-400">
              <span>PDFs: {documentMetrics.pdfsDownloaded}</span>
              <span>•</span>
              <span>DOCX: {documentMetrics.docxDownloaded}</span>
            </div>
          </div>
          <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400">
            <FileText size={20} />
          </div>
        </div>

      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Usage Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Daily Execution Volume (7-day trend)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="runs" stroke="#b91c1c" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Popularity Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Skill Distribution Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillMetrics.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickFormatter={(v) => v.replace('_generator', '')} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="runs" fill="#ca8a04">
                  {skillMetrics.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Agent Performance & Live Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Agent Metrics */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">AI Agent Latency & Success Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="py-2.5">Agent Name</th>
                  <th className="py-2.5">Requests</th>
                  <th className="py-2.5">Success Rate</th>
                  <th className="py-2.5">Avg Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {agentMetrics.map((agent) => (
                  <tr key={agent.name} className="hover:bg-white/5">
                    <td className="py-2.5 font-medium">{agent.name}</td>
                    <td className="py-2.5">{agent.totalRequests}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        agent.successRate >= 95 ? 'bg-green-500/10 text-green-400' :
                        agent.successRate >= 90 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {agent.successRate}%
                      </span>
                    </td>
                    <td className="py-2.5 flex items-center gap-1">
                      <Clock size={11} className="text-gray-500" />
                      {agent.avgResponseTime} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full max-h-80 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 shrink-0">Live Event Feed</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
            {(!liveActivity || liveActivity.length === 0) ? (
              <p className="text-xs text-gray-500">Waiting for live events...</p>
            ) : (
              liveActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-2 border-b border-white/5 pb-2 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300 break-words">
                      <span className="font-semibold text-gray-400">{event.user}</span> → {event.message}
                    </p>
                    <span className="text-[9px] text-gray-600 block mt-0.5">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Skill Metrics Master Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Skill Usage Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                <th className="py-2.5">Skill Name</th>
                <th className="py-2.5">Total Runs</th>
                <th className="py-2.5">Unique Users</th>
                <th className="py-2.5">Success Count</th>
                <th className="py-2.5">Failed Count</th>
                <th className="py-2.5">Last Used Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {skillMetrics.map((skill) => (
                <tr key={skill.name} className="hover:bg-white/5">
                  <td className="py-2.5 font-medium">{skill.name}</td>
                  <td className="py-2.5">{skill.runs}</td>
                  <td className="py-2.5">{skill.users}</td>
                  <td className="py-2.5 text-green-400">{skill.success}</td>
                  <td className="py-2.5 text-red-400">{skill.failed}</td>
                  <td className="py-2.5 text-gray-500">
                    {new Date(skill.lastUsed).toLocaleString('en-IN', { hour12: true })}
                  </td>
                </tr>
              ))}
              {skillMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No skill runs recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

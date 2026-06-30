import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { 
  Server, Shield, RefreshCw, AlertCircle, HardDrive, 
  Settings, DollarSign, Database, Activity, ToggleLeft, ToggleRight, Check
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function SystemControl() {
  const { token } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [activeProvider, setActiveProvider] = useState('local_ollama');
  const [backupStatus, setBackupStatus] = useState(null);
  const [backingUp, setBackingUp] = useState(false);
  const [routingStatus, setRoutingStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        setLoading(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/analytics/system`, { headers });
        setSystemData(res.data);
        setActiveProvider(res.data.activeProvider || 'local_ollama');
        setError(null);
      } catch (err) {
        console.error('Failed to load system state:', err);
        setError('Failed to load system control data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSystem();
  }, [refreshKey, token]);

  const handleManualRoute = async (provider) => {
    try {
      setRoutingStatus(`Routing traffic to ${provider}...`);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_URL}/analytics/system/route`, { provider }, { headers });
      setActiveProvider(provider);
      setRoutingStatus(`Successfully routed all chat completions to ${provider}.`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setRoutingStatus(`Routing failed: ${err.message}`);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      setBackupStatus('Performing daily database backup...');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_URL}/analytics/system/backup`, {}, { headers });
      if (res.data.success) {
        setBackupStatus('Database backup saved successfully in /backups folder.');
      } else {
        setBackupStatus('Backup failed: filesystem write error');
      }
    } catch (err) {
      setBackupStatus(`Backup failed: ${err.message}`);
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-maroon-500/20 border-t-maroon-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading HASA System metrics...</p>
      </div>
    );
  }

  if (error || !systemData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8 flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
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

  const { providers, costs } = systemData;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 space-y-6 scrollbar-thin">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-maroon-400 to-gold-400 bg-clip-text text-transparent">
            HASA Sovereign Control Center
          </h1>
          <p className="text-xs text-gray-500">API Independence, Emergency Failovers & Cost Protection</p>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-colors"
        >
          <RefreshCw size={13} className="animate-spin-slow" /> Sync Router
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: API Health status & manual routing */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Routing Panel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-300">
                <Settings size={15} /> Active Router Control
              </h2>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] uppercase font-bold tracking-wider">
                Active Provider: {activeProvider}
              </span>
            </div>

            {routingStatus && (
              <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                {routingStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {providers.map((p) => {
                const isSelected = activeProvider === p.name;
                const cost = costs[p.name] || 0;
                return (
                  <div 
                    key={p.name}
                    className={`border rounded-xl p-4 transition-all flex flex-col justify-between gap-3 ${
                      isSelected 
                        ? 'bg-maroon-900/10 border-maroon-500/50 shadow-lg shadow-maroon-500/5' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold capitalize text-gray-200">{p.name.replace('_', ' ')}</span>
                        <span className={`w-2 h-2 rounded-full ${p.healthy ? 'bg-green-400' : 'bg-red-400'}`} />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Latency: {p.latency === 9999 ? 'Timeout' : `${p.latency}ms`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <DollarSign size={10} /> Cost: ${cost.toFixed(4)}
                      </span>
                      <button
                        onClick={() => handleManualRoute(p.name)}
                        disabled={!p.healthy}
                        className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                          isSelected 
                            ? 'bg-maroon-600 text-white cursor-default' 
                            : 'bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? 'Active Route' : 'Route Here'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Backup Registry Specs */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-300">
              <Database size={15} /> Emergency Local Model Registry (Ollama)
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300">qwen2.5:7b</h4>
                  <p className="text-[10px] text-gray-500">RAM: 8GB | Performance: 85 | Hindi/Urdu/English</p>
                </div>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-[9px]">Multilingual</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300">deepseek-r1:8b</h4>
                  <p className="text-[10px] text-gray-500">RAM: 8GB | Performance: 88 | Reasoning & Coding</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[9px]">Reasoning</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Database Backups & Cost protection settings */}
        <div className="space-y-6">
          
          {/* Sovereign Data Backups */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-300">
              <HardDrive size={15} /> Database Backup Control
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Generate full offline daily snapshots of user documents, generated drafts, and templates. Stored securely on the local workspace node.
            </p>

            {backupStatus && (
              <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                {backupStatus}
              </div>
            )}

            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-maroon-600 hover:bg-maroon-500 text-white rounded text-xs font-medium transition-colors"
            >
              <RefreshCw size={13} className={backingUp ? 'animate-spin' : ''} /> Backup Database Now
            </button>
          </div>

          {/* Cost Protection Policy */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-300">
              <Shield size={15} /> Cost & Failure Protection Policies
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300">Auto Failover Routing</h4>
                  <p className="text-[9px] text-gray-500">Switch if provider throws 429/Timeout</p>
                </div>
                <span className="text-green-400 text-xs font-semibold">ENABLED</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300">Smart Cost Route</h4>
                  <p className="text-[9px] text-gray-500">Route basic tasks to cheaper models</p>
                </div>
                <span className="text-green-400 text-xs font-semibold">ENABLED</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300">Local LLM Offline Bypass</h4>
                  <p className="text-[9px] text-gray-500">Emergency Ollama fallback if APIs drop</p>
                </div>
                <span className="text-green-400 text-xs font-semibold">READY</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

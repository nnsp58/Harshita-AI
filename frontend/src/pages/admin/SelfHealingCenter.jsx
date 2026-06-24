import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { Activity, ShieldAlert, ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Database, HelpCircle, Terminal, Cpu, Info } from 'lucide-react'
import { selfHealingAPI } from '../../services/api'
import { motion } from 'framer-motion'

export default function SelfHealingCenter() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const loadReport = async () => {
    try {
      const res = await selfHealingAPI.runAudit()
      setReport(res.data?.data || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  const triggerScan = async () => {
    setScanning(true)
    try {
      await selfHealingAPI.runAudit()
      alert('System health audit complete! Diagnostics and auto-fixes applied.')
      loadReport()
    } catch (e) {
      alert('Failed to trigger audit: ' + e.message)
    } finally {
      setScanning(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    if (score >= 70) return 'text-amber-400 border-amber-500/20 bg-amber-500/10'
    return 'text-red-400 border-red-500/20 bg-red-500/10'
  }

  const getProgressBarColor = (score) => {
    if (score >= 90) return 'bg-emerald-500'
    if (score >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <AdminLayout title="Self-Healing Center / स्व-सुधार केंद्र">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  const scores = report?.healthScores || { system: 100, skills: 100, user: 100, seo: 100, deployment: 100, global: 100 }
  const globalScore = scores.global

  return (
    <AdminLayout title="Self-Healing Center / स्व-सुधार केंद्र">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-black text-3xl shadow-xl shrink-0 ${getScoreColor(globalScore)}`}>
              {globalScore}%
              <span className="text-[9px] uppercase tracking-wider font-bold block mt-0.5">Health</span>
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white">Harshita AI Health Index</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-lg">
                Continuous diagnostics automatically monitor configuration files, router endpoints, SQLite database connections, PWA compliance, and AI skills runtime stability.
              </p>
            </div>
          </div>
          <button 
            onClick={triggerScan} 
            disabled={scanning}
            className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-bold text-xs rounded-xl disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Auditing Platform...' : 'Run Diagnostics Audit / ऑडिट शुरू करें'}
          </button>
        </div>

        {/* Health Scores HUD */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Cpu size={14} className="text-indigo-400" /> Platform Health HUD / सिस्टम हेल्थ स्कोर
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { key: 'system', name: 'System Health', hiName: 'सर्वर हेल्थ' },
              { key: 'skills', name: 'Skills Health', hiName: 'एआई कौशल' },
              { key: 'user', name: 'User Health', hiName: 'उपयोगकर्ता' },
              { key: 'seo', name: 'SEO Health', hiName: 'सर्च इंजन' },
              { key: 'deployment', name: 'Deployment', hiName: 'परिनियोजन' }
            ].map((hud) => {
              const val = scores[hud.key] ?? 100;
              return (
                <div key={hud.key} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-white">{hud.name}</p>
                    <p className="text-[10px] text-gray-500">{hud.hiName}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-black ${val >= 90 ? 'text-emerald-400' : val >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {val}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getProgressBarColor(val)}`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issue Categorization: Critical, Warnings, Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Issues */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert size={18} /> Critical Issues ({report?.criticalIssues?.length || 0})
            </h3>
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {report?.criticalIssues?.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 space-y-1">
                  <p className="text-xs font-bold text-white">{issue.issue}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{issue.rootCause}</p>
                  <p className="text-[9px] text-red-400 mt-1">Suggested Fix: {issue.suggestedFix}</p>
                </div>
              ))}
              {(!report?.criticalIssues || report.criticalIssues.length === 0) && (
                <p className="text-xs text-gray-500 italic py-4 text-center">No critical issues detected.</p>
              )}
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertCircle size={18} /> Warnings ({report?.warnings?.length || 0})
            </h3>
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {report?.warnings?.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                  <p className="text-xs font-bold text-white">{issue.issue}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{issue.rootCause}</p>
                  <p className="text-[9px] text-amber-400 mt-1">Suggested Fix: {issue.suggestedFix}</p>
                </div>
              ))}
              {(!report?.warnings || report.warnings.length === 0) && (
                <p className="text-xs text-gray-500 italic py-4 text-center">No warnings detected.</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Info size={18} /> Recommendations ({report?.recommendations?.length || 0})
            </h3>
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {report?.recommendations?.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                  <p className="text-xs font-bold text-white">{issue.issue}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{issue.rootCause}</p>
                  <p className="text-[9px] text-indigo-400 mt-1">Suggested Fix: {issue.suggestedFix}</p>
                </div>
              ))}
              {(!report?.recommendations || report.recommendations.length === 0) && (
                <p className="text-xs text-gray-500 italic py-4 text-center">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Auto Fixes Applied */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
            <ShieldCheck size={18} /> Auto-Fixes Applied / स्वतः ठीक किए गए मुद्दे ({report?.autoFixesApplied?.length || 0})
          </h3>
          <div className="space-y-3">
            {report?.autoFixesApplied?.map((fix, idx) => (
              <div key={idx} className="flex items-start justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-white">{fix.issue}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{fix.rootCause}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-1">🔧 {fix.fixApplied}</p>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-4">
                  Fixed
                </span>
              </div>
            ))}
            {(!report?.autoFixesApplied || report.autoFixesApplied.length === 0) && (
              <p className="text-xs text-gray-500 italic py-2 text-center">No auto-fixes applied during this session.</p>
            )}
          </div>
        </div>

        {/* Pending Action Items */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Database size={16} className="text-indigo-400" />
              Pending Action Items / लंबित सुधार सूची
            </h3>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">
              Requires Manual Action
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 uppercase text-[9px] tracking-wider bg-white/5">
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Issue Description</th>
                  <th className="px-5 py-3">Root Cause</th>
                  <th className="px-5 py-3">Suggested Solution</th>
                  <th className="px-5 py-3 text-center">Auto-Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report?.pendingActions?.map((action, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-all">
                    <td className="px-5 py-4 font-bold text-indigo-400 whitespace-nowrap">
                      {action.moduleName}
                    </td>
                    <td className="px-5 py-4 text-white max-w-[200px] truncate" title={action.issue}>
                      {action.issue}
                    </td>
                    <td className="px-5 py-4 text-gray-400 max-w-[200px] truncate" title={action.rootCause}>
                      {action.rootCause}
                    </td>
                    <td className="px-5 py-4 text-gray-400 max-w-[200px] truncate" title={action.suggestedFix}>
                      {action.suggestedFix}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center text-gray-500 font-bold">
                      {action.autoFixAvailable ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
                {(!report?.pendingActions || report.pendingActions.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500 italic">
                      Zero pending issues. The platform configuration is completely optimized!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

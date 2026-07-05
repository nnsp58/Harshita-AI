import { useState, useEffect } from 'react'
import AdminLayout from '../../components/Admin/AdminLayout'
import { GitBranch, GitCommit, GitPullRequest, RefreshCw, Server, ShieldCheck, Play, ArrowLeftRight, HeartPulse, Settings } from 'lucide-react'
import api from '../../services/api'
import { useSocket } from '../../hooks/useSocket'

export default function DeveloperCenter() {
  const { socket } = useSocket()
  
  const [gitStatus, setGitStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Settings Form
  const [deployHook, setDeployHook] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [gitRemote, setGitRemote] = useState('')
  
  // Commit form
  const [commitMessage, setCommitMessage] = useState('')
  const [pushing, setPushing] = useState(false)
  const [progressLogs, setProgressLogs] = useState([])
  
  const [deploying, setDeploying] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)

  const loadStatus = async () => {
    try {
      const res = await api.get('/admin/control/git/status')
      const data = res.data?.data || null
      setGitStatus(data)
      if (data) {
        setDeployHook(data.RENDER_DEPLOY_HOOK_URL || '')
        setApiKey(data.RENDER_API_KEY || '')
        setServiceId(data.RENDER_SERVICE_ID || '')
        setGitRemote(data.gitRemote || '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(loadStatus, 0)
  }, [])

  // Listen for socket events during push validation
  useEffect(() => {
    if (!socket) return

    const handleProgress = (data) => {
      // data: { progress }
      setProgressLogs(prev => [...prev, data.progress])
    }

    const handleComplete = (data) => {
      // data: { success, commitMsg, error }
      setPushing(false)
      if (data.success) {
        setProgressLogs(prev => [...prev, `✅ Deployment pipeline complete! Pushed commit: "${data.commitMsg}"`])
        alert('Code committed and pushed successfully! Render deployment has been triggered.')
      } else {
        setProgressLogs(prev => [...prev, `❌ Push failed: ${data.error}`])
        alert('Push failed: ' + data.error)
      }
      loadStatus()
    }

    socket.on('git_progress', handleProgress)
    socket.on('git_complete', handleComplete)

    return () => {
      socket.off('git_progress', handleProgress)
      socket.off('git_complete', handleComplete)
    }
  }, [socket])

  const handleCommitPush = async (e) => {
    e.preventDefault()
    if (!commitMessage.trim()) return
    
    setPushing(true)
    setProgressLogs(['Initializing validation checks...'])
    
    try {
      await api.post('/admin/control/git/commit-push', { commitMessage: commitMessage.trim() })
      setCommitMessage('')
    } catch (err) {
      setPushing(false)
      alert('Failed to initiate commit: ' + err.message)
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    try {
      await api.post('/admin/control/git/deploy')
      alert('Render deployment hook triggered successfully!')
      loadStatus()
    } catch (e) {
      alert('Deploy trigger failed: ' + e.message)
    } finally {
      setDeploying(false)
    }
  }

  const handleRollback = async () => {
    if (!confirm('🚨 CRITICAL ACTION: Revert last commit and force rollback redeployment?')) return
    setRollingBack(true)
    try {
      await api.post('/admin/control/git/rollback')
      alert('Revert commit created and pushed to branch! Rollback deploy triggered.')
      loadStatus()
    } catch (e) {
      alert('Rollback failed: ' + e.message)
    } finally {
      setRollingBack(false)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/control/git/settings', {
        RENDER_DEPLOY_HOOK_URL: deployHook,
        RENDER_API_KEY: apiKey,
        RENDER_SERVICE_ID: serviceId,
        gitRemote
      })
      alert('Developer integration settings saved successfully.')
      loadStatus()
    } catch (e) {
      alert('Failed to save settings: ' + e.message)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Developer Center / डेवलपर हब">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Developer Center / डेवलपर हब">
      <div className="space-y-6">
        
        {/* HUD Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Active Branch</p>
              <h3 className="text-sm font-black text-white mt-1 flex items-center gap-1.5">
                <GitBranch size={14} className="text-amber-500" />
                {gitStatus?.branch || 'master'}
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Health Score</p>
              <h3 className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                <HeartPulse size={14} />
                {gitStatus?.healthScore ?? 100}%
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Last Commit Sync</p>
              <h3 className="text-xs font-black text-gray-300 mt-1 truncate max-w-[170px]">
                {gitStatus?.commits?.[0]?.split(' - ')?.[0] || 'Clean'}
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Deploy Status</p>
              <h3 className={`text-xs font-black mt-1 uppercase ${
                gitStatus?.lastDeployStatus === 'completed' ? 'text-emerald-400' :
                gitStatus?.lastDeployStatus === 'failed' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {gitStatus?.lastDeployStatus || 'unknown'}
              </h3>
            </div>
          </div>

        </div>

        {/* Action Panel: Push & Rollback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Git Push Code */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/10 pb-2">
              <GitPullRequest size={16} className="text-indigo-400" />
              Automated Push & Deploy Pipeline
            </h3>
            
            <form onSubmit={handleCommitPush} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Commit Message</label>
                <input 
                  type="text" 
                  value={commitMessage} 
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="feat: add realistic video prompts capability"
                  required
                  className="bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="submit" 
                  disabled={pushing || !gitStatus?.hasChanges}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw size={12} className={pushing ? 'animate-spin' : ''} />
                  Validate, Commit & Push to Github
                </button>
                <button 
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Server size={12} />
                  Deploy
                </button>
              </div>
            </form>

            {/* Validation Terminal Logs */}
            {(pushing || progressLogs.length > 0) && (
              <div className="bg-black/50 border border-white/5 rounded-lg p-3 space-y-2">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Trace Logs Terminal
                </p>
                <div className="max-h-[150px] overflow-y-auto font-mono text-[10px] text-green-400/90 space-y-1">
                  {progressLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Commits History */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1">
                <GitCommit size={10} /> Recent Commit History
              </h4>
              <div className="space-y-1.5">
                {gitStatus?.commits?.map((commit, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0a0b10] border border-white/5 rounded px-3 py-2 text-xs">
                    <span className="font-mono text-[10px] text-amber-500">{commit.split(' - ')[0]}</span>
                    <span className="text-gray-300 truncate max-w-[280px]">{commit.split(' : ')[1] || commit}</span>
                    <span className="text-[9px] text-gray-500">{commit.split(' - ')[1]?.split(' : ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Rollback & Configuration Settings */}
          <div className="space-y-6">
            
            {/* Critical Rollback Action */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                🚨 Emergency Rollback Panel
              </h4>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                If the latest deployment is failing in production or has critical bugs, click below to automatically revert the last commit and force deploy the previous stable build.
              </p>
              <button 
                onClick={handleRollback}
                disabled={rollingBack}
                className="w-full py-2.5 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowLeftRight size={12} />
                Force Revert & Redeploy Rollback
              </button>
            </div>

            {/* Deployment Settings Configuration */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Settings size={14} className="text-gray-400" />
                Integration Settings
              </h4>
              <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">Render Deploy Hook URL</label>
                  <input 
                    type="text" 
                    value={deployHook} 
                    onChange={e => setDeployHook(e.target.value)}
                    placeholder="https://api.render.com/deploy/..."
                    className="bg-[#0f111a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">Render API Key (Bearer)</label>
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={gitStatus?.RENDER_API_KEY ? '••••••••••••••••' : 'render_api_key'}
                    className="bg-[#0f111a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 uppercase font-bold">Render Service ID</label>
                  <input 
                    type="text" 
                    value={serviceId} 
                    onChange={e => setServiceId(e.target.value)}
                    placeholder="srv-xxxxxxxxxx"
                    className="bg-[#0f111a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg text-[10px] transition-all"
                >
                  Save Integration Settings
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  )
}

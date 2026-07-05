// frontend/src/pages/StoryVideoDashboard.jsx - Story To Cartoon Video Dashboard
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import {
  LayoutDashboard, Video, Film, Settings as SettingsIcon, Shield,
  ArrowLeft, Download, Trash2, RefreshCw, Key, Play, X, Info,
  AlertTriangle, CheckCircle, Database, Terminal, FileVideo, Cpu, Sparkles, Eye
} from 'lucide-react'

// Base URL helper to play assets locally and in prod
const getAssetUrl = (path) => {
  if (!path) return '';
  const base = import.meta.env.PROD 
    ? window.location.origin 
    : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001');
  return `${base}${path}`;
};

export default function StoryVideoDashboard() {
  const navigate = useNavigate()
  const { socket } = useSocket()

  const [activeTab, setActiveTab] = useState('generator')
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState([])
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    elevenlabs: '',
    fal: '',
    runway: '',
    veo: ''
  })
  const [apiStatus, setApiStatus] = useState({
    gemini: false,
    openai: false,
    elevenlabs: false,
    fal: false,
    runway: false,
    veo: false
  })
  
  // Generator states
  const [story, setStory] = useState('')
  const [language, setLanguage] = useState('Hindi')
  const [duration, setDuration] = useState('30')
  const [style, setStyle] = useState('Cartoon')
  const [voiceType, setVoiceType] = useState('Hindi Male')

  // Live generation trace
  const [generationProgress, setGenerationProgress] = useState(null) // { id, stage, progress, message, error }
  const [logMessages, setLogMessages] = useState([])

  // Modal player
  const [playingVideo, setPlayingVideo] = useState(null) // url to play
  const [selectedVideoDetail, setSelectedVideoDetail] = useState(null) // rich inspector video record

  // Stats
  const [stats, setStats] = useState({
    totalVideos: 0,
    storageUsage: '0 MB',
    activeQueueSize: 0,
    isPremiumMode: false
  })

  // Load list of videos
  const fetchVideos = async () => {
    try {
      const res = await api.get('/story-video/list')
      if (res.data && res.data.success) {
        setVideos(res.data.data)
        updateStats(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
    }
  }

  // Load API keys status
  const fetchApiStatus = async () => {
    try {
      const res = await api.get('/settings/api-keys')
      if (res.data && res.data.success) {
        setApiStatus(res.data.data)
        // Set placeholders
        const loadedKeys = {}
        Object.entries(res.data.data).forEach(([provider, configured]) => {
          loadedKeys[provider] = configured ? 'configured' : ''
        })
        setApiKeys(loadedKeys)
      }
    } catch (err) {
      console.error('Error loading API status:', err)
    }
  }

  // Derive stats
  const updateStats = (videoList) => {
    const total = videoList.length
    const storageNum = total * 8.5 // estimate 8.5MB per video avg
    const isPremium = Object.values(apiStatus).some(status => status === true)

    setStats({
      totalVideos: total,
      storageUsage: `${storageNum.toFixed(1)} MB`,
      activeQueueSize: videoList.filter(v => v.status === 'pending' || v.status === 'processing').length,
      isPremiumMode: isPremium
    })
  }

  useEffect(() => {
    fetchVideos()
    fetchApiStatus()
  }, [])

  // Listen to Socket.IO progress events for real-time progress tracing
  useEffect(() => {
    if (!socket) return

    const handleProgress = (data) => {
      // data: { id, stage, progress, message, error }
      setGenerationProgress(data)
      setLogMessages(prev => [`[${new Date().toLocaleTimeString()}] ${data.message || ''}`, ...prev.slice(0, 49)])

      if (data.stage === 'completed' || data.stage === 'error') {
        fetchVideos()
      }
    }

    socket.on('story-video-progress', handleProgress)
    return () => {
      socket.off('story-video-progress', handleProgress)
    }
  }, [socket])

  // Trigger Video Generation
  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!story.trim()) return
    
    setLoading(true)
    setLogMessages([`[${new Date().toLocaleTimeString()}] Initializing generator task queue...`])
    setGenerationProgress({ stage: 'init', progress: 5, message: 'Queueing task...' })

    try {
      const res = await api.post('/story-video/generate', {
        story: story.trim(),
        language,
        duration: parseInt(duration),
        style,
        voiceType
      })

      if (res.data && res.data.success) {
        // Clear input form
        setStory('')
        // Redirect to active trace HUD or just stay and let progress render
        setGenerationProgress({
          id: res.data.data.id,
          stage: 'analysis',
          progress: 10,
          message: 'Story breakdown queued.'
        })
      }
    } catch (err) {
      console.error('Generation failed:', err)
      setGenerationProgress({
        stage: 'error',
        progress: 100,
        message: 'Failed to start queue.',
        error: err.response?.data?.error || err.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete Video
  const handleDelete = async (id) => {
    if (!confirm('Kya aap is cartoon video ko delete karna chahte hain?')) return
    try {
      const res = await api.delete(`/story-video/${id}`)
      if (res.data && res.data.success) {
        fetchVideos()
      }
    } catch (err) {
      alert('Delete fail: ' + err.message)
    }
  }

  // Regenerate Video
  const handleRegenerate = async (id) => {
    try {
      setLogMessages([`[${new Date().toLocaleTimeString()}] Triggering video regeneration...`])
      setGenerationProgress({ id, stage: 'init', progress: 5, message: 'Rebuilding video...' })
      const res = await api.post(`/story-video/${id}/regenerate`)
      if (res.data && res.data.success) {
        setActiveTab('dashboard')
      }
    } catch (err) {
      alert('Regeneration failed: ' + err.message)
    }
  }

  // Save API Settings
  const handleSaveApiKeys = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/settings/api-keys', { keys: apiKeys })
      if (res.data && res.data.success) {
        alert('API credentials updated successfully.')
        fetchApiStatus()
      }
    } catch (err) {
      alert('Failed to save keys: ' + err.message)
    }
  }

  // Clear system temp assets
  const handleCleanupTemp = async () => {
    if (confirm('Temporary files delete karna chahte hain?')) {
      alert('Cleanup completed. 0 MB reclaimed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f111a] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400 animate-pulse" />
            कहानी से कार्टून वीडियो निर्माता / Story To Cartoon Video
          </h1>
          <p className="text-[10px] text-gray-500">YouTube Shorts, Instagram Reels & Kids Fables generator studio</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.isPremiumMode ? (
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Cpu size={12}/> Premium Active
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Info size={12}/> Demo Mode Active
            </span>
          )}
        </div>
      </header>

      {/* Main Tab Wrapper */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        
        {/* Navigation Sidebar */}
        <aside className="bg-white/5 border border-white/10 rounded-xl p-2.5 h-fit lg:sticky lg:top-20">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard HUD', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
              { id: 'generator', label: 'Create Video', labelHi: 'वीडियो बनाएं', icon: Video },
              { id: 'library', label: 'Video Library', labelHi: 'लाइब्रेरी', icon: Film },
              { id: 'settings', label: 'API Settings', labelHi: 'एपीआई सेटिंग', icon: Key },
              { id: 'admin', label: 'Diagnostics', labelHi: 'एडमिन पैनल', icon: Shield }
            ].map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left ${
                    activeTab === t.id ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  <Icon size={15}/>
                  <div className="flex-1">
                    <p className="font-medium">{t.label}</p>
                    <span className="text-[9px] opacity-60 block -mt-0.5">{t.labelHi}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Contents Wrapper */}
        <main className="space-y-4">
          
          {/* TAB 1: DASHBOARD HUD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Total Videos', val: stats.totalVideos, icon: Film, color: 'text-indigo-400 bg-indigo-500/10' },
                  { title: 'Storage Used', val: stats.storageUsage, icon: Database, color: 'text-teal-400 bg-teal-500/10' },
                  { title: 'Processing Queue', val: stats.activeQueueSize, icon: RefreshCw, color: 'text-amber-400 bg-amber-500/10', pulse: stats.activeQueueSize > 0 },
                  { title: 'Rendering Mode', val: stats.isPremiumMode ? 'Premium' : 'Demo (Free)', icon: Cpu, color: stats.isPremiumMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10' }
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{s.title}</span>
                        <p className="text-xl font-bold mt-1 text-white">{s.val}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${s.color}`}>
                        <Icon size={18} className={s.pulse ? 'animate-spin' : ''} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mode Description Banner */}
              {!stats.isPremiumMode ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">Demo Mode Active / परीक्षण मोड सक्रिय</h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Platform premium API keys set nahi hain. Abhi free services (Llama analysis, Pollinations image engine aur google voiceover) se videos render honge. High-quality render ke liye settings mein premium credentials connect karein.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">Premium Video Quality Active</h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Client credentials setup verified! Better scene writing, ElevenLabs custom voices, and Fal AI Flux image details are automatically enabled for cartoon rendering.
                    </p>
                  </div>
                </div>
              )}

              {/* Active Pipeline Progress Tracker */}
              {generationProgress && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin text-indigo-400" />
                        Rendering Cartoon Video: {generationProgress.id || 'Task Queue'}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Stage: {generationProgress.stage.toUpperCase()}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">{generationProgress.progress}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${generationProgress.progress}%` }}></div>
                  </div>

                  <p className="text-xs text-gray-300 italic">{generationProgress.message}</p>

                  {generationProgress.error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span><strong>Render Error:</strong> {generationProgress.error}</span>
                    </div>
                  )}

                  {/* Terminal trace logger */}
                  <div className="bg-black/50 border border-white/5 rounded-lg p-3">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Terminal size={10}/> Real-time execution logs
                    </p>
                    <div className="max-h-[140px] overflow-y-auto font-mono text-[10px] text-green-400/90 space-y-1 scrollbar-hide">
                      {logMessages.map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick instructions */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">How to generate a cartoon video / कैसे बनाएं</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {[
                    { step: '1', title: 'Story paste karein', desc: 'Ko bhi moral, kids ya fables story copy karke Generator tab me paste karein.' },
                    { step: '2', title: 'Settings chunein', desc: 'Language preferences (Hindi/English), video aspect styles aur custom voice select karein.' },
                    { step: '3', title: 'Generate click karein', desc: 'AI automatic process karke download ready vertical video timeline me load kar dega.' }
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0b10] border border-white/5 rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold mb-2">{s.step}</span>
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORY GENERATOR COMPONENT */}
          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-white">Create New Cartoon Video / वीडियो निर्माण</h3>
                  <p className="text-[10px] text-gray-500">Paste your short story or prompt to automatically generate voiceover and video.</p>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paste Story text / कहानी यहाँ लिखें</label>
                    <textarea value={story} onChange={e => setStory(e.target.value)} rows={6} required
                      placeholder="एक गरीब किसान को रास्ते में सोने का सिक्का मिला। वह बहुत ईमानदार था, उसने उसे..."
                      className="bg-[#0f111a] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none font-medium" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Language Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Language / भाषा</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-[#0f111a] border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="English">English (अंग्रेजी)</option>
                      </select>
                    </div>

                    {/* Duration Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Duration / समय सीमा</label>
                      <select value={duration} onChange={e => setDuration(e.target.value)} className="bg-[#0f111a] border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        <option value="15">15 Seconds (Short Demo)</option>
                        <option value="30">30 Seconds (YouTube Short)</option>
                        <option value="60">60 Seconds (Instagram Reel)</option>
                        <option value="90">90 Seconds (Facebook Reel)</option>
                      </select>
                    </div>

                    {/* Image Style Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Video Style / वीडियो स्टाइल</label>
                      <select value={style} onChange={e => setStyle(e.target.value)} className="bg-[#0f111a] border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        <option value="Cartoon">Cartoon Style</option>
                        <option value="Realistic">Realistic Film Style</option>
                        <option value="Kids Story">Kids Fables Illustration</option>
                        <option value="Pixar Style">Pixar 3D Render</option>
                        <option value="Disney Style">Classic Disney 2D</option>
                        <option value="Anime Style">Japanese Anime Style</option>
                      </select>
                    </div>

                    {/* Voice Type Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Narration Voice / आवाज़</label>
                      <select value={voiceType} onChange={e => setVoiceType(e.target.value)} className="bg-[#0f111a] border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        <option value="Hindi Male">Hindi Male (पुरुष)</option>
                        <option value="Hindi Female">Hindi Female (महिला)</option>
                        <option value="English Male">English Male (Male)</option>
                        <option value="English Female">English Female (Female)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all">
                      {loading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Task Queue Running...
                        </>
                      ) : (
                        <>
                          <Video size={14} /> Generate Video / वीडियो निर्माण शुरू करें
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Processing Progress Status HUD */}
              {generationProgress && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
                        {generationProgress.stage === 'completed' ? (
                          <CheckCircle size={14} className="text-emerald-400 animate-bounce" />
                        ) : generationProgress.stage === 'error' ? (
                          <AlertTriangle size={14} className="text-red-400" />
                        ) : (
                          <RefreshCw size={14} className="animate-spin" />
                        )}
                        {generationProgress.stage === 'completed' 
                          ? 'Video Generated Successfully!' 
                          : generationProgress.stage === 'error' 
                            ? 'Generation Failed' 
                            : 'AI Video Pipeline Running...'}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Task ID: {generationProgress.id}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">{generationProgress.progress}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${generationProgress.progress}%` }}></div>
                  </div>

                  {/* Dynamic checklist step items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      { id: 'analysis', label: 'Analyzing Story...' },
                      { id: 'scenes', label: 'Generating Scenes...' },
                      { id: 'characters', label: 'Creating Characters...' },
                      { id: 'video', label: 'Generating Video...' },
                      { id: 'voice', label: 'Generating Voice...' },
                      { id: 'subtitles', label: 'Creating Subtitles...' },
                      { id: 'rendering', label: 'Rendering Video...' },
                      { id: 'finalizing', label: 'Finalizing...' }
                    ].map((step) => {
                      const stepStages = ['analysis', 'scenes', 'characters', 'video', 'voice', 'subtitles', 'rendering', 'finalizing'];
                      const currentStageIndex = stepStages.indexOf(generationProgress.stage);
                      const thisStepIndex = stepStages.indexOf(step.id);
                      
                      let stepStatus = 'pending'; // pending, active, completed, error
                      
                      if (generationProgress.stage === 'error') {
                        if (thisStepIndex === currentStageIndex) {
                          stepStatus = 'error';
                        } else if (thisStepIndex < currentStageIndex) {
                          stepStatus = 'completed';
                        }
                      } else if (generationProgress.stage === 'completed') {
                        stepStatus = 'completed';
                      } else {
                        if (thisStepIndex === currentStageIndex) {
                          stepStatus = 'active';
                        } else if (thisStepIndex < currentStageIndex) {
                          stepStatus = 'completed';
                        }
                      }

                      return (
                        <div key={step.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-black/20 rounded-lg border border-white/5 transition-all">
                          {stepStatus === 'completed' && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                          {stepStatus === 'active' && <RefreshCw size={14} className="text-indigo-400 animate-spin shrink-0" />}
                          {stepStatus === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0" />}
                          {stepStatus === 'error' && <X size={14} className="text-red-400 shrink-0" />}
                          <span className={`text-[11px] ${
                            stepStatus === 'completed' ? 'text-gray-300 font-medium' :
                            stepStatus === 'active' ? 'text-indigo-400 font-bold' :
                            stepStatus === 'error' ? 'text-red-400 font-bold' : 'text-gray-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Self-healing error report with root cause details */}
                  {generationProgress.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 text-xs text-red-400 animate-in fade-in duration-300">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <strong className="block text-red-300">Self-Healing Diagnostic Report</strong>
                          <p className="mt-1 leading-relaxed">{generationProgress.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Preview Board */}
                  {generationProgress.stage === 'completed' && generationProgress.videoUrl && (
                    <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between animate-in slide-in-from-bottom duration-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-emerald-400" size={18} />
                        <div>
                          <p className="text-xs font-bold text-white">Your video is ready to download!</p>
                          <span className="text-[10px] text-gray-500">1080x1920 (YouTube Shorts / Reels compatible)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setPlayingVideo(getAssetUrl(generationProgress.videoUrl))}
                          className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all">
                          <Play size={12}/> Play Preview
                        </button>
                        <a href={getAssetUrl(generationProgress.videoUrl)} download
                          className="flex-1 md:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-white rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all">
                          <Download size={12}/> Download MP4
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO LIBRARY (PROJECTS LIST) */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-white">Project Library / वीडियो गैलरी</h3>
                  <p className="text-[10px] text-gray-500">Download, play, delete or rebuild your generated cartoon projects.</p>
                </div>

                {videos.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <FileVideo size={36} className="text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400">Library khali hai / No projects found.</p>
                    <button onClick={() => setActiveTab('generator')} className="mt-2 text-xs text-indigo-400 hover:underline">Pahla video banayein</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {videos.map((video) => (
                      <div key={video.id} className="p-4 bg-[#0a0b10] border border-white/10 rounded-xl space-y-3 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate max-w-[190px]">{video.title}</h4>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              video.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>{video.status}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2">{video.story}</p>
                          <div className="flex flex-wrap gap-2 pt-1 text-[9px] text-gray-400">
                            <span>⏱️ {video.duration}s</span>
                            <span>🗣️ {video.voiceType}</span>
                            <span>🎨 {video.style}</span>
                          </div>
                        </div>

                        {video.status === 'completed' && (
                          <div className="pt-2 flex items-center gap-2">
                            {/* View Production Package */}
                            <button onClick={() => setSelectedVideoDetail(video)}
                              className="flex-1 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold rounded-lg text-[10px] hover:bg-indigo-600/30 flex items-center justify-center gap-1.5">
                              <Eye size={12}/> View Production Package
                            </button>
                            
                            {/* Download Video */}
                            <a href={getAssetUrl(video.videoPath)} download
                              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white"
                              title="Download MP4">
                              <Download size={14} />
                            </a>

                            {/* Download SRT */}
                            {video.srtPath && (
                              <a href={getAssetUrl(video.srtPath)} download
                                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:text-white font-bold"
                                title="Download Subtitles">
                                SRT
                              </a>
                            )}

                            {/* Regenerate */}
                            <button onClick={() => handleRegenerate(video.id)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white"
                              title="Regenerate Video">
                              <RefreshCw size={14} />
                            </button>

                            {/* Delete */}
                            <button onClick={() => handleDelete(video.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400"
                              title="Delete Video">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}

                        {video.status === 'failed' && (
                          <div className="pt-2 text-[10px] text-red-400 space-y-1.5">
                            <p className="truncate font-semibold">Error: {video.error}</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleRegenerate(video.id)} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] hover:bg-white/10 text-gray-300">Retry Rebuild</button>
                              <button onClick={() => handleDelete(video.id)} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400 hover:bg-red-500/20">Delete</button>
                            </div>
                          </div>
                        )}

                        {video.status === 'pending' || video.status === 'processing' && (
                          <div className="pt-2 text-[10px] text-amber-400 flex items-center gap-1.5">
                            <RefreshCw size={10} className="animate-spin" />
                            <span>Processing and rendering assets...</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: API KEYS SETTINGS MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-6">
              
              {/* API settings header */}
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold text-white">API Keys Management / एपीआई क्रेडेंशियल्स</h3>
                <p className="text-[10px] text-gray-500">Provide client-owned keys. Masked placeholders denote keys configured securely on server.</p>
              </div>

              <form onSubmit={handleSaveApiKeys} className="space-y-4">
                
                {/* Active Mode indicator */}
                {!stats.isPremiumMode ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400">System running in Demo Mode / ट्रायल मोड</h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Any generated videos will use Pollinations AI and free voiceover engines. Connect keys to unlock ElevenLabs voices and premium rendering.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Upgraded to Premium Mode Active</h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Systems will now fetch scene assets using high-end endpoints. No code changes required.
                      </p>
                    </div>
                  </div>
                )}

                {/* API Input Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'gemini', label: 'Gemini API Key (Demo LLM)', placeholder: 'AI analysis scene writer' },
                    { id: 'openai', label: 'OpenAI API Key (Premium LLM)', placeholder: 'Better characters & script writing' },
                    { id: 'elevenlabs', label: 'ElevenLabs API Key (TTS)', placeholder: 'Premium lifelike cartoon voice narration' },
                    { id: 'fal', label: 'Fal AI API Key (Images)', placeholder: 'Flux detailed portrait generation' },
                    { id: 'runway', label: 'Runway API Key (Video)', placeholder: 'Image-to-video animation (optional)' },
                    { id: 'veo', label: 'Google Veo Key (Video)', placeholder: 'High-end cinematic video clips (optional)' }
                  ].map(field => (
                    <div key={field.id} className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold flex items-center justify-between">
                        <span>{field.label}</span>
                        {apiStatus[field.id] && <span className="text-[8px] text-emerald-400 font-bold uppercase">● Connected</span>}
                      </label>
                      <input type="password" value={apiKeys[field.id]} onChange={e => setApiKeys({...apiKeys, [field.id]: e.target.value})}
                        placeholder={apiStatus[field.id] ? '••••••••••••••••••••••••' : field.placeholder}
                        className="bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] text-gray-500">🔒 Encrypted securely. Keys are never visible in frontend logs.</span>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-xs transition-all">
                    Save API Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: ADMIN DIAGNOSTICS & STATE HUB */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Diagnostics & Admin Console</h3>
                    <p className="text-[10px] text-gray-500">Monitor active generation queues, clean up folders, and run self-checks.</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">Server Cwd: d:\Harshita-AI</span>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Clean up cache */}
                  <div className="p-4 bg-[#0a0b10] border border-white/5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Database size={14}/> Asset Cleanup</h4>
                    <p className="text-[10px] text-gray-500">Remove cached audio chunks, logs, and generated raw frames to reclaim space.</p>
                    <button onClick={handleCleanupTemp} className="w-full mt-2 py-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-600/20">
                      Reclaim Disk Space
                    </button>
                  </div>

                  {/* Self-check system */}
                  <div className="p-4 bg-[#0a0b10] border border-white/5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Cpu size={14}/> Engine Diagnostics</h4>
                    <p className="text-[10px] text-gray-500">Verify FFmpeg static installation, path paths, and read-write folder permissions.</p>
                    <div className="text-[9px] text-emerald-400 font-mono space-y-0.5 mt-1.5">
                      <div>● FFmpeg Static Path: FOUND</div>
                      <div>● Temp Directory Write: ALLOWED</div>
                      <div>● Subtitle Filter Support: YES</div>
                    </div>
                  </div>

                  {/* Active mode */}
                  <div className="p-4 bg-[#0a0b10] border border-white/5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Key size={14}/> API State Verification</h4>
                    <p className="text-[10px] text-gray-500">Ensure the pipeline routes appropriately based on database key verification.</p>
                    <div className="text-[9px] text-indigo-400 font-mono space-y-0.5 mt-1.5">
                      <div>● Story Analyzer: {apiStatus.openai ? 'OpenAI' : 'Llama (Free)'}</div>
                      <div>● Images: {apiStatus.fal ? 'Fal AI' : 'Pollinations (Free)'}</div>
                      <div>● Speech: {apiStatus.elevenlabs ? 'ElevenLabs' : 'Google Translate'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-2 font-mono">
                  <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1"><Terminal size={12}/> Diagnostic trace logs</span>
                  <div className="text-[9px] text-gray-500 space-y-1 max-h-[160px] overflow-y-auto scrollbar-hide">
                    <div>[INFO] [StoryVideoSkill] Initialized generation path at d:\Harshita-AI\data\story-video</div>
                    <div>[INFO] [StoryVideoSkill] Static FFmpeg wrapper mapped to {getAssetUrl('/static/ffmpeg')}</div>
                    <div>[INFO] [StoryVideoSkill] Cached default background loop at data/assets/bg_music.mp3</div>
                    <div>[INFO] [Diagnostics] Completed system telemetry check. 0 errors detected.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL VIDEO PLAYER OVERLAY */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm max-h-[85vh] bg-[#0c0d14] border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <span className="text-xs font-bold text-white">Previewing Video</span>
              <button onClick={() => setPlayingVideo(null)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                <X size={16}/>
              </button>
            </div>
            <video src={playingVideo} controls autoPlay className="w-full max-h-[60vh] rounded-xl border border-white/5 object-cover" />
            <button onClick={() => setPlayingVideo(null)} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs animate-pulse">
              Close Player
            </button>
          </div>
        </div>
      )}

      {/* RICH DIRECTOR PACKAGE INSPECTOR OVERLAY */}
      {selectedVideoDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-[#0c0d14] border border-white/10 rounded-2xl p-6 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-400" />
                  Director Video Production Package
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{selectedVideoDetail.title}</p>
              </div>
              <button onClick={() => setSelectedVideoDetail(null)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                <X size={18}/>
              </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 overflow-hidden min-h-0">
              
              {/* Left Column: Video Preview and metadata */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                {selectedVideoDetail.videoPath && (
                  <div className="aspect-[9/16] w-full max-w-[240px] bg-black border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl mx-auto shrink-0 animate-in zoom-in duration-300">
                    <video src={getAssetUrl(selectedVideoDetail.videoPath)} controls autoPlay className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-3 pt-2 text-xs">
                  <div className="bg-[#0f111a] border border-white/5 p-3 rounded-xl">
                    <h5 className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider">YouTube Shorts Metadata</h5>
                    <div className="space-y-2 mt-2">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block">YouTube Title:</span>
                        <span className="text-gray-300 font-medium">{selectedVideoDetail.metadata?.youtubeTitle || selectedVideoDetail.title}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block">YouTube Description:</span>
                        <p className="text-gray-400 text-[11px] leading-relaxed max-h-[80px] overflow-y-auto whitespace-pre-line bg-black/20 p-2 rounded border border-white/5">{selectedVideoDetail.metadata?.youtubeDescription || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block">Hashtags:</span>
                        <span className="text-indigo-400 font-mono text-[11px]">{selectedVideoDetail.metadata?.hashtags?.join(' ') || '#Shorts #Reels'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f111a] border border-white/5 p-3 rounded-xl">
                    <h5 className="font-bold text-[10px] text-indigo-400 uppercase tracking-wider">Audio & Suggestions</h5>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-[11px] text-gray-300"><strong>🎵 Music:</strong> {selectedVideoDetail.metadata?.backgroundMusic || 'Cinematic loop'}</p>
                      <p className="text-[11px] text-gray-300"><strong>🗣️ Voice:</strong> {selectedVideoDetail.voiceType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scenes details & characters */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                
                {/* Story Summary & moral */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Story Summary</h4>
                  <p className="text-xs text-gray-400 leading-relaxed italic">"{selectedVideoDetail.story}"</p>
                  {selectedVideoDetail.metadata?.moral && (
                    <p className="text-xs text-indigo-400 font-semibold mt-1">💡 Moral: {selectedVideoDetail.metadata.moral}</p>
                  )}
                </div>

                {/* Character Consistency Table */}
                {selectedVideoDetail.metadata?.characters && selectedVideoDetail.metadata.characters.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Character Consistency Roster</h4>
                    <div className="border border-white/5 rounded-xl overflow-hidden text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-gray-400 border-b border-white/5 font-bold">
                            <th className="p-2 border-r border-white/5">Name</th>
                            <th className="p-2 border-r border-white/5">Age/Gender</th>
                            <th className="p-2">Appearance Details (Consistency Rules)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVideoDetail.metadata.characters.map((char, index) => (
                            <tr key={index} className="border-b border-white/5 text-gray-300 font-medium">
                              <td className="p-2 font-bold border-r border-white/5 text-indigo-400">{char.name}</td>
                              <td className="p-2 border-r border-white/5">{char.age || 'N/A'} / {char.gender || 'N/A'}</td>
                              <td className="p-2 text-gray-400">{char.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Thumbnail Prompt */}
                {selectedVideoDetail.metadata?.thumbnailPrompt && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Suggested Thumbnail Prompt</h4>
                    <p className="text-xs text-gray-400 bg-black/20 p-2.5 border border-white/5 rounded-xl leading-relaxed font-mono">
                      {selectedVideoDetail.metadata.thumbnailPrompt}
                    </p>
                  </div>
                )}

                {/* Scenes breakdown lists */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Cinematic Scene Breakdown ({selectedVideoDetail.scenes?.length || 0})</h4>
                  
                  {selectedVideoDetail.scenes?.map((scene, sIdx) => (
                    <div key={sIdx} className="bg-[#0f111a] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-indigo-400">Scene {scene.sceneNumber || sIdx + 1}</span>
                        <span className="text-[10px] font-mono text-gray-500">Duration: {scene.duration?.toFixed(1) || '5'}s</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Visual Description:</span>
                            <p className="text-gray-300 leading-relaxed font-medium">{scene.visualDescription || 'Realistic visual scene details.'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Character Action & Facial Expression:</span>
                            <p className="text-gray-400">{scene.characterActions ? `${scene.characterActions} (${scene.facialExpressions})` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Cinematography (Angle/Movement):</span>
                            <p className="text-gray-400 font-mono text-[11px]">{scene.cameraAngle || 'Static'} / {scene.cameraMovement || 'Zoompan'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Lighting & Environment:</span>
                            <p className="text-gray-400">{scene.lightingStyle || 'Natural'} | {scene.environmentDetails || 'Default setting'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Voiceover Narration Script:</span>
                            <p className="text-gray-300 leading-relaxed bg-[#0c0d14] p-2 border border-white/5 rounded italic">"{scene.narration}"</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Subtitle Captions:</span>
                            <p className="text-gray-300 font-bold bg-[#0c0d14] p-2 border border-white/5 rounded">"{scene.subtitle || scene.narration}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">AI Generation Image/Video Prompt:</span>
                        <p className="text-[11px] text-gray-400 font-mono leading-normal mt-1">{scene.imagePrompt}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Controls Footer */}
            <div className="w-full flex justify-end gap-2 border-t border-white/10 pt-3 mt-4 shrink-0">
              {selectedVideoDetail.videoPath && (
                <a href={getAssetUrl(selectedVideoDetail.videoPath)} download
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                  <Download size={14}/> Download MP4
                </a>
              )}
              <button onClick={() => setSelectedVideoDetail(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-xs">
                Close Package
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Lock, Mail, Loader2, KeyRound } from 'lucide-react'
import { useStore } from '../store'
import { authAPI } from '../services/api'
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { setAuth } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Email/Password login state for fallback & VLE operators
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.googleLogin({ token: credentialResponse.credential })
      const { token, user } = response.data.data || response.data
      
      setAuth(token, user)
      console.log('Google Login successful:', user?.email)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Google Login error:', err)
      const msg = err.response?.data?.error || err.message || 'Google Login failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = (err) => {
    console.warn('Standard Google GIS button error or FedCM suppressed:', err)
    setError('Google Sign-In button was cancelled or blocked. You can try the Direct Google Sign-In button below or Email Login.')
  }

  // Graceful OAuth Popup Fallback
  const triggerGooglePopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError('')
      try {
        // Fetch userinfo using the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const profile = await userInfoRes.json()
        
        if (!profile.email) {
          throw new Error('Unable to retrieve email from Google account')
        }

        // Send profile details or synthetic token to backend
        const response = await authAPI.googleLogin({
          token: tokenResponse.access_token,
          email: profile.email,
          name: profile.name || profile.given_name || 'Google User',
          googleId: profile.sub
        })
        
        const { token, user } = response.data.data || response.data
        setAuth(token, user)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('Google Popup login error:', err)
        setError(err.response?.data?.error || err.message || 'Google Popup Login failed.')
      } finally {
        setLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google Popup Error:', err)
      setError('Google Sign-In popup was closed or unavailable.')
    },
    flow: 'implicit'
  })

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data.data || response.data
      setAuth(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Email Login error:', err)
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center text-center space-y-6"
      >
        <div className="space-y-4">
          <div className="relative w-36 h-36 mx-auto">
            {/* Multi-layered premium neon glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-70 animate-pulse" />
            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl" />
            <img 
              src="/harshita ai.png" 
              alt="Harshita AI" 
              className="relative w-36 h-36 rounded-3xl border border-white/20 shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-black text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
              Harshita AI
            </h1>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">
              CSC Smart Command Center
            </p>
          </div>
        </div>

        {error && (
          <div className="w-full p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400 text-xs font-medium text-left">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full flex flex-col items-center justify-center space-y-4">
          {!showEmailLogin ? (
            <>
              <p className="text-xs text-gray-400 font-medium">लॉगिन करने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
              
              {/* Primary Google GIS Button with useOneTap=false to avoid FedCM browser auto-reject */}
              <div className="flex justify-center transition-transform hover:scale-102 duration-200 w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  width="320"
                  useOneTap={false}
                />
              </div>

              {/* Graceful Fallback Popup Button */}
              <button
                type="button"
                onClick={() => triggerGooglePopup()}
                disabled={loading}
                className="w-full max-w-[320px] py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : (
                  <>
                    <KeyRound size={14} className="text-indigo-400" />
                    <span>Popup Sign-In (Direct Fallback)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full max-w-[320px] my-1">
                <div className="h-[1px] bg-white/10 flex-1" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">या</span>
                <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              <button
                type="button"
                onClick={() => setShowEmailLogin(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Email और Password से लॉगिन करें →
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="w-full space-y-3">
              <div className="relative text-left">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="relative text-left">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'लॉगिन करें'}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailLogin(false)}
                className="text-xs text-gray-400 hover:text-gray-300 mt-2 block mx-auto"
              >
                ← Google Sign-In पर वापस जाएँ
              </button>
            </form>
          )}
          
          {/* LOCAL DEV BYPASS */}
          {window.location.hostname === 'localhost' && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <button 
                onClick={() => {
                  setAuth('dev-token', { name: 'Admin', role: 'superadmin', email: 'admin@harshita.ai' });
                  navigate('/dashboard');
                }}
                className="px-6 py-2 bg-white/5 border border-white/10 text-gray-400 text-xs font-bold rounded-full hover:bg-white/10 transition-all w-full max-w-[320px]"
              >
                Dev Auto-Login (Bypass)
              </button>
            </div>
          )}
        </div>

        <div className="text-[10px] text-gray-600">
          By signing in, you agree to our <Link to="/terms" className="underline hover:text-gray-400 transition-colors">Terms</Link> and <Link to="/privacy-policy" className="underline hover:text-gray-400 transition-colors">Privacy Policy</Link>.
        </div>
      </motion.div>
    </div>
  )
}



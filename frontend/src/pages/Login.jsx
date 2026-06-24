import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useStore } from '../store'
import { authAPI } from '../services/api'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { setAuth } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.googleLogin({ token: credentialResponse.credential })
      const { token, user } = response.data.data
      
      setAuth(token, user)
      console.log('Google Login successful')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Google Login error:', err)
      setError(err.response?.data?.error || 'Google Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Try again later.')
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center text-center space-y-8"
      >
        <div className="space-y-6">
          <div className="relative w-48 h-48 mx-auto">
            {/* Multi-layered premium neon glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-70 animate-pulse" />
            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl" />
            <img 
              src="/harshita ai.png" 
              alt="Harshita AI" 
              className="relative w-48 h-48 rounded-3xl border border-white/20 shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-black text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
              Harshita AI
            </h1>
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest">
              CSC Smart Command Center
            </p>
          </div>
        </div>

        {error && (
          <div className="w-full p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full flex flex-col items-center justify-center space-y-4">
          <p className="text-xs text-gray-400 font-medium">लॉगिन करने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
          
          <div className="flex justify-center transition-transform hover:scale-105 duration-300">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              shape="pill"
              size="large"
              width="320"
              useOneTap={true}
            />
          </div>
        </div>

        <div className="text-[10px] text-gray-600">
          By signing in, you agree to our Terms and Privacy Policy.
        </div>
      </motion.div>
    </div>
  )
}


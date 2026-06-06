import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useStore } from '../store'
import { authAPI } from '../services/api'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const { setAuth } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data.data
      
      // Update store with real data
      setAuth(token, user)
      
      console.log('Login successful, navigating...')
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      // Send the Google ID token to our backend
      const response = await authAPI.googleLogin({ token: credentialResponse.credential })
      const { token, user } = response.data.data
      
      setAuth(token, user)
      console.log('Google Login successful')
      navigate('/', { replace: true })
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
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src="/harshita ai.png" alt="Harshita AI" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-white">N-Dizi AI</h1>
          <p className="text-slate-400 mt-2">Premium Service Marketplace</p>
        </div>

        {/* Login form */}
        <div className="card p-8 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-heading font-bold mb-6 text-center text-white">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-600 border border-red-500 rounded-lg flex items-center gap-2 text-white font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vle@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <a href="#" className="text-maroon-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-gray-600 lg:w-1/4"></span>
            <span className="text-xs text-center text-gray-500 uppercase">or sign in with</span>
            <span className="w-1/5 border-b border-gray-600 lg:w-1/4"></span>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              useOneTap={false}
            />
          </div>
        </div>

        {/* Demo credentials removed */}
      </motion.div>
    </div>
  )
}

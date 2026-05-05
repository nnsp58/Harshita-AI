import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useStore } from '../store'
import { authAPI } from '../services/api'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-900 via-maroon-800 to-navy-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl mb-4">
            <Sparkles size={40} className="text-maroon-900" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white">Rawan</h1>
          <p className="text-gray-300 mt-2">20-armed Multi-Agent AI Platform</p>
        </div>

        {/* Login form */}
        <div className="card p-8">
          <h2 className="text-xl font-heading font-bold mb-6 text-center">VLE Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300">
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
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm text-center">
          <p className="font-medium mb-1">Demo Credentials</p>
          <p className="text-gray-300">Email: demo@csc.com</p>
          <p className="text-gray-300">Password: demo1234</p>
        </div>
      </motion.div>
    </div>
  )
}

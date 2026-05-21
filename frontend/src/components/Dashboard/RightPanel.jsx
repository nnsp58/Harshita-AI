import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Upload, User, Bot } from 'lucide-react'
import { useStore } from '../../store'

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-maroon-500 to-gold-500 flex items-center justify-center shrink-0">
        <Bot size={12} className="text-white" />
      </div>
      <div className="flex items-center gap-1 ml-2">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}

export default function RightPanel({ messages, onSendCommand, isConnected }) {
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useStore()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.type === 'ai' || lastMsg.type === 'system') {
        setIsThinking(false)
      }
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const success = onSendCommand(input.trim())
    if (success !== false) {
      setIsThinking(true)
    }
    setInput('')
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0b10] border-l border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Command Center</h2>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8">
            <Bot size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-xs text-gray-500">Send a command to start chatting with Harshita AI</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages && messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type !== 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-maroon-500 to-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                msg.type === 'user'
                  ? 'bg-maroon-600 text-white rounded-br-none'
                  : msg.type === 'system'
                  ? 'bg-navy-800/50 text-navy-200 border border-navy-700/50'
                  : 'bg-white/5 text-gray-300 rounded-bl-none'
              }`}>
                <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                <span className="text-[9px] text-gray-500 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.type === 'user' && (
                <div className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={12} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isThinking && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload zone */}
      <div className="px-3 py-2 border-t border-white/5">
        <div className="border border-dashed border-white/20 rounded-lg p-2 flex items-center justify-center gap-2 hover:border-maroon-500/50 transition-colors cursor-pointer">
          <Upload size={12} className="text-gray-500" />
          <span className="text-[10px] text-gray-500">Drop files here</span>
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command... / Hindi mein likhen..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-maroon-500/50 transition-colors"
            />
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors relative group"
            title="Coming Soon"
          >
            <Mic size={16} className="text-gray-500" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-800 text-[9px] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Coming Soon
            </span>
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-maroon-600 hover:bg-maroon-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}

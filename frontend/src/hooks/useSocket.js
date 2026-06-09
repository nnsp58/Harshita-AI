import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.PROD ? window.location.origin : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001')

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('logUpdate', (data) => {
      // Server echoes user commands back as { type: 'user', message: cmd }.
      // sendCommand() already added the user message locally, so skip the echo
      // to prevent duplicate user bubbles in chat.
      if (data && data.type === 'user') return
      const msg = {
        id: Date.now() + Math.random(),
        type: data.type || 'ai',
        message: data.message || data.text || '',
        timestamp: new Date().toISOString(),
        action: data.action || null,
      }
      setMessages((prev) => [...prev, msg])
    })

    socket.on('job_update', (data) => {
      const msg = {
        id: Date.now() + Math.random(),
        type: 'system',
        message: `Job update: ${data.status || 'processing'}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, msg])
    })

    socket.on('notification', (data) => {
      const msg = {
        id: Date.now() + Math.random(),
        type: 'system',
        message: data.message || 'New notification',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, msg])
    })

    socket.on('job_progress', (data) => {
      const msg = {
        id: Date.now() + Math.random(),
        type: 'system',
        message: `Progress: ${data.progress || 0}% - ${data.message || ''}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const sendCommand = useCallback((cmd) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('userCommand', cmd)
      const userMsg = {
        id: Date.now() + Math.random(),
        type: 'user',
        message: cmd,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      return true
    }
    return false
  }, [])

  return { socket: socketRef.current, isConnected, sendCommand, messages, setMessages }
}

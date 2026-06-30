import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useStore } from '../store'
import { isDocumentType } from '../utils/DocumentClassifier'

const SOCKET_URL = import.meta.env.PROD ? window.location.origin : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001')

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [socketInstance, setSocketInstance] = useState(null)
  const socketRef = useRef(null)
  const { setCurrentDocument, setResponseMode } = useStore()

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
    setTimeout(() => setSocketInstance(socket), 0)

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('logUpdate', (data) => {
      if (data && data.type === 'user') return
      const text = data.message || data.text || ''
      const msg = {
        id: Date.now() + Math.random(),
        type: data.type || 'ai',
        message: text,
        timestamp: new Date().toISOString(),
        action: data.action || null,
        interactionId: data.interactionId || null,
      }
      // Do not push the message immediately if it might be a document
      // setMessages((prev) => [...prev, msg])

      // Auto routing / self healing: Detect if response is a document
      let isDocument = false;
      if ((data.type === 'ai' || !data.type) && text.length > 100) {
        const containsDocumentKeywords = isDocumentType(text) || 
          text.includes('AFFIDAVIT') || 
          text.includes('शपथ पत्र') || 
          text.includes('RENT AGREEMENT') || 
          text.includes('LEGAL NOTICE') || 
          text.includes('GIFT DEED') ||
          text.includes('WILL') ||
          text.includes('NOC') ||
          text.includes('APPLICATION') ||
          text.includes('प्रार्थना पत्र') ||
          text.includes('AGREEMENT') ||
          text.includes('RESUME') ||
          text.includes('INVOICE') ||
          text.includes('REPORT') ||
          text.includes('COMPLAINT') ||
          text.includes('REPRESENTATION') ||
          text.includes('UNDERTAKING') ||
          text.includes('DRAFT') ||
          text.includes('मसौदा') ||
          text.includes('अभ्यावेदन') ||
          text.includes('शिकायत') ||
          text.includes('आवेदन');

        if (containsDocumentKeywords) {
          isDocument = true;
          // Extract title (first line or a clean default title)
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          let title = 'Legal Document';
          if (lines.length > 0) {
            title = lines[0].replace(/[#*=_]/g, '').trim().substring(0, 50);
          }
          
          const cleanContent = text;
          
          // Re-route to A4 Document Workspace
          setCurrentDocument({
            title: title || 'Generated Document',
            content: cleanContent,
            type: title.toLowerCase().includes('notice') ? 'notice' : 'document',
            timestamp: new Date().toISOString()
          });
          setResponseMode('DOCUMENT');

          // Add a notification bubble to let the user know
          const notifyMsg = {
            id: Date.now() + Math.random(),
            type: 'system',
            message: '✅ Document Generated Successfully. Opening A4 Workspace...',
            timestamp: new Date().toISOString()
          };
          setMessages((prev) => [...prev, notifyMsg]);
        }
      }

      if (!isDocument) {
        setMessages((prev) => [...prev, msg]);
      }

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
      setSocketInstance(null)
    }
  }, [setCurrentDocument, setResponseMode])

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

  const submitFeedback = useCallback((interactionId, rating, comment = '') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('submitFeedback', { interactionId, rating, comment })
      return true
    }
    return false
  }, [])

  const sendData = useCallback((eventName, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, data)
      return true
    }
    return false
  }, [])

  return { socket: socketInstance, isConnected, sendCommand, submitFeedback, sendData, messages, setMessages }
}

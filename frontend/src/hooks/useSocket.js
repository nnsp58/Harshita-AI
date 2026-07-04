import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useStore } from '../store'
import { isDocumentType, classifyDocumentCategory, getDocumentTitle } from '../utils/DocumentClassifier'

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

      // Rule 2 (Clarification) & Rule 9 (Error): pass type through unchanged
      const msgType = data.type || 'ai';
      const msg = {
        id: Date.now() + Math.random(),
        type: msgType,
        message: text,
        retryable: data.retryable || false,
        timestamp: new Date().toISOString(),
        action: data.action || null,
        interactionId: data.interactionId || null,
      }

      // PRD-021: Enhanced Document Auto-Routing (only for 'ai' type messages)
      let isDocument = false;
      if (msgType === 'ai' && text.length > 100) {
        const docClassification = classifyDocumentCategory(text);
        
        if (docClassification.isDocument || isDocumentType(text)) {
          isDocument = true;
          const title = docClassification.title || getDocumentTitle(text);
          
          setCurrentDocument({
            title: title || 'Generated Document',
            content: text,
            type: docClassification.category || 'document',
            category: docClassification.category,
            timestamp: new Date().toISOString()
          });
          setResponseMode('DOCUMENT');

          // Rule 6: Save to History
          try {
            const history = JSON.parse(localStorage.getItem('harshita_doc_history') || '[]');
            history.unshift({
              id: `doc-${Date.now()}`,
              title: title || 'Generated Document',
              type: docClassification.category || 'document',
              date: new Date().toISOString(),
              status: 'Generated',
            });
            // Keep last 50
            localStorage.setItem('harshita_doc_history', JSON.stringify(history.slice(0, 50)));
          } catch (_) {}

          setMessages((prev) => [...prev, {
            id: Date.now() + Math.random(),
            type: 'system',
            message: `✅ Document Generated Successfully.\n📄 ${title}\nOpening A4 Workspace...`,
            timestamp: new Date().toISOString()
          }]);
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

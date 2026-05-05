import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for uncaught errors
window.onerror = function(msg, url, line) {
  console.log('Global error:', msg, 'at line:', line)
  return false
}

// Catch promise rejections
window.addEventListener('unhandledrejection', function(e) {
  console.log('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

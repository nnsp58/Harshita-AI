import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import WorkspaceDashboard from './components/Dashboard/WorkspaceDashboard'
import Login from './pages/Login'
import Settings from './pages/Settings'
import Subscription from './pages/Subscription'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Documents from './pages/Documents'
import Candidates from './pages/Candidates'
import BulkImport from './pages/BulkImport'
import ResumeBuilder from './pages/ResumeBuilder'
import TADAForm from './pages/TADAForm'
import LegalDraft from './pages/LegalDraft'
import ITRFiling from './pages/ITRFiling'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkspaceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-import"
          element={
            <ProtectedRoute>
              <BulkImport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tada"
          element={
            <ProtectedRoute>
              <TADAForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal-draft"
          element={
            <ProtectedRoute>
              <LegalDraft />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itr-filing"
          element={
            <ProtectedRoute>
              <ITRFiling />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

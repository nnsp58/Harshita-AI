import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import WorkspaceDashboard from './components/Dashboard/WorkspaceDashboard'
import SimpleDashboard from './pages/SimpleDashboard'
import UpgradeNotification from './components/UpgradeNotification'
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
import TADANaksha from './pages/TADANaksha'
import LegalDraft from './pages/LegalDraft'
import LegalNotice from './pages/LegalNotice'
import ITRFiling from './pages/ITRFiling'
import ServicePage from './pages/ServicePage'
import AdvocateProfile from './pages/AdvocateProfile'
import ContactUs from './pages/ContactUs'

// Admin pages
import ControlDashboard from './pages/admin/ControlDashboard'
import UsersControl from './pages/admin/UsersControl'
import SkillsControl from './pages/admin/SkillsControl'
import LearningInsights from './pages/admin/LearningInsights'
import SystemHealth from './pages/admin/SystemHealth'
import CscDashboard from './pages/admin/CscDashboard'
import VleDashboard from './pages/admin/VleDashboard'

// Role-based admin route
function AdminRoute({ children, allow }) {
  const { isAuthenticated, user } = useStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const role = user?.role || 'operator'
  if (allow && !allow.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'csc_admin') return <Navigate to="/admin/csc" replace />
    if (role === 'operator') return <Navigate to="/admin/vle" replace />
    return <Navigate to="/" replace />
  }
  return children
}

// /admin → smart redirect to role-specific landing page
function AdminRedirect() {
  const { user } = useStore()
  const role = user?.role || 'operator'
  if (role === 'superadmin') return <Navigate to="/admin/control" replace />
  if (role === 'csc_admin') return <Navigate to="/admin/csc" replace />
  return <Navigate to="/admin/vle" replace />
}

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
      <UpgradeNotification />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace"
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
              <TADANaksha />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tada-naksha"
          element={
            <ProtectedRoute>
              <TADANaksha />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tada-old"
          element={
            <ProtectedRoute>
              <TADAForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal-draft"
          element={<LegalDraft />}
        />
        <Route
          path="/legal-notice"
          element={
            <ProtectedRoute>
              <LegalNotice />
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

        {/* Generic service page — handles form-filling, job-search, ration-card, whatsapp, ai-assistant, document-ocr */}
        <Route
          path="/service/:serviceId"
          element={
            <ProtectedRoute>
              <ServicePage />
            </ProtectedRoute>
          }
        />
        {/* ═══════ Admin Dashboards ═══════ */}
        {/* Superadmin only */}
        <Route path="/admin/control" element={<AdminRoute allow={['superadmin']}><ControlDashboard /></AdminRoute>} />
        <Route path="/admin/control/users" element={<AdminRoute allow={['superadmin']}><UsersControl /></AdminRoute>} />
        <Route path="/admin/control/skills" element={<AdminRoute allow={['superadmin', 'csc_admin']}><SkillsControl /></AdminRoute>} />
        <Route path="/admin/control/learning" element={<AdminRoute allow={['superadmin']}><LearningInsights /></AdminRoute>} />
        <Route path="/admin/control/health" element={<AdminRoute allow={['superadmin']}><SystemHealth /></AdminRoute>} />

        {/* CSC Admin (or superadmin) */}
        <Route path="/admin/csc" element={<AdminRoute allow={['csc_admin', 'superadmin']}><CscDashboard /></AdminRoute>} />
        <Route path="/admin/csc/operators" element={<AdminRoute allow={['csc_admin', 'superadmin']}><CscDashboard /></AdminRoute>} />

        {/* VLE / Operator (any authenticated user) */}
        <Route path="/admin/vle" element={<AdminRoute><VleDashboard /></AdminRoute>} />

        {/* Smart redirect: /admin → role-based landing */}
        <Route path="/admin" element={<AdminRoute><AdminRedirect /></AdminRoute>} />

        {/* Advocate Profile (for legal notice letterhead) */}
        <Route path="/advocate-profile" element={<ProtectedRoute><AdvocateProfile /></ProtectedRoute>} />

        {/* Contact Us Form */}
        <Route path="/contact" element={<ContactUs />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

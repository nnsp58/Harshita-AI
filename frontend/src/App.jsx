import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'

import UpgradeNotification from './components/UpgradeNotification'
import DashboardSaaS from './pages/DashboardSaaS'
import Login from './pages/Login'

// Lazy load other pages
const WorkspaceDashboard = lazy(() => import('./components/Dashboard/WorkspaceDashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Subscription = lazy(() => import('./pages/Subscription'))
const Home = lazy(() => import('./pages/Home'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Documents = lazy(() => import('./pages/Documents'))
const Candidates = lazy(() => import('./pages/Candidates'))
const BulkImport = lazy(() => import('./pages/BulkImport'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const TADAForm = lazy(() => import('./pages/TADAForm'))
const TADANaksha = lazy(() => import('./pages/TADANaksha'))
const LegalDraft = lazy(() => import('./pages/LegalDraft'))
const LegalNotice = lazy(() => import('./pages/LegalNotice'))
const ITRFiling = lazy(() => import('./pages/ITRFiling'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const AdvocateProfile = lazy(() => import('./pages/AdvocateProfile'))
const ContactUs = lazy(() => import('./pages/ContactUs'))

// Admin pages
const ControlDashboard = lazy(() => import('./pages/admin/ControlDashboard'))
const UsersControl = lazy(() => import('./pages/admin/UsersControl'))
const SkillsControl = lazy(() => import('./pages/admin/SkillsControl'))
const LearningInsights = lazy(() => import('./pages/admin/LearningInsights'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'))
const CscDashboard = lazy(() => import('./pages/admin/CscDashboard'))
const VleDashboard = lazy(() => import('./pages/admin/VleDashboard'))

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
      <Suspense fallback={
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardSaaS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSaaS />
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App

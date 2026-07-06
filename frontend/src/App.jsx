import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useStore } from './store'

import UpgradeNotification from './components/UpgradeNotification'
import SimpleDashboard from './pages/SimpleDashboard'
import DashboardSaaS from './pages/DashboardSaaS'
import Login from './pages/Login'
import PublicHome from './pages/PublicHome'

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
const StoryVideoDashboard = lazy(() => import('./pages/StoryVideoDashboard'))

// AdSense Content & SEO Pages
const ToolLanding = lazy(() => import('./pages/ToolLanding'))
const SeoArticle = lazy(() => import('./pages/SeoArticle'))
const BlogList = lazy(() => import('./pages/BlogList'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const FaqList = lazy(() => import('./pages/FaqList'))
const HarshitaAiInfo = lazy(() => import('./pages/HarshitaAiInfo'))

// NEW: AdSense Phase Pages
const AboutUs = lazy(() => import('./pages/public/AboutUs'))
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/public/TermsConditions'))
const Disclaimer = lazy(() => import('./pages/public/Disclaimer'))
const RefundPolicy = lazy(() => import('./pages/public/RefundPolicy'))
const CookiePolicy = lazy(() => import('./pages/public/CookiePolicy'))
const CopyrightPolicy = lazy(() => import('./pages/public/CopyrightPolicy'))
const CommunityGuidelines = lazy(() => import('./pages/public/CommunityGuidelines'))
const HelpCenter = lazy(() => import('./pages/public/HelpCenter'))
const Pricing = lazy(() => import('./pages/public/Pricing'))
const Features = lazy(() => import('./pages/public/Features'))
const AiSkills = lazy(() => import('./pages/public/AiSkills'))
const Services = lazy(() => import('./pages/public/Services'))
const Careers = lazy(() => import('./pages/public/Careers'))
const ReleaseNotes = lazy(() => import('./pages/public/ReleaseNotes'))
const Changelog = lazy(() => import('./pages/public/Changelog'))

// Admin pages
const ControlDashboard = lazy(() => import('./pages/admin/ControlDashboard'))
const UsersControl = lazy(() => import('./pages/admin/UsersControl'))
const SkillsControl = lazy(() => import('./pages/admin/SkillsControl'))
const LearningInsights = lazy(() => import('./pages/admin/LearningInsights'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'))
const CscDashboard = lazy(() => import('./pages/admin/CscDashboard'))
const VleDashboard = lazy(() => import('./pages/admin/VleDashboard'))
const SelfHealingCenter = lazy(() => import('./pages/admin/SelfHealingCenter'))
const DeveloperCenter = lazy(() => import('./pages/admin/DeveloperCenter'))
const AcademyDashboard = lazy(() => import('./pages/AcademyDashboard'))
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'))
const SystemControl = lazy(() => import('./pages/admin/SystemControl'))


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
  const { logout } = useStore();

  React.useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      window.location.href = '/login';
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <UpgradeNotification />
      <Suspense fallback={
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicHome />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSaaS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-old"
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
          <Route
            path="/story-video"
            element={
              <ProtectedRoute>
                <StoryVideoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academy"
            element={
              <ProtectedRoute>
                <AcademyDashboard />
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
          <Route path="/admin/control/self-healing" element={<AdminRoute allow={['superadmin']}><SelfHealingCenter /></AdminRoute>} />
          <Route path="/admin/control/developer-center" element={<AdminRoute allow={['superadmin']}><DeveloperCenter /></AdminRoute>} />
          <Route path="/admin/control/learning" element={<AdminRoute allow={['superadmin']}><LearningInsights /></AdminRoute>} />
          <Route path="/admin/control/health" element={<AdminRoute allow={['superadmin']}><SystemHealth /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute allow={['superadmin']}><AnalyticsDashboard /></AdminRoute>} />
          <Route path="/admin/system" element={<AdminRoute allow={['superadmin']}><SystemControl /></AdminRoute>} />

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

          {/* AdSense SEO & Content Routes */}
          <Route path="/faq" element={<FaqList />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/seo/:slug" element={<SeoArticle />} />
          <Route path="/tools/:slug" element={<ToolLanding />} />
          <Route path="/harshita-ai" element={<HarshitaAiInfo />} />
          
          {/* Money Page Aliases */}
          <Route path="/affidavit-generator" element={<ToolLanding />} />
          <Route path="/legal-notice-generator" element={<ToolLanding />} />
          <Route path="/prarthna-patra-writer" element={<ToolLanding />} />
          <Route path="/rent-agreement-generator" element={<ToolLanding />} />
          <Route path="/gift-deed-generator" element={<ToolLanding />} />
          <Route path="/partition-deed-generator" element={<ToolLanding />} />
          <Route path="/power-of-attorney-generator" element={<ToolLanding />} />
          <Route path="/will-generator" element={<ToolLanding />} />
          <Route path="/noc-generator" element={<ToolLanding />} />

          {/* New AdSense/SEO Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/copyright" element={<CopyrightPolicy />} />
          <Route path="/community" element={<CommunityGuidelines />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/ai-skills" element={<AiSkills />} />
          <Route path="/services" element={<Services />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/changelog" element={<Changelog />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </HelmetProvider>
  )
}

export default App

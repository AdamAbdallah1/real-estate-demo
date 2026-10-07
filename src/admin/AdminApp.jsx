import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { SITE_HOME } from '../lib/basePath'
import AdminLayout, { AccessDenied, FullScreenStatus } from './AdminLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyEditorPage from './pages/PropertyEditorPage'
import InquiriesPage from './pages/InquiriesPage'
import ViewingsPage from './pages/ViewingsPage'
import SellerLeadsPage from './pages/SellerLeadsPage'
import EditorialPage from './pages/EditorialPage'
import ContentPage from './pages/ContentPage'
import SettingsPage from './pages/SettingsPage'
import { Button, PageHeader } from './components/ui'

/**
 * Authorization boundary.
 * UI state is only a guard for navigation; Firestore Security Rules decide
 * what this account may actually read or write.
 */
function Protected() {
  const { status, logout, error } = useAuth()
  const location = useLocation()

  if (status === 'loading' || status === 'authorizing') {
    return <FullScreenStatus label="CHECKING ACCESS…" />
  }
  if (status === 'unauthenticated') {
    // Router path: the address bar shows `/demo/nara-realestate/admin-login`.
    return <Navigate to="/admin-login" state={{ from: location }} replace />
  }
  if (status === 'signedIn') {
    return <AccessDenied onLogout={logout} error={error} />
  }
  return <AdminLayout />
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader title="Page not found" subtitle="That CMS address does not exist." />
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/admin')}>BACK TO OVERVIEW</Button>
        <a href={SITE_HOME} className="inline-flex items-center border border-line px-4 py-2.5 text-[11px] tracking-[0.18em] text-ink hover:border-ink">BACK TO SITE</a>
      </div>
    </div>
  )
}

/**
 * `/admin-login` — the single sign-in screen, mounted on its own route so the
 * CMS has exactly one login URL (`/demo/nara-realestate/admin-login`) and no
 * `login` page hiding inside the protected namespace.
 */
export function AdminLoginPage() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}

/** /admin/* — lazy chunk so the public site never pays for the CMS bundle. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Protected />}>
          <Route index element={<OverviewPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/new" element={<PropertyEditorPage />} />
          <Route path="properties/:id" element={<PropertyEditorPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="viewings" element={<ViewingsPage />} />
          <Route path="seller-leads" element={<SellerLeadsPage />} />
          <Route path="editorial" element={<EditorialPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { I18nProvider } from './i18n/provider'

// The CMS is code-split: the public website never downloads Firebase Auth or
// the admin bundle during its first paint.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

/**
 * Public site everywhere (English at /, Arabic at /ar); the CMS only under
 * /admin/*. The language provider sits above both so a single <html lang dir>
 * decision covers the whole application.
 */
export default function AppRoutes() {
  return (
    <I18nProvider>
      <Routes>
        <Route
          path="/admin/*"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <AdminApp />
            </Suspense>
          )}
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </I18nProvider>
  )
}

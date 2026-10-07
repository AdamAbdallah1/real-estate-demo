import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { I18nProvider } from './i18n/provider'

// The CMS is code-split: the public website never downloads Firebase Auth or
// the admin bundle during its first paint. Both admin entry points resolve to
// the same cached chunk, so the standalone login route costs nothing extra.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const AdminLoginPage = lazy(() =>
  import('./admin/AdminApp.jsx').then((m) => ({ default: m.AdminLoginPage })),
)

/**
 * Everything NARA lives under one namespace. The router's `basename` (set in
 * `main.jsx`) is the Vite base itself, so the paths below are NARA-local and
 * the address bar always shows them one level down:
 *
 *   /                       → /demo/nara-realestate/            public English
 *   /ar/                    → /demo/nara-realestate/ar/         public Arabic
 *   /admin-login            → /demo/nara-realestate/admin-login CMS sign-in
 *   /admin/*                → /demo/nara-realestate/admin/*     CMS pages
 *
 * There is no origin-root `/admin/*`, and `/ar` only ever exists directly
 * after the base for the public site — the CMS namespace never inherits it.
 * The language provider sits above both so a single <html lang dir> decision
 * covers the whole application.
 */
export default function AppRoutes() {
  return (
    <I18nProvider>
      <Routes>
        <Route
          path="/admin-login"
          element={(
            <Suspense fallback={<RouteFallback />}>
              <AdminLoginPage />
            </Suspense>
          )}
        />
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './AppRoutes.jsx'
import { misplacedArPrefixTarget } from './i18n/locale.js'
import { SITE_BASE } from './lib/basePath.js'

/**
 * Legacy links used to write `/ar` *in front of* the deployment base
 * (`/ar/demo/nara-realestate/...`). That URL sits outside the router's
 * basename, so <Router> would render nothing at all — repair the address bar
 * here, before React mounts. (dev/preview and Vercel redirect this shape
 * server-side too; this is the safety net for any host that just serves the
 * shell.)
 */
try {
  const repaired = misplacedArPrefixTarget(window.location.pathname)
  if (repaired) {
    window.history.replaceState(
      window.history.state,
      '',
      `${repaired}${window.location.search}${window.location.hash}`,
    )
  }
} catch {
  /* history unavailable (file://, hardened browser) — the server redirect still covers it */
}

/**
 * The router's basename *is* the Vite base, so every route in the app is
 * written NARA-local (`/`, `/ar/`, `/admin-login`, `/admin/*`) while the
 * address bar always shows `/demo/nara-realestate/...`. That is what keeps the
 * CMS inside the NARA namespace instead of at the origin root, and it means a
 * stray root-level `/admin` can never resolve to this application.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={SITE_BASE || '/'}>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)

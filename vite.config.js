import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * The whole NARA application — public site *and* CMS — sits under the Vite
 * base, so `vite dev` and `vite preview` already hand out the app shell for
 * `/demo/nara-realestate/admin-login` and `/demo/nara-realestate/admin/...`
 * with no help from this file. Origin-root `/admin/*` deliberately does *not*
 * resolve to this app (there is no root-level NARA admin), and nothing needs
 * to be served from outside the base any more.
 *
 * The single leftover is the pre-fix shape with `/ar` written *in front of*
 * the base (`/ar/demo/nara-realestate/...`): that URL lives outside the base,
 * so instead of a shell the server sends the corrected address — the client
 * repairs it too in `main.jsx`, for hosts that only serve a shell.
 *
 * Only what the *server reads* is examined; the request itself is answered
 * with a redirect, never with rewritten content.
 */
function legacyArRedirect() {
  let base = '/demo/nara-realestate/'

  const corrected = (req) => {
    const basePrefix = base.length > 1 ? base.replace(/\/+$/, '') : ''
    if (!basePrefix) return null
    const [path, query] = (req.url || '').split('?')
    const prefix = `/ar${basePrefix}`
    if (path !== prefix && !path.startsWith(`${prefix}/`)) return null

    let rest = path.slice(prefix.length)
    if (rest === '/ar' || rest === '/ar/') rest = ''          // collapse a duplicated /ar
    else if (rest.startsWith('/ar/')) rest = rest.slice(3)

    const target = rest.startsWith('/admin')
      ? `${basePrefix}${rest}`                                 // legacy admin link, no /ar
      : `${basePrefix}/ar${rest || '/'}`                       // public page, /ar behind the base
    return query ? `${target}?${query}` : target
  }

  const redirect = (req, res) => {
    const target = corrected(req)
    if (!target) return false
    res.statusCode = 302
    res.setHeader('Location', target)
    res.end()
    return true
  }

  return {
    name: 'nara:legacy-ar-redirect',
    configResolved(config) {
      base = config.base || '/'
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!redirect(req, res)) next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!redirect(req, res)) next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacyArRedirect(),
  ],
  base: '/demo/nara-realestate/',
  build: {
    outDir: 'dist/demo/nara-realestate',
    emptyOutDir: true
  }
})
